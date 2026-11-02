from types import SimpleNamespace
from unittest.mock import Mock
import httpx
import pytest
from fastapi.testclient import TestClient
from openai import AuthenticationError, RateLimitError, APIConnectionError, APIStatusError
from backend import main

client = TestClient(main.app)
PAYLOAD = {'documento': 'Sample', 'versao_anterior': 'Old text', 'versao_atual': 'New text'}

@pytest.fixture
def provider(monkeypatch):
    monkeypatch.setenv('OPENAI_API_KEY', 'test-key-not-real')
    api = Mock()
    monkeypatch.setattr(main, 'OpenAI', Mock(return_value=api))
    api.responses.create.return_value = SimpleNamespace(status='completed', output_text='Updated sample text.')
    return api

def test_health_does_not_need_api_key(monkeypatch):
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    assert client.get('/health').json()['status'] == 'online'

def test_missing_key_does_not_call_provider(monkeypatch):
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    constructor = Mock()
    monkeypatch.setattr(main, 'OpenAI', constructor)
    assert client.post('/gerar-historico', json=PAYLOAD).status_code == 500
    constructor.assert_not_called()

def test_unchanged_text_skips_model(provider):
    result = client.post('/gerar-historico', json={**PAYLOAD, 'versao_atual': ' Old text '})
    assert result.json() == {'resumo': 'Nenhuma alteração identificada.'}
    provider.responses.create.assert_not_called()

def test_summary_and_request_contract(provider):
    result = client.post('/gerar-historico', json=PAYLOAD)
    assert result.status_code == 200
    assert result.json() == {'resumo': 'Updated sample text.'}
    request = provider.responses.create.call_args.kwargs
    assert request['store'] is False
    assert 'Old text' in request['input'] and 'New text' in request['input']

@pytest.mark.parametrize('status,text', [('incomplete','Partial.'), ('completed',''), ('completed','Unfinished')])
def test_invalid_model_output_is_rejected(provider, status, text):
    provider.responses.create.return_value = SimpleNamespace(status=status, output_text=text)
    assert client.post('/gerar-historico', json=PAYLOAD).status_code == 502

@pytest.mark.parametrize('payload', [{}, {**PAYLOAD, 'documento': ''}])
def test_invalid_input_does_not_call_provider(provider, payload):
    assert client.post('/gerar-historico', json=payload).status_code == 422
    provider.responses.create.assert_not_called()

@pytest.mark.parametrize('kind,expected', [('auth',401), ('rate',429), ('connection',503), ('status',502), ('unexpected',500)])
def test_provider_errors_are_mapped_without_leaking_details(provider, kind, expected):
    request = httpx.Request('POST', 'https://example.invalid')
    response = httpx.Response(503, request=request)
    exceptions = {
        'auth': AuthenticationError('private diagnostic', response=response, body=None),
        'rate': RateLimitError('private diagnostic', response=response, body=None),
        'connection': APIConnectionError(request=request),
        'status': APIStatusError('private diagnostic', response=response, body=None),
        'unexpected': RuntimeError('private diagnostic'),
    }
    provider.responses.create.side_effect = exceptions[kind]
    result = client.post('/gerar-historico', json=PAYLOAD)
    assert result.status_code == expected
    assert 'private diagnostic' not in result.text

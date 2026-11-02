import pytest
from evaluation.run import score

CASES=[{'id':'one','required_any':[['código'],['inclu','adicion']],'forbidden':['aprovado automaticamente']}, {'id':'two','required_any':[['beta']],'forbidden':[]}]


def test_term_checks_normalize_accents_and_accept_alternatives():
    result=score(CASES,[{'id':'one','summary':'Adicionado o codigo.'},{'id':'two','summary':'Responsável alterado para Beta.'}])
    assert result['valid_summary_rate']==1
    assert result['expected_term_coverage_rate']==1
    assert result['forbidden_term_hit_count']==0


def test_missing_response_counts_as_failure_and_forbidden_terms_are_flagged():
    result=score(CASES,[{'id':'one','summary':'Incluído código; aprovado automaticamente.'}])
    assert result['case_count']==2
    assert result['valid_summary_rate']==0.5
    assert result['forbidden_term_hit_count']==1


@pytest.mark.parametrize('responses',[[{'id':'unknown'}],[{'id':'one'},{'id':'one'}]])
def test_duplicate_and_unknown_ids_are_rejected(responses):
    with pytest.raises(ValueError):
        score(CASES,responses)

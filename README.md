# DocManager - Intelligent Document Management

Protótipo funcional de gestão documental com comparação de versões e geração assistida por inteligência artificial de históricos de alteração.

## Visão geral

O DocManager reúne um dashboard de documentos, editor de conteúdo, comparação visual entre versões e um recurso de IA que sugere um registro objetivo das alterações. A sugestão é revisada pelo usuário antes de ser inserida no histórico do documento.

## Funcionalidades

- Dashboard e biblioteca de documentos demonstrativos
- Edição de conteúdo e salvamento local de rascunhos
- Comparação visual por blocos de texto (adições e remoções)
- Resumo de alterações com OpenAI via API Python/FastAPI
- Tabela estruturada de histórico de alterações
- Publicação demonstrativa local

## Tecnologias

**Frontend:** React, JavaScript, CSS e Vite.  
**Backend:** Python, FastAPI e Pydantic.  
**IA:** OpenAI API (Responses API).

## Execução local

Requisitos: Node.js e Python 3.10+.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Crie `backend/.env` com base em `backend/.env.example`. Nunca publique sua chave.

```bash
python -m uvicorn main:app --reload --port 8000
```

API: http://localhost:8000/docs

### Frontend

Na raiz do projeto:

```bash
npm install
npm run dev
```

Acesse http://localhost:5173.

## Como funciona a IA

1. O usuário edita um documento.
2. O React envia as versões anterior e atual para `POST /gerar-historico`.
3. O FastAPI consulta a OpenAI com instruções para descrever somente alterações identificadas.
4. O usuário revisa a sugestão antes de inseri-la no documento.

## Limitações

Este repositório apresenta um protótipo, não um sistema em produção. O armazenamento é local no navegador, sem autenticação, banco centralizado, trilha permanente de auditoria ou aprovação real. O botão de publicação é demonstrativo.

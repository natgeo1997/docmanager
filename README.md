# DocManager

**Gestão documental, comparação de versões e inteligência artificial em uma aplicação web.**

O DocManager é um protótipo funcional que desenvolvi para explorar como a tecnologia pode simplificar processos de revisão e controle de documentos. A proposta é reunir edição, comparação de versões e elaboração do histórico de alterações em um único ambiente, com apoio de IA e validação humana.

## O que a aplicação faz

| Funcionalidade | Descrição |
| --- | --- |
| **Dashboard** | Visão geral de documentos, status e próximas revisões. |
| **Editor integrado** | Edição de conteúdo e salvamento local de rascunhos. |
| **Comparação de versões** | Destaque visual dos blocos de texto adicionados e removidos. |
| **Histórico com IA** | Sugestão de descrição das mudanças, baseada nas versões anterior e atual. |
| **Revisão humana** | O usuário pode conferir e editar o resumo antes de inseri-lo na tabela do documento. |
| **Publicação de teste** | Simulação local de atualização da versão publicada. |

## Demonstração

### Dashboard

Visão geral da gestão documental, com documentos, status e próximas revisões.

![Dashboard do DocManager](docs%202/images/dashboard.png)

### Histórico de alterações com IA

O editor apresenta a sugestão de histórico para revisão humana antes da inserção no documento.

![Histórico de alterações no DocManager](docs%202/images/historico-ia.png)

### Comparação de versões

Comparação visual entre versão publicada e rascunho, destacando textos adicionados e removidos.

![Comparação de versões do DocManager](docs%202/images/comparacao-versoes.png)

## Como funciona

```text
Usuário edita o documento no React
              ↓
Compara a versão publicada com o rascunho
              ↓
React envia os textos ao FastAPI (HTTP/JSON)
              ↓
FastAPI consulta a API da OpenAI
              ↓
O resumo retorna para revisão humana
              ↓
Usuário decide inserir na tabela de histórico
```

**O cuidado central do projeto:** a IA recebe instruções para relatar apenas alterações identificadas nos textos, sem acrescentar consequências presumidas. Como modelos de IA podem falhar, a sugestão permanece sujeita à validação do usuário.

## Tecnologias

- **React + JavaScript:** interface, editor e comparação de versões
- **CSS:** identidade visual e formatação dos documentos
- **Vite:** ambiente de desenvolvimento frontend
- **Python + FastAPI:** API própria e integração entre frontend e IA
- **OpenAI API:** análise e sugestão de histórico de alterações
- **localStorage:** armazenamento demonstrativo no navegador

## Executar localmente

Requisitos: **Node.js** e **Python 3.10+**.

**1. Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Crie o arquivo `backend/.env` a partir de `backend/.env.example` e configure sua própria chave da OpenAI. **Nunca faça commit de chaves reais.**

```bash
python -m uvicorn main:app --reload --port 8000
```

Documentação interativa da API: [localhost:8000/docs](http://localhost:8000/docs).

**2. Frontend** (em outro terminal, na raiz do projeto)

```bash
npm install
npm run dev
```

Acesse [localhost:5173](http://localhost:5173).

## Sobre o estágio atual

Este é um **protótipo**, não uma ferramenta corporativa implantada. Os documentos demonstrativos e rascunhos são gerenciados localmente no navegador. Ainda não há autenticação, banco de dados centralizado, aprovação formal nem histórico permanente e recuperável de todas as versões. O botão de publicação é exclusivamente demonstrativo.

A aplicação deve ser testada com documentos fictícios. Não utilize informações sigilosas nem documentos corporativos sem autorização.

---

**Foco do projeto:** aplicar desenvolvimento de software e IA a desafios reais de gestão, melhoria de processos e transformação digital.

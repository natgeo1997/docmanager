
import React, {
  useMemo,
  useRef,
  useState,
} from "react";

import { createRoot } from "react-dom/client";

import {
  Home,
  FileText,
  RefreshCw,
  Bell,
  Workflow,
  ChartColumn,
  Settings,
  Search,
  CircleHelp,
  ChevronDown,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  X,
  Filter,
  Download,
  History,
  ShieldCheck,
  Send,
  MoreHorizontal,
  FilePlus2,
  Save,
  ArrowLeft,
  GitCompare,
  WandSparkles,
  Edit3,
} from "lucide-react";

import "./styles.css";

// ========================================
// DOCMANAGER v0.8
// ========================================

const API_URL = "http://localhost:8000";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const initialDocs = [
  {
    id: 1,
    code: "POL-001",
    title: "Política de Cargas Perigosas",
    category: "Políticas",
    area: "Operações",
    version: "v6.0",
    due: "2026-11-15",
    status: "Em revisão",
    owner: "Natália Santana",
  },
  {
    id: 2,
    code: "POP-002",
    title: "Procedimento SALT",
    category: "Processos",
    area: "Qualidade",
    version: "v3.2",
    due: "2026-11-22",
    status: "Ativo",
    owner: "Alex Tosta",
  },
  {
    id: 3,
    code: "GUI-003",
    title: "Guia de Aceitação – Lítio",
    category: "Guias",
    area: "Operações",
    version: "v2.1",
    due: "2026-11-28",
    status: "Ativo",
    owner: "Natália Santana",
  },
  {
    id: 4,
    code: "POP-004",
    title: "RCIR – Triagem DG",
    category: "Processos",
    area: "Segurança",
    version: "v1.0",
    due: "2026-12-05",
    status: "Ativo",
    owner: "Alex Tosta",
  },
  {
    id: 5,
    code: "CHK-005",
    title: "Checklist de Auditoria DG",
    category: "Checklists",
    area: "Qualidade",
    version: "v4.0",
    due: "2026-12-12",
    status: "Em revisão",
    owner: "Natália Santana",
  },
  {
    id: 6,
    code: "POL-006",
    title: "Política de Segurança Operacional",
    category: "Políticas",
    area: "Segurança",
    version: "v1.5",
    due: "2026-10-15",
    status: "Vencido",
    owner: "Alex Tosta",
  },
  {
    id: 7,
    code: "POP-007",
    title: "Controle de Registros",
    category: "Processos",
    area: "Qualidade",
    version: "v2.0",
    due: "2026-11-07",
    status: "Aguardando aprovação",
    owner: "Natália Santana",
  },
];

const demoContent = `
<h2>1. Objetivo</h2>
<p>Estabelecer diretrizes para elaboração, revisão,
aprovação e publicação de documentos corporativos.</p>

<h2>2. Responsabilidades</h2>
<p>O responsável pelo documento deve garantir que
o conteúdo esteja atualizado e adequado
aos processos da área.</p>

<h2>3. Revisão documental</h2>
<p>Os documentos devem ser revisados conforme
a periodicidade definida no cadastro.</p>

<h2>4. Histórico de alterações</h2>
<p>Versão vigente: emissão e aprovação do documento.</p>
`;

const navigation = [
  ["Início", Home],
  ["Documentos", FileText],
  ["Revisões", RefreshCw],
  ["Alertas", Bell],
  ["Workflow", Workflow],
  ["Relatórios", ChartColumn],
  ["Configurações", Settings],
];

// ========================================
// UTILITÁRIOS
// ========================================

function formatDate(value) {
  if (!value) return "Não definida";

  return new Date(
    `${value}T12:00:00`
  ).toLocaleDateString("pt-BR");
}

function readBlocks(html) {
  const container = document.createElement("div");
  container.innerHTML = html;

  return Array.from(
    container.querySelectorAll("h1,h2,h3,p,li")
  )
    .map((element) => element.textContent.trim())
    .filter(Boolean);
}

function withoutHistory(html) {
  const container = document.createElement("div");
  container.innerHTML = html;

  const headings = Array.from(
    container.querySelectorAll("h1,h2,h3")
  );

  const heading = headings.find((element) =>
    /histórico de alterações/i.test(
      element.textContent || ""
    )
  );

  if (!heading) return container.innerHTML;

  let next = heading.nextElementSibling;

  while (next && !/^H[123]$/.test(next.tagName)) {
    const current = next;
    next = next.nextElementSibling;
    current.remove();
  }

  heading.remove();

  return container.innerHTML;
}

function diffBlocks(oldHtml, newHtml) {
  const oldBlocks = readBlocks(oldHtml);
  const newBlocks = readBlocks(newHtml);

  return {
    added: newBlocks.filter(
      (text) => !oldBlocks.includes(text)
    ),
    removed: oldBlocks.filter(
      (text) => !newBlocks.includes(text)
    ),
  };
}

function visualDiff(oldHtml, newHtml) {
  const before = readBlocks(oldHtml);
  const after = readBlocks(newHtml);

  const n = before.length;
  const m = after.length;

  const dp = Array.from(
    { length: n + 1 },
    () => Array(m + 1).fill(0)
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        before[i] === after[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(
              dp[i + 1][j],
              dp[i][j + 1]
            );
    }
  }

  const result = [];
  let i = 0;
  let j = 0;

  while (i < n || j < m) {
    if (
      i < n &&
      j < m &&
      before[i] === after[j]
    ) {
      result.push({
        old: before[i],
        current: after[j],
        kind: "equal",
      });

      i++;
      j++;
    } else if (
      i < n &&
      (
        j === m ||
        dp[i + 1][j] >= dp[i][j + 1]
      )
    ) {
      result.push({
        old: before[i],
        current: "",
        kind: "removed",
      });

      i++;
    } else {
      result.push({
        old: "",
        current: after[j],
        kind: "added",
      });

      j++;
    }
  }

  return result;
}

function nextRevision(version) {
  const number = Number(
    String(version).replace("v", "")
  );

  if (!Number.isFinite(number)) return "1.0";

  return (number + 0.1).toFixed(1);
}

// ========================================
// APLICAÇÃO PRINCIPAL
// ========================================

function App() {
  const [page, setPage] = useState("Início");
  const [docs, setDocs] = useState(initialDocs);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [selected, setSelected] = useState(null);

  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [revisionSummary, setRevisionSummary] =
    useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  const [showTip, setShowTip] = useState(true);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(false);

  const editorRef = useRef(null);

  const [published, setPublished] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("dm_published") || "{}"
      );
    } catch {
      return {};
    }
  });

  const [form, setForm] = useState({
    code: "",
    title: "",
    category: "Processos",
    area: "Qualidade",
    owner: "",
    due: "",
    version: "v1.0",
  });

  const today = getToday();

  // =====================================
  // DOCUMENTOS E EDIÇÃO
  // =====================================

  const getPublished = (id) =>
    published[id] || demoContent;

  const currentHtml = () =>
    editorRef.current?.innerHTML ?? draft;

  const openEditor = (documento) => {
    const saved = localStorage.getItem(
      `dm_draft_${documento.id}`
    );

    setEditing(documento);
    setDraft(saved ?? getPublished(documento.id));

    setRevisionSummary("");
    setCompareOpen(false);
    setSelected(null);
  };

  const saveDraft = () => {
    if (!editing) return;

    const content = currentHtml();

    setDraft(content);

    localStorage.setItem(
      `dm_draft_${editing.id}`,
      content
    );

    setNotice("Rascunho salvo neste navegador.");
  };

  const compare = () => {
    if (!editing) {
      return { added: [], removed: [] };
    }

    return diffBlocks(
      withoutHistory(getPublished(editing.id)),
      withoutHistory(currentHtml())
    );
  };

  const openComparison = () => {
    setDraft(currentHtml());
    setCompareOpen(true);
  };

  // =====================================
  // GERAR HISTÓRICO COM OPENAI
  // =====================================

  const summarize = async () => {
    if (!editing || isGenerating) return;

    const oldContent = withoutHistory(
      getPublished(editing.id)
    );

    const newContent = withoutHistory(
      currentHtml()
    );

    const changes = diffBlocks(
      oldContent,
      newContent
    );

    if (
      !changes.added.length &&
      !changes.removed.length
    ) {
      setRevisionSummary(
        "Nenhuma alteração de conteúdo identificada."
      );
      return;
    }

    // Preservar o conteúdo antes da chamada.
    saveDraft();

    setIsGenerating(true);

    setRevisionSummary(
      "Analisando as alterações..."
    );

    try {
      const response = await fetch(
        `${API_URL}/gerar-historico`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documento:
              `${editing.code} - ${editing.title}`,
            versao_anterior:
              readBlocks(oldContent).join("\n"),
            versao_atual:
              readBlocks(newContent).join("\n"),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Falha na análise (${response.status})`
        );
      }

      const data = await response.json();

      if (
        typeof data.resumo !== "string" ||
        !data.resumo.trim()
      ) {
        throw new Error("Resumo inválido.");
      }

      setRevisionSummary(data.resumo.trim());

    } catch (error) {
      console.error(error);

      setRevisionSummary(
        "Não foi possível gerar o histórico agora. " +
        "Verifique o servidor Python e tente novamente."
      );

    } finally {
      setIsGenerating(false);
    }
  };

  // =====================================
  // INSERIR HISTÓRICO NA SEÇÃO 4
  // =====================================

  const insertHistory = () => {
    if (
      !editing ||
      !editorRef.current ||
      isGenerating
    ) {
      return;
    }

    const summary = revisionSummary.trim();

    if (
      !summary ||
      /^(não foi possível|nenhuma alteração|analisando)/i
        .test(summary)
    ) {
      setNotice(
        "Gere e revise um resumo válido antes de inserir."
      );
      return;
    }

    const editor = editorRef.current;
    const revision = nextRevision(editing.version);

    // Localizar o capítulo de histórico.
    const headings = Array.from(
      editor.querySelectorAll("h1,h2,h3")
    );

    let heading = headings.find((element) =>
      /histórico de alterações/i.test(
        element.textContent || ""
      )
    );

    if (!heading) {
      heading = document.createElement("h2");
      heading.textContent =
        "4. Histórico de alterações";

      editor.appendChild(heading);
    }

    // Encontrar os limites do capítulo.
    let stop = heading.nextElementSibling;

    while (
      stop &&
      !/^H[123]$/.test(stop.tagName)
    ) {
      stop = stop.nextElementSibling;
    }

    // Procurar tabela existente no capítulo.
    let table = null;
    let node = heading.nextElementSibling;

    while (node && node !== stop) {
      if (
        node.matches(
          'table[data-docmanager-history="true"]'
        )
      ) {
        table = node;
        break;
      }

      node = node.nextElementSibling;
    }

    // Criar tabela estruturada.
    if (!table) {
      table = document.createElement("table");

      table.dataset.docmanagerHistory = "true";
      table.className = "dmHistoryTable";

      const colgroup =
        document.createElement("colgroup");

      ["16%", "22%", "62%"].forEach((width) => {
        const col = document.createElement("col");
        col.style.width = width;
        colgroup.appendChild(col);
      });

      table.appendChild(colgroup);

      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");

      [
        "Revisão",
        "Data",
        "Descrição das alterações",
      ].forEach((label) => {
        const th = document.createElement("th");
        th.textContent = label;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      table.appendChild(
        document.createElement("tbody")
      );

      editor.insertBefore(table, stop);
    }

    const tbody = table.querySelector("tbody");

    // Evitar duplicação da mesma revisão.
    let row = Array.from(
      tbody.querySelectorAll("tr")
    ).find(
      (item) =>
        item.dataset.revision === revision
    );

    if (!row) {
      row = document.createElement("tr");
      row.dataset.revision = revision;

      for (let i = 0; i < 3; i++) {
        row.appendChild(
          document.createElement("td")
        );
      }

      tbody.appendChild(row);
    }

    const cells = row.querySelectorAll("td");

    cells[0].textContent = revision;
    cells[1].textContent =
      new Date().toLocaleDateString("pt-BR");
    cells[2].textContent = summary;

    // Salvar automaticamente após inserir.
    const updatedHtml = editor.innerHTML;

    setDraft(updatedHtml);

    localStorage.setItem(
      `dm_draft_${editing.id}`,
      updatedHtml
    );

    setNotice(
      `Histórico da revisão ${revision} inserido e salvo.`
    );
  };

  // =====================================
  // PUBLICAÇÃO DEMONSTRATIVA
  // =====================================

  const publish = () => {
    if (!editing) return;

    const current = currentHtml();

    const updated = {
      ...published,
      [editing.id]: current,
    };

    setPublished(updated);

    localStorage.setItem(
      "dm_published",
      JSON.stringify(updated)
    );

    localStorage.removeItem(
      `dm_draft_${editing.id}`
    );

    setDocs((previous) =>
      previous.map((d) =>
        d.id === editing.id
          ? {
              ...d,
              status: "Ativo",
              version: `v${nextRevision(d.version)}`,
            }
          : d
      )
    );

    setNotice(
      "Versão publicada localmente (teste demonstrativo)."
    );

    setEditing(null);
  };

  // =====================================
  // BIBLIOTECA E FILTROS
  // =====================================

  const matches = useMemo(
    () =>
      docs.filter((d) => {
        const searchable = [
          d.title,
          d.code,
          d.category,
          d.owner,
          d.area,
        ]
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(query.toLowerCase()) &&
          (
            filter === "Todos" ||
            d.status === filter
          )
        );
      }),
    [docs, query, filter]
  );

  const coming = docs
    .filter(
      (d) =>
        d.due >= today &&
        d.status !== "Aprovado"
    )
    .sort((a, b) =>
      a.due.localeCompare(b.due)
    )
    .slice(0, 3);

  const setStatus = (id, status) => {
    setDocs((previous) =>
      previous.map((d) =>
        d.id === id ? { ...d, status } : d
      )
    );

    setSelected((previous) =>
      previous?.id === id
        ? { ...previous, status }
        : previous
    );

    setNotice(`Documento atualizado para: ${status}`);
  };

  const addDoc = (event) => {
    event.preventDefault();

    if (
      !form.title ||
      !form.code ||
      !form.owner ||
      !form.due
    ) {
      return;
    }

    setDocs((previous) => [
      {
        ...form,
        id: Date.now(),
        status: "Ativo",
      },
      ...previous,
    ]);

    setModal(false);
    setPage("Documentos");

    setNotice(
      "Documento cadastrado com sucesso nesta sessão."
    );

    setForm({
      code: "",
      title: "",
      category: "Processos",
      area: "Qualidade",
      owner: "",
      due: "",
      version: "v1.0",
    });
  };

  // =====================================
  // TABELA DE DOCUMENTOS
  // =====================================

  const mainTable = (rows) => (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Documento</th>
            <th>Categoria</th>
            <th>Versão</th>
            <th>Próxima revisão</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((d) => (
            <tr
              key={d.id}
              onClick={() => setSelected(d)}
            >
              <td className="docTitle">
                <FileText size={18} />
                <span>
                  {d.title}
                  <small>{d.code}</small>
                </span>
              </td>

              <td>{d.category}</td>
              <td>{d.version}</td>
              <td>{formatDate(d.due)}</td>

              <td>
                <span
                  className={
                    "status " +
                    d.status
                      .toLowerCase()
                      .replaceAll(" ", "-")
                  }
                >
                  {d.status}
                </span>
              </td>

              <td>
                <MoreHorizontal size={20} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!rows.length && (
        <div className="empty">
          Nenhum documento encontrado.
        </div>
      )}
    </div>
  );

  // =====================================
  // INTERFACE PRINCIPAL
  // =====================================

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <FileText size={33} />
          <div>
            <strong>DocManager</strong>
            <span>Gestão Documental</span>
          </div>
        </div>

        <nav>
          {navigation.map(([name, Icon]) => (
            <button
              key={name}
              className={
                page === name ? "navActive" : ""
              }
              onClick={() => {
                setPage(name);
                setFilter("Todos");
              }}
            >
              <Icon size={19} />
              {name}
            </button>
          ))}
        </nav>

        <div className="sideFooter">
          DocManager
          <span>Protótipo • v0.8</span>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <div className="search">
            <Search size={21} />
            <input
              placeholder="Buscar documentos, normas ou palavras-chave..."
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage("Documentos");
                }
              }}
            />
          </div>

          <div className="topRight">
            <button
              className="iconButton"
              aria-label="Ver alertas"
              onClick={() => setPage("Alertas")}
            >
              <Bell size={23} />
              <i />
            </button>

            <button
              className="iconButton"
              aria-label="Ajuda"
              onClick={() =>
                setNotice(
                  "Selecione um documento para ver detalhes."
                )
              }
            >
              <CircleHelp size={23} />
            </button>

            <div className="avatar">NS</div>
            <strong>Natália Santana</strong>
            <ChevronDown size={18} />
          </div>
        </header>

        <main>
          {notice && (
            <div className="notice">
              {notice}
              <button
                onClick={() => setNotice("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {page === "Início" && (
            <>
              <div className="pageHeader">
                <h1>Olá, Natália!</h1>
                <p>
                  Aqui você gerencia o ciclo de vida
                  dos documentos da sua área.
                </p>
              </div>

              <div className="dashboard">
                <div className="maincol">
                  <div className="kpis">
                    <div className="kpi blue">
                      <FileText />
                      <strong>{docs.length}</strong>
                      <span>Documentos cadastrados</span>
                    </div>

                    <div className="kpi blue">
                      <RefreshCw />
                      <strong>
                        {
                          docs.filter(
                            (d) =>
                              d.status === "Em revisão"
                          ).length
                        }
                      </strong>
                      <span>Em revisão</span>
                    </div>

                    <div className="kpi orange">
                      <AlertTriangle />
                      <strong>
                        {
                          docs.filter((d) => {
                            const limit = new Date();
                            limit.setDate(
                              limit.getDate() + 7
                            );

                            const year =
                              limit.getFullYear();

                            const month = String(
                              limit.getMonth() + 1
                            ).padStart(2, "0");

                            const day = String(
                              limit.getDate()
                            ).padStart(2, "0");

                            const limitDate =
                              `${year}-${month}-${day}`;

                            return (
                              d.due >= today &&
                              d.due <= limitDate
                            );
                          }).length
                        }
                      </strong>
                      <span>Revisão em até 7 dias</span>
                    </div>

                    <div className="kpi pale">
                      <CalendarDays />
                      <strong>
                        {
                          docs.filter(
                            (d) =>
                              d.status ===
                              "Aguardando aprovação"
                          ).length
                        }
                      </strong>
                      <span>Aguardando aprovação</span>
                    </div>
                  </div>

                  {showTip && (
                    <div className="hint">
                      <div>
                        <strong>Próximas revisões</strong>
                        <p>
                          Seu painel reúne os documentos
                          com prazos mais próximos.
                        </p>
                      </div>

                      <div className="hintAction">
                        <CalendarDays />
                        <span>
                          <strong>
                            {coming.length} documentos
                            para acompanhar.
                          </strong>
                          <small>
                            Organize o trabalho de revisão.
                          </small>
                          <button
                            onClick={() =>
                              setPage("Revisões")
                            }
                          >
                            Ver revisões
                          </button>
                        </span>
                      </div>

                      <button
                        className="closeHint"
                        onClick={() =>
                          setShowTip(false)
                        }
                      >
                        <X />
                      </button>
                    </div>
                  )}

                  <section className="panel">
                    <div className="sectionHead">
                      <h2>Documentos recentes</h2>
                      <button
                        className="link"
                        onClick={() =>
                          setPage("Documentos")
                        }
                      >
                        Ver todos
                        <ArrowRight size={17} />
                      </button>
                    </div>

                    {mainTable(docs.slice(0, 5))}
                  </section>
                </div>

                <div className="rightcol">
                  <section className="panel actions">
                    <h2>
                      <CalendarDays />
                      Próximas ações
                    </h2>

                    <div className="timeline">
                      {coming.map((d) => (
                        <button
                          key={d.id}
                          onClick={() =>
                            setSelected(d)
                          }
                        >
                          <span className="dot" />
                          <span>
                            <strong>
                              {formatDate(d.due).slice(0, 5)}
                            </strong>
                            {" – Revisar "}
                            {d.title}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      className="link"
                      onClick={() =>
                        setPage("Revisões")
                      }
                    >
                      Ver calendário completo
                      <ArrowRight size={17} />
                    </button>
                  </section>

                  <section className="panel insights">
                    <h2>
                      <ShieldCheck />
                      Indicadores de controle
                    </h2>

                    <div>
                      <strong>Revisões pendentes</strong>
                      <p>
                        {
                          docs.filter(
                            (d) =>
                              d.status === "Em revisão"
                          ).length
                        }{" "}
                        documentos em revisão.
                      </p>
                    </div>

                    <div>
                      <strong>Atenção aos prazos</strong>
                      <p>
                        {
                          docs.filter(
                            (d) =>
                              d.status === "Vencido"
                          ).length
                        }{" "}
                        documento(s) vencido(s).
                      </p>
                    </div>

                    <div>
                      <strong>Controle de aprovação</strong>
                      <p>
                        Validação humana obrigatória
                        antes da publicação.
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}

          {page !== "Início" && (
            <>
              <div className="pageHeader pageHeaderRow">
                <div>
                  <h1>{page}</h1>
                  <p>
                    {
                      {
                        Documentos:
                          "Biblioteca central dos documentos corporativos.",
                        Revisões:
                          "Acompanhe prazos e organize as revisões.",
                        Alertas:
                          "Pendências que precisam de atenção.",
                        Workflow:
                          "Fluxo de revisão, validação e aprovação.",
                        Relatórios:
                          "Visão consolidada da gestão documental.",
                        Configurações:
                          "Parâmetros e integrações do sistema.",
                      }[page]
                    }
                  </p>
                </div>

                {page === "Documentos" && (
                  <button
                    className="primary"
                    onClick={() => setModal(true)}
                  >
                    <Plus size={18} />
                    Novo documento
                  </button>
                )}
              </div>

              {[
                "Documentos",
                "Revisões",
                "Alertas",
                "Workflow",
              ].includes(page) && (
                <section className="panel largePanel">
                  <div className="sectionHead">
                    <h2>
                      {
                        {
                          Documentos: "Todos os documentos",
                          Revisões: "Agenda de revisões",
                          Alertas: "Pendências e alertas",
                          Workflow:
                            "Documentos em fluxo de aprovação",
                        }[page]
                      }
                    </h2>

                    <label className="filter">
                      <Filter size={16} />
                      <select
                        value={filter}
                        onChange={(e) =>
                          setFilter(e.target.value)
                        }
                      >
                        <option>Todos</option>
                        {[
                          "Ativo",
                          "Em revisão",
                          "Vencido",
                          "Aguardando aprovação",
                          "Aprovado",
                        ].map((status) => (
                          <option key={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {mainTable(
                    page === "Revisões"
                      ? [...matches].sort((a, b) =>
                          a.due.localeCompare(b.due)
                        )
                      : page === "Alertas"
                      ? matches.filter(
                          (d) =>
                            d.status === "Vencido" ||
                            d.due < today
                        )
                      : page === "Workflow"
                      ? matches.filter((d) =>
                          [
                            "Em revisão",
                            "Aguardando aprovação",
                          ].includes(d.status)
                        )
                      : matches
                  )}
                </section>
              )}

              {page === "Relatórios" && (
                <div className="reportCards">
                  <div className="panel">
                    <h2>Documentos por status</h2>
                    {[
                      "Ativo",
                      "Em revisão",
                      "Vencido",
                      "Aguardando aprovação",
                      "Aprovado",
                    ].map((status) => (
                      <div
                        className="reportRow"
                        key={status}
                      >
                        <span>{status}</span>
                        <strong>
                          {
                            docs.filter(
                              (d) =>
                                d.status === status
                            ).length
                          }
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="panel">
                    <h2>Exportação</h2>
                    <p>
                      Exporte a lista atual de documentos.
                    </p>

                    <button
                      className="primary"
                      onClick={() => {
                        const columns = [
                          "Código",
                          "Documento",
                          "Categoria",
                          "Área",
                          "Versão",
                          "Revisão",
                          "Status",
                          "Responsável",
                        ];

                        const rows = docs.map((d) => [
                          d.code,
                          d.title,
                          d.category,
                          d.area,
                          d.version,
                          d.due,
                          d.status,
                          d.owner,
                        ]);

                        const escapeCsv = (value) =>
                          `"${String(value).replaceAll(
                            '"',
                            '""'
                          )}"`;

                        const csv =
                          "\uFEFF" +
                          [columns, ...rows]
                            .map((row) =>
                              row.map(escapeCsv).join(";")
                            )
                            .join("\r\n");

                        const url = URL.createObjectURL(
                          new Blob([csv], {
                            type: "text/csv;charset=utf-8",
                          })
                        );

                        const anchor =
                          document.createElement("a");

                        anchor.href = url;
                        anchor.download =
                          "docmanager-documentos.csv";
                        anchor.click();

                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={17} />
                      Exportar CSV
                    </button>
                  </div>
                </div>
              )}

              {page === "Configurações" && (
                <div className="panel settingsPanel">
                  <h2>Configurações do protótipo</h2>

                  <p>
                    Esta versão utiliza dados de
                    demonstração e rascunhos no navegador.
                    A análise de alterações utiliza
                    a OpenAI pelo backend FastAPI.
                  </p>

                  <div className="settingsItem">
                    <strong>Prazo de lembrete</strong>
                    <span>
                      90, 60, 30, 15 e 7 dias
                      (planejado)
                    </span>
                  </div>

                  <div className="settingsItem">
                    <strong>OpenAI</strong>
                    <span>
                      Integrada ao backend Python.
                    </span>
                  </div>

                  <div className="settingsItem">
                    <strong>Controle de acesso</strong>
                    <span>
                      Perfis e aprovação real
                      ainda não implementados.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* =====================================
          DETALHES DO DOCUMENTO
         ===================================== */}

      {selected && (
        <div
          className="overlay"
          onClick={() => setSelected(null)}
        >
          <aside
            className="drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="drawerClose"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>

            <span className="eyebrow">
              {selected.code} • {selected.category}
            </span>

            <h2>{selected.title}</h2>

            <span
              className={
                "status " +
                selected.status
                  .toLowerCase()
                  .replaceAll(" ", "-")
              }
            >
              {selected.status}
            </span>

            <div className="detailGrid">
              <div>
                <small>Versão</small>
                <strong>{selected.version}</strong>
              </div>
              <div>
                <small>Próxima revisão</small>
                <strong>{formatDate(selected.due)}</strong>
              </div>
              <div>
                <small>Área</small>
                <strong>{selected.area}</strong>
              </div>
              <div>
                <small>Responsável</small>
                <strong>{selected.owner}</strong>
              </div>
            </div>

            <h3>Ações disponíveis</h3>

            <button
              className="action editAction"
              onClick={() => openEditor(selected)}
            >
              <Edit3 size={18} />
              Abrir no editor
            </button>

            <p className="muted">
              Os status ainda são simulados
              localmente neste protótipo.
            </p>

            <button
              className="action"
              onClick={() =>
                setStatus(selected.id, "Em revisão")
              }
            >
              <RefreshCw size={18} />
              Iniciar revisão
            </button>

            <button
              className="action"
              onClick={() =>
                setStatus(
                  selected.id,
                  "Aguardando aprovação"
                )
              }
            >
              <Send size={18} />
              Enviar para aprovação
            </button>

            <button
              className="action"
              onClick={() =>
                setStatus(selected.id, "Aprovado")
              }
            >
              <CheckCircle2 size={18} />
              Aprovar documento
            </button>

            <div className="drawerFoot">
              <History size={17} />
              Histórico completo de versões:
              etapa futura.
            </div>
          </aside>
        </div>
      )}

      {/* =====================================
          EDITOR
         ===================================== */}

      {editing && (
        <div className="editorOverlay">
          <div className="editorTop">
            <button
              className="back"
              onClick={() => setEditing(null)}
            >
              <ArrowLeft size={19} />
              Voltar
            </button>

            <div>
              <strong>{editing.title}</strong>
              <small>
                {editing.code} · Versão publicada{" "}
                {editing.version} · Rascunho de revisão
              </small>
            </div>

            <div className="editorButtons">
              <button onClick={saveDraft}>
                <Save size={17} />
                Salvar rascunho
              </button>

              <button onClick={openComparison}>
                <GitCompare size={17} />
                Comparar versões
              </button>

              <button
                className="primary"
                onClick={publish}
              >
                Publicar teste
              </button>
            </div>
          </div>

          <div className="editorWorkspace">
            <div className="editorPaper">
              <div className="editorToolbar">
                <button
                  title="Negrito"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    document.execCommand("bold")
                  }
                >
                  B
                </button>

                <button
                  title="Itálico"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    document.execCommand("italic")
                  }
                >
                  <em>I</em>
                </button>

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    document.execCommand(
                      "formatBlock",
                      false,
                      "h2"
                    )
                  }
                >
                  Título
                </button>

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    document.execCommand(
                      "insertUnorderedList"
                    )
                  }
                >
                  Lista
                </button>

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    document.execCommand(
                      "insertOrderedList"
                    )
                  }
                >
                  Numeração
                </button>

                <span>
                  Selecione um trecho e aplique
                  a formatação.
                </span>
              </div>

              <div
                key={editing.id}
                ref={(node) => {
                  editorRef.current = node;

                  if (
                    node &&
                    !node.dataset.initialized
                  ) {
                    node.innerHTML = draft;
                    node.dataset.initialized = "1";
                  }
                }}
                className="richEditor"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) =>
                  setDraft(e.currentTarget.innerHTML)
                }
              />
            </div>

            <aside className="editorSide">
              <h3>Controle da revisão</h3>

              <p>
                Edite o documento, compare as mudanças
                e gere o histórico de alterações.
              </p>

              <button
                className="primary full"
                onClick={summarize}
                disabled={isGenerating}
              >
                <WandSparkles size={16} />

                {isGenerating
                  ? "Analisando alterações..."
                  : "Gerar sugestão de histórico"}
              </button>

              <label>Resumo das alterações</label>

              <textarea
                placeholder="O resumo aparecerá aqui."
                value={revisionSummary}
                onChange={(e) =>
                  setRevisionSummary(e.target.value)
                }
                rows={8}
              />

              <button
                className="full"
                onClick={insertHistory}
                disabled={isGenerating}
              >
                Inserir no documento
              </button>

              <hr />

              <h4>Diferenças detectadas</h4>

              {(() => {
                const difference = compare();

                return (
                  <>
                    <p>
                      <b>{difference.added.length}</b>{" "}
                      trechos incluídos/alterados
                    </p>

                    <p>
                      <b>{difference.removed.length}</b>{" "}
                      trechos removidos/substituídos
                    </p>
                  </>
                );
              })()}

              <small>
                Resumo gerado pela OpenAI via FastAPI.
                Revise antes de inserir. Rascunhos
                salvos neste navegador; publicação
                demonstrativa.
              </small>
            </aside>
          </div>
        </div>
      )}

      {/* =====================================
          COMPARAÇÃO VISUAL
         ===================================== */}

      {editing && compareOpen && (
        <div
          className="comparisonBackdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Comparação de versões"
        >
          <div className="comparisonModal">
            <header className="comparisonHeader">
              <div>
                <h2>Comparação de versões</h2>
                <p>
                  {editing.code} · {editing.title}
                </p>
              </div>

              <button
                className="comparisonClose"
                onClick={() =>
                  setCompareOpen(false)
                }
                aria-label="Fechar comparação"
              >
                <X size={22} />
              </button>
            </header>

            <div className="comparisonColumns">
              <div>
                Versão publicada · {editing.version}
              </div>
              <div>Rascunho em edição</div>
            </div>

            <div className="comparisonRows">
              {visualDiff(
                getPublished(editing.id),
                draft
              ).map((row, index) => (
                <div
                  className="comparisonRow"
                  key={index}
                >
                  <div
                    className={
                      row.kind === "removed"
                        ? "diffRemoved"
                        : row.kind === "equal"
                        ? "diffEqual"
                        : "diffBlank"
                    }
                  >
                    {row.old || "—"}
                  </div>

                  <div
                    className={
                      row.kind === "added"
                        ? "diffAdded"
                        : row.kind === "equal"
                        ? "diffEqual"
                        : "diffBlank"
                    }
                  >
                    {row.current || "—"}
                  </div>
                </div>
              ))}
            </div>

            <footer className="comparisonFooter">
              <span>
                <i className="diffDot removed" />
                Removido
                <i className="diffDot added" />
                Adicionado
              </span>

              <button
                onClick={() =>
                  setCompareOpen(false)
                }
              >
                Voltar ao editor
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* =====================================
          CADASTRO
         ===================================== */}

      {modal && (
        <div
          className="overlay"
          onClick={() => setModal(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="drawerClose"
              onClick={() => setModal(false)}
            >
              <X />
            </button>

            <h2>Novo documento</h2>
            <p>
              Cadastre um registro para
              acompanhamento de revisão.
            </p>

            <form onSubmit={addDoc}>
              <label>
                Código
                <input
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      code: e.target.value,
                    })
                  }
                  placeholder="POP-008"
                />
              </label>

              <label>
                Título
                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Nome do documento"
                />
              </label>

              <label>
                Responsável
                <input
                  required
                  value={form.owner}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      owner: e.target.value,
                    })
                  }
                  placeholder="Nome do responsável"
                />
              </label>

              <label>
                Próxima revisão
                <input
                  required
                  type="date"
                  value={form.due}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      due: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Categoria
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                >
                  {[
                    "Processos",
                    "Políticas",
                    "Guias",
                    "Checklists",
                    "Instruções",
                  ].map((category) => (
                    <option key={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Área
                <select
                  value={form.area}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      area: e.target.value,
                    })
                  }
                >
                  {[
                    "Qualidade",
                    "Operações",
                    "Segurança",
                    "Recursos Humanos",
                    "Compliance",
                  ].map((area) => (
                    <option key={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>

              <button
                className="primary submit"
                type="submit"
              >
                <FilePlus2 size={18} />
                Cadastrar documento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// INICIALIZAÇÃO
// ========================================

createRoot(
  document.getElementById("root")
).render(<App />);

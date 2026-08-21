import { useEffect, useRef, useState } from "react";
import {
  Upload,
  MessageCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Send,
  ShieldCheck,
  Brain,
  BookOpen,
  Eye,
  X,
  PlayCircle,
} from "lucide-react";
import {
  uploadReport,
  uploadDemoReport,
  sendChat,
  analyzeReport,
  getReportPdfUrl,
  getDemoPdfUrl,
  getTextbookPdfUrl,
} from "./api";
import "./App.css";

function PriorityBadge({ priority }) {
  const cls =
    priority === "High"
      ? "badge badge-high"
      : priority === "Medium"
      ? "badge badge-medium"
      : "badge badge-normal";

  return <span className={cls}>{priority || "Normal"}</span>;
}


 
function ReferenceList({ title, note, references, kind }) {
  if (!Array.isArray(references) || references.length === 0) return null;

  const sourceLabel = (x) => {
    if (x === "uploaded_product_list") return "Product list";
    if (x === "health_canada_dpd") return "Health Canada DPD";
    if (x === "uploaded_microbiome_report_reference") return "Microbiome report";
    if (x === "health_canada_dri") return "Health Canada DRI";
    if (x === "health_canada") return "Health Canada";
    if (x === "fda_daily_value") return "FDA Daily Value";
    if (x === "nih_ods") return "NIH ODS";
    if (x === "report_trait_guidance") return "Report guidance";
    return x || "Reference";
  };

  return (
    <div className={`reference-list reference-list-${kind || "default"}`}>
      <div className="reference-title">{title}</div>
      {note ? <div className="reference-note">{note}</div> : null}

      {references.map((r, idx) => {
        const name =
          r.title ||
          r.product_name ||
          r.brand_name ||
          r.trait ||
          r.element ||
          "Reference item";

        return (
          <div className="reference-card" key={`${kind || "ref"}-${idx}-${name}`}>
            <div className="reference-header">
              <span className="reference-rank">[{idx + 1}]</span>
              <span className="reference-name">{name}</span>
            </div>

            <div className="reference-meta">
              {sourceLabel(r.source_type)}
              {r.source_name ? ` · ${r.source_name}` : ""}
              {r.trait ? ` · ${r.trait}` : ""}
              {r.element ? ` · ${r.element}` : ""}
              {r.din ? ` · DIN: ${r.din}` : ""}
              {r.page && Number(r.page) > 0 ? ` · p.${r.page}` : ""}
              {r.row_number && Number(r.row_number) > 0 ? ` · row ${r.row_number}` : ""}
            </div>

            {(r.adult_reference_value || r.upper_limit) ? (
              <div className="reference-values">
                {r.adult_reference_value ? <span>Reference: {r.adult_reference_value}</span> : null}
                {r.upper_limit ? <span>UL / limit: {r.upper_limit}</span> : null}
              </div>
            ) : null}

            {r.element_tags ? (
              <div className="reference-tags">
                {String(r.element_tags).split("|").filter(Boolean).slice(0, 8).map((tag) => (
                  <span className="reference-tag" key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}

            {r.text_preview ? (
              <div className="reference-preview">{String(r.text_preview).slice(0, 260)}</div>
            ) : null}

            {r.source_url ? (
              <div className="reference-link">
                <a href={r.source_url} target="_blank" rel="noreferrer">Open official source</a>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}


function SupplementReferenceList({ references }) {
  if (!Array.isArray(references) || references.length === 0) return null;

  const labelForSource = (sourceType) => {
    if (sourceType === "uploaded_product_list") return "Product list";
    if (sourceType === "health_canada_dpd") return "Health Canada DPD";
    if (sourceType === "uploaded_microbiome_report_reference") return "Microbiome report";
    return sourceType || "Reference";
  };

  return (
    <div className="supplement-reference-list">
      <div className="supplement-reference-title">Supplement references</div>
      <div className="supplement-reference-note">
        Reference candidates based on the answer context. Not a prescription or dosage recommendation.
      </div>

      {references.map((r, idx) => (
        <div className="supplement-reference-card" key={`${r.reference_id || r.product_name || idx}-${idx}`}>
          <div className="supplement-reference-header">
            <span className="supplement-reference-rank">[{idx + 1}]</span>
            <span className="supplement-reference-name">
              {r.product_name || r.brand_name || "Reference item"}
            </span>
          </div>

          <div className="supplement-reference-meta">
            <span>{labelForSource(r.source_type)}</span>
            {r.source_name ? <span> · {r.source_name}</span> : null}
            {r.din ? <span> · DIN: {r.din}</span> : null}
            {r.page && Number(r.page) > 0 ? <span> · p.{r.page}</span> : null}
            {r.row_number && Number(r.row_number) > 0 ? <span> · row {r.row_number}</span> : null}
          </div>

          {r.element_tags ? (
            <div className="supplement-reference-tags">
              {String(r.element_tags)
                .split("|")
                .filter(Boolean)
                .slice(0, 8)
                .map((tag) => (
                  <span className="supplement-reference-tag" key={tag}>{tag}</span>
                ))}
            </div>
          ) : null}

          {r.text_preview ? (
            <div className="supplement-reference-preview">
              {String(r.text_preview).slice(0, 280)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}



function CombinedReferenceList({ references }) {
  if (!Array.isArray(references) || references.length === 0) return null;

  const sourceLabel = (x) => {
    if (x === "health_canada_dri") return "Health Canada DRI";
    if (x === "health_canada") return "Health Canada";
    if (x === "fda_daily_value") return "FDA Daily Value";
    if (x === "nih_ods") return "NIH ODS";
    if (x === "report_trait_guidance") return "Report guidance";
    if (x === "uploaded_product_list") return "Product list";
    return x || "Reference";
  };

  return (
    <div className="combined-reference-list">
      <div className="combined-reference-title">Reference layer</div>
      <div className="combined-reference-note">
        Official intake guidance plus matching product candidates. Not personalized dosing or a prescription.
      </div>

      {references.map((r, idx) => (
        <div className="combined-reference-card" key={`${idx}-${r.title || r.trait || "reference"}`}>
          <div className="combined-reference-header">
            <span className="combined-reference-rank">[{idx + 1}]</span>
            <span className="combined-reference-name">
              {r.title || r.trait || "Reference item"}
            </span>
          </div>

          <div className="combined-reference-meta">
            {sourceLabel(r.source_type)}
            {r.source_name ? ` · ${r.source_name}` : ""}
            {r.trait ? ` · ${r.trait}` : ""}
            {r.element ? ` · ${r.element}` : ""}
          </div>

          {(r.adult_reference_value || r.upper_limit) ? (
            <div className="combined-reference-values">
              {r.adult_reference_value ? (
                <div><strong>Reference:</strong> {r.adult_reference_value}</div>
              ) : null}
              {r.upper_limit ? (
                <div><strong>UL / limit:</strong> {r.upper_limit}</div>
              ) : null}
            </div>
          ) : null}

          {r.source_url ? (
            <div className="combined-reference-link">
              <a href={r.source_url} target="_blank" rel="noreferrer">
                Open official source
              </a>
            </div>
          ) : null}

          {Array.isArray(r.products) && r.products.length > 0 ? (
            <div className="combined-products">
              <div className="combined-products-title">Product candidates</div>

              {r.products.map((prod, pidx) => (
                <div className="combined-product-card" key={`${pidx}-${prod.product_name || "product"}`}>
                  <div className="combined-product-name">
                    {prod.product_name || prod.brand_name || "Product item"}
                  </div>

                  <div className="combined-product-meta">
                    {prod.source_name || "Product list"}
                    {prod.row_number && Number(prod.row_number) > 0 ? ` · row ${prod.row_number}` : ""}
                  </div>

                  {prod.element_tags ? (
                    <div className="combined-product-tags">
                      {String(prod.element_tags)
                        .split("|")
                        .filter(Boolean)
                        .slice(0, 10)
                        .map((tag) => (
                          <span className="combined-product-tag" key={tag}>{tag}</span>
                        ))}
                    </div>
                  ) : null}

                  {prod.text_preview ? (
                    <div className="combined-product-preview">
                      {String(prod.text_preview).slice(0, 200)}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}


function EvidenceList({ evidence, onOpenEvidence }) {
  if (!Array.isArray(evidence) || evidence.length === 0) return null;

  return (
    <div className="evidence-list">
      {evidence.slice(0, 6).map((e, i) => (
        <button
          key={i}
          className="evidence-card evidence-button"
          onClick={() => onOpenEvidence?.(e)}
        >
          <CheckCircle2 size={14} />
          <div>
            <div className="evidence-title">
              [{i + 1}] {e.book_title || e.book_id || "Textbook Evidence"}
            </div>
            <div className="evidence-meta">
              {e.book_id || "BOOK"} · p.{e.page || "?"} · {e.modality || "text"}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function PdfViewerModal({ viewer, onClose }) {
  if (!viewer) return null;

  return (
    <div className="viewer-backdrop">
      <div className="viewer-modal">
        <div className="viewer-header">
          <div>
            <div className="eyebrow">{viewer.type === "textbook" ? "TEXTBOOK SOURCE" : "REPORT PREVIEW"}</div>
            <h2>{viewer.title}</h2>
            {viewer.subtitle && <p>{viewer.subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <iframe className="pdf-frame" src={viewer.url} title={viewer.title} />
      </div>
    </div>
  );
}

export default function App() {

  // enable click-to-expand trait cards
  useEffect(() => {
    const onClick = (e) => {
      const card = e.target.closest(
        ".trait-card, .analysis-card, .report-trait-card, .finding-card, .rag-card"
      );
      if (!card) return;

      const insideChat = card.closest(".chat-body, .message-row, .bubble");
      if (insideChat) return;

      card.classList.toggle("expanded");
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(getDemoPdfUrl());
  const [viewer, setViewer] = useState(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Upload a genetic nutrition report or load the built-in demo report. Then ask about nutrient metabolism, vitamin/mineral requirements, gene variants, or personalized nutrition recommendations.",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [demoAutoLoaded, setDemoAutoLoaded] = useState(false);
  const demoLoadStartedRef = useRef(false);

  const parsed = report?.parsed || {};
  const traits = Array.isArray(parsed.traits) ? parsed.traits : [];
  const high = Array.isArray(parsed.high_priority)
    ? parsed.high_priority
    : traits.filter((t) => t?.priority === "High");
  const medium = Array.isArray(parsed.medium_priority)
    ? parsed.medium_priority
    : traits.filter((t) => t?.priority === "Medium");


  useEffect(() => {
    async function autoLoadDemo() {
      if (demoLoadStartedRef.current || demoAutoLoaded || report || loading) return;

      demoLoadStartedRef.current = true;
      setDemoAutoLoaded(true);
      setLoading(true);

      try {
        const data = await uploadDemoReport();
        setReport(data);
        setAnalyses([]);
        setPreviewPdfUrl(getReportPdfUrl(data.report_id));

        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: `Demo report loaded automatically. I detected ${data.parsed?.summary?.num_traits ?? data.parsed?.traits?.length ?? 0} nutrition-related traits.`,
          },
        ]);
      } catch (e) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: "Could not auto-load the demo report. You can still upload a PDF manually.",
          },
        ]);
      }

      setLoading(false);
    }

    autoLoadDemo();
  }, [demoAutoLoaded, report, loading]);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    try {
      const data = await uploadReport(file);
      setReport(data);
      setAnalyses([]);
      setPreviewPdfUrl(getReportPdfUrl(data.report_id));

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `Report uploaded: ${data.filename}. I detected ${data.parsed?.summary?.num_traits ?? data.parsed?.traits?.length ?? 0} nutrition-related traits, including ${data.parsed?.summary?.num_high_priority ?? data.parsed?.high_priority?.length ?? 0} high-priority findings.`,
        },
      ]);
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  }

  async function handleDemoLoad() {
    setLoading(true);
    try {
      const data = await uploadDemoReport();
      setReport(data);
      setAnalyses([]);
      setPreviewPdfUrl(getReportPdfUrl(data.report_id));

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `Demo report loaded. I detected ${data.parsed?.summary?.num_traits ?? data.parsed?.traits?.length ?? 0} nutrition-related traits.`,
        },
      ]);
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  }

  async function runReportAnalysis() {
    if (!report) return;

    setAnalysisLoading(true);
    try {
      const data = await analyzeReport(report.report_id, 5);
      setAnalyses(data.analyses || []);

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `I completed RAG analysis for ${data.num_analyzed} report findings. Click any evidence card to open the textbook page.`,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Report-level RAG analysis failed. Please check backend logs and RAG index.",
        },
      ]);
    }

    setAnalysisLoading(false);
  }

  async function ask(q) {
    const text = q || question;
    if (!text.trim() || !report) return;

    setQuestion("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);

    try {
      const data = await sendChat(report.report_id, text);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data.answer || "No answer returned.",
          reference_layer: data.reference_layer || data.intake_references || [],
          evidence: data.evidence || [],
          reference_layer: data.reference_layer || data.intake_references || [],
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Chat request failed. Please check the backend server and RAG logs.",
        },
      ]);
    }

    setLoading(false);
  }


  async function openPdfViewer({ type, title, subtitle, url, page }) {
    try {
      // Keep page fragment separate because fetch() ignores URL hash fragments.
      const cleanUrl = String(url).split("#")[0];

      // console.log(`Fetching PDF from 1 : ${previewPdfUrl}`);
      // console.log(`Fetching PDF from 2 : ${getDemoPdfUrl()}`);

      const res = await fetch(cleanUrl);
    
      if (!res.ok) throw new Error("PDF fetch failed");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const finalUrl = page ? `${blobUrl}#page=${page}` : blobUrl;

      setViewer({
        type,
        title,
        subtitle,
        url: finalUrl,
      });
    } catch (e) {
      alert("Could not preview PDF. Check backend PDF endpoint.");
    }
  }

  function openEvidence(e) {
    const bookId = e.book_id || e.source_book_id;
    const page = e.page || e.source_page || e.pdf_page;

    if (!bookId) {
      alert("This evidence does not include a book_id.");
      return;
    }

    openPdfViewer({
      type: "textbook",
      title: e.book_title || bookId,
      subtitle: `book_id=${bookId}${page ? ` · page ${page}` : ""} · ${e.modality || "text"}`,
      url: getTextbookPdfUrl(bookId),
      page,
    });
  }

  const defaultQuestions = [
    "Which findings in my report are most important?",
    "Explain my folate/MTHFR result in simple terms.",
    "What should I know about weak caffeine metabolism?",
    "Which results should I confirm with blood tests or a clinician?",
  ];

  return (
    <div className="page">
      <PdfViewerModal viewer={viewer} onClose={() => setViewer(null)} />

      <header className="topbar">
        <div className="brand-pill">
          <Sparkles size={16} />
          Nutrition Genetic RAG Assistant
        </div>
        <div className="topbar-right">Official RAPTOR Hybrid Demo</div>
      </header>

      <main className="main">
        <section className="hero">
          <h1>Your Genetic Nutrition Insights</h1>
          <div className="hero-line" />
          <p>
            Upload a genetic nutrition report, review key findings, preview the PDF,
            and ask textbook-grounded questions powered by RAPTOR RAG.
          </p>
        </section>

        <div className="layout">
          <section className="left-col">
            <div className="panel upload-panel">
              <div className="upload-box">
                <div className="upload-icon">
                  <Upload size={34} />
                </div>
                <h2>Upload Gene Nutrition Report</h2>
                <p>PDF report only. You can upload your own report or use the built-in demo report.</p>

                <label className="file-picker">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0])}
                  />
                  <span>{file ? file.name : "Choose PDF file"}</span>
                </label>

                <div className="button-row">
                  <button
                    className="primary-btn"
                    onClick={handleUpload}
                    disabled={!file || loading}
                  >
                    {loading ? "Processing..." : "Upload & Analyze"}
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={handleDemoLoad}
                    disabled={loading}
                  >
                    <PlayCircle size={16} />
                    Reload Demo Report
                  </button>

                  <button
                    className="preview-card-btn"
                    onClick={() =>
                      openPdfViewer({
                        type: "report",
                        title: report?.filename || "Demo Genetic Nutrition Report",
                        subtitle: "PDF preview",
                        url: previewPdfUrl || getDemoPdfUrl(),
                        page: null,
                      })
                    }
                    disabled={!previewPdfUrl}
                  >
                    <Eye size={16} />
                    <FileText size={22} />
                    <span>
                      <strong>Demo Report</strong>
                      <small>Preview PDF</small>
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {report ? (
              <div className="panel suggested-panel">
              <div className="panel-title compact">
                <ShieldCheck size={19} />
                <h2>Suggested Questions</h2>
              </div>
              <div className="suggested-list">
                {(report ? traits.flatMap((t) => t.suggested_questions || []).slice(0, 8) : defaultQuestions).map(
                  (q, i) => (
                    <button key={i} disabled={!report && i > 0} onClick={() => ask(q)}>
                      {q}
                    </button>
                  )
                )}
              </div>
            </div>
            ) : (
              <div className="panel empty-panel">
                <Brain size={32} />
                <h2>What this assistant can do</h2>
                <div className="feature-grid">
                  <div>Load a demo genetic nutrition PDF</div>
                  <div>Preview the report inside the interface</div>
                  <div>Use six textbooks as RAPTOR evidence</div>
                  <div>Click evidence to jump to the source textbook page</div>
                </div>
              </div>
            )}
          </section>

          <aside className="right-col">
            <div className="panel warning-panel">
              <div className="warning-title">
                <AlertTriangle size={18} />
                Important
              </div>
              <p>
                Responses are educational only and may be incomplete. Genetic
                nutrition reports do not diagnose deficiencies or diseases.
                Consult a qualified clinician or dietitian for medical decisions.
              </p>
            </div>

            <div className="panel">
                <div className="panel-title">
                  <FileText size={20} />
                  <div>
                    <h2>Report Summary</h2>
                    <p>{report?.filename || "Demo Report"}</p>
                  </div>
                </div>

                <div className="stats-grid">
                  <div className="stat-card stat-blue">
                    <div className="stat-num">{traits.length}</div>
                    <div className="stat-label">Detected traits</div>
                  </div>
                  <div className="stat-card stat-red">
                    <div className="stat-num">{high.length}</div>
                    <div className="stat-label">High priority</div>
                  </div>
                  <div className="stat-card stat-yellow">
                    <div className="stat-num">{medium.length}</div>
                    <div className="stat-label">Medium priority</div>
                  </div>
                </div>

                <button
                  className="primary-btn analysis-btn"
                  onClick={runReportAnalysis}
                  disabled={analysisLoading}
                >
                  {analysisLoading ? "Running RAG Analysis..." : "Run RAG Analysis for Top Findings"}
                </button>

                {analyses.length > 0 && (
                  <div className="analysis-list">
                    <h2 className="analysis-heading">RAG Analysis</h2>
                    {analyses.map((a, idx) => (
                      <div className="analysis-card" key={idx}>
                        <div className="analysis-card-head">
                          <div>
                            <h3>{a.trait?.trait || "Unknown trait"}</h3>
                            <p>Report result: {a.trait?.result || "Not specified"}</p>
                          </div>
                          <PriorityBadge priority={a.trait?.priority} />
                        </div>

                        <div className="analysis-answer">
                          {a.answer || "No analysis returned."}
                        </div>

                        <EvidenceList evidence={a.evidence} onOpenEvidence={openEvidence} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="trait-list">
                  {[
                    { name: "High", label: "High priority", items: high, defaultOpen: true },
                    { name: "Medium", label: "Medium priority", items: medium, defaultOpen: false },
                    {
                      name: "Normal",
                      label: "Normal priority",
                      items: traits.filter((t) => !["High", "Medium"].includes(t?.priority)),
                      defaultOpen: false,
                    },
                  ]
                    .filter((group) => Array.isArray(group.items) && group.items.length > 0)
                    .map((group) => (
                      <details
                        className={`summary-group-section summary-group-${group.name.toLowerCase()}`}
                        key={group.name}
                        open={group.defaultOpen}
                      >
                        <summary className="summary-group-header">
                          <span>{group.label}</span>
                          <strong>{group.items.length}</strong>
                          <span className="summary-group-hint">Click to expand</span>
                        </summary>

                        <div className="summary-group-list">
                          {group.items.map((t, idx) => (
                    <div className="trait-card" key={idx}>
                      <div className="trait-head">
                        <div>
                          <h3>{t?.trait || "Unknown trait"}</h3>
                          <p>Result: {t?.result || "Not specified"}</p>

                          {Array.isArray(t?.genes) && t.genes.length > 0 && (
                            <p className="small-muted">Genes: {t.genes.join(", ")}</p>
                          )}

                          {Array.isArray(t?.snps) && t.snps.length > 0 && (
                            <p className="small-muted">SNPs: {t.snps.join(", ")}</p>
                          )}

                          {Array.isArray(t?.genotypes) && t.genotypes.length > 0 && (
                            <p className="small-muted">
                              Genotypes: {t.genotypes.map(g => `${g.snp}/${g.gene}: ${g.genotype}`).join(", ")}
                            </p>
                          )}
                        </div>
                        <PriorityBadge priority={t?.priority} />
                      </div>

                      <div className="question-chips">
                        {(Array.isArray(t?.suggested_questions) ? t.suggested_questions : []).slice(0, 3).map((q, i) => (
                          <button key={i} onClick={() => ask(q)}>
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                        </div>
                      </details>
                    ))}
                </div>
              </div>

            <div className="chat-panel">
              <div className="chat-header">
                <div>
                  <div className="eyebrow">EBOGENES</div>
                  <h2>
                    <MessageCircle size={20} />
                    AI Nutrition Consultant
                  </h2>
                </div>
                <span className="ready-dot">● Ready</span>
              </div>

              <div className="chat-body">
                {messages.map((m, idx) => (
                  <div key={idx} className={`message-row ${m.role}`}>
                    <div className={`bubble ${m.role}`}>
                      <div className="bubble-text">{m.text}</div>
                      <EvidenceList evidence={m.evidence} onOpenEvidence={openEvidence} />
                      <CombinedReferenceList references={m.reference_layer || m.intake_references || m.references || []} />
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message-row assistant">
                    <div className="bubble assistant">
                      <div className="typing">Thinking with RAPTOR RAG...</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="chat-input">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") ask();
                  }}
                  disabled={!report || loading}
                  placeholder={report ? "Ask about your report..." : "Upload or load demo first"}
                />
                <button
                  onClick={() => ask()}
                  disabled={!report || loading || !question.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

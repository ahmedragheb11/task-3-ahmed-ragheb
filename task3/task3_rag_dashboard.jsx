import { useState, useRef } from "react";

const COLORS = {
  risk: { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
  date: { bg: "#E6F1FB", text: "#185FA5", border: "#85B7EB" },
  stakeholder: { bg: "#EAF3DE", text: "#3B6D11", border: "#97C459" },
  clause: { bg: "#FAEEDA", text: "#854F0B", border: "#EF9F27" },
};

const Badge = ({ type, children }) => (
  <span style={{
    display: "inline-block", fontSize: 11, fontWeight: 500,
    padding: "2px 8px", borderRadius: 99,
    background: COLORS[type].bg, color: COLORS[type].text,
    border: `0.5px solid ${COLORS[type].border}`, marginRight: 4, marginBottom: 4,
  }}>{children}</span>
);

const Pill = ({ label, color }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12,
    padding: "3px 10px", borderRadius: 99,
    background: COLORS[color].bg, color: COLORS[color].text,
    border: `0.5px solid ${COLORS[color].border}`,
  }}>{label}</span>
);

const Card = ({ children, style }) => (
  <div style={{
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    padding: "1rem 1.25rem",
    ...style,
  }}>{children}</div>
);

const Section = ({ title, icon, items, color, empty }) => (
  <Card style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: 16, color: COLORS[color].text }} aria-hidden="true" />
      <span style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>{title}</span>
      <span style={{
        marginLeft: "auto", fontSize: 11, fontWeight: 500,
        background: COLORS[color].bg, color: COLORS[color].text,
        padding: "1px 7px", borderRadius: 99, border: `0.5px solid ${COLORS[color].border}`
      }}>{items.length} found</span>
    </div>
    {items.length === 0
      ? <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", margin: 0 }}>{empty}</p>
      : <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {items.map((item, i) => <Badge key={i} type={color}>{item}</Badge>)}
        </div>
    }
  </Card>
);

export default function RAGDashboard() {
  const [docText, setDocText] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setDocText(ev.target.result);
    reader.readAsText(file);
  };

  const analyzeDoc = async () => {
    if (!docText.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setAnswer("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a legal document analyst. Analyze this document and extract key information. Return ONLY a valid JSON object with no markdown, no preamble:
{
  "risks": ["list of risk items found, each as a short phrase"],
  "dates": ["list of important dates/deadlines found"],
  "stakeholders": ["list of parties/entities/people mentioned"],
  "keyClauses": ["list of 3-5 important clause summaries"],
  "summary": "2-3 sentence executive summary of the document"
}

Document:
${docText.slice(0, 8000)}`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      setAnalysis(JSON.parse(clean));
    } catch (err) {
      setAnalysis({ error: "Could not analyze document. Please try again." });
    }
    setLoading(false);
  };

  const askQuestion = async () => {
    if (!question.trim() || !docText.trim()) return;
    setQaLoading(true);
    setAnswer("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a document Q&A assistant. Answer the question based ONLY on the document provided. Cite specific sections or line numbers when possible. If the answer is not in the document, say so clearly.

Document:
${docText.slice(0, 8000)}

Question: ${question}

Provide a clear, cited answer.`
          }]
        })
      });
      const data = await res.json();
      setAnswer(data.content?.map(b => b.text || "").join("") || "No answer returned.");
    } catch {
      setAnswer("Error fetching answer. Please try again.");
    }
    setQaLoading(false);
  };

  const hasDoc = docText.trim().length > 0;

  return (
    <div style={{ padding: "1rem 0", fontFamily: "var(--font-sans)" }}>
      <h2 className="sr-only">RAG Document Intelligence Dashboard</h2>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <i className="ti ti-file-search" style={{ fontSize: 20, color: "var(--color-text-secondary)" }} aria-hidden="true" />
          <span style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>Document intelligence</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          Upload any text document to extract risks, dates, stakeholders, and key clauses — then ask questions with citations.
        </p>
      </div>

      {/* Upload */}
      <Card style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <input type="file" accept=".txt,.md,.csv,.json" ref={fileRef} onChange={handleFile} style={{ display: "none" }} />
          <button onClick={() => fileRef.current.click()} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-upload" aria-hidden="true" /> Upload file
          </button>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {fileName || "No file selected (.txt, .md, .csv, .json)"}
          </span>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>— or paste text below</span>
        </div>
        <textarea
          value={docText}
          onChange={e => setDocText(e.target.value)}
          placeholder="Paste your document text here (contracts, legal docs, reports, etc.)..."
          style={{ width: "100%", minHeight: 100, marginTop: 12, fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
        />
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button onClick={analyzeDoc} disabled={!hasDoc || loading}>
            {loading ? "Analyzing…" : "Analyze document ↗"}
          </button>
          {analysis && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: COLORS.stakeholder.text }}>
                <i className="ti ti-check" aria-hidden="true" /> Analysis complete
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      {analysis && !analysis.error && (
        <>
          <div style={{ display: "flex", gap: 2, marginBottom: "1rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            {[["dashboard", "layout-dashboard", "Dashboard"], ["qa", "message-question", "Ask questions"]].map(([key, icon, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                borderRadius: 0, border: "none", borderBottom: tab === key ? "2px solid var(--color-text-primary)" : "2px solid transparent",
                background: "transparent", fontSize: 13, fontWeight: tab === key ? 500 : 400,
                color: tab === key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              }}>
                <i className={`ti ti-${icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {tab === "dashboard" && (
            <>
              {/* Summary */}
              <Card style={{ marginBottom: 12, background: "var(--color-background-secondary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <i className="ti ti-report" style={{ fontSize: 16, color: "var(--color-text-secondary)" }} aria-hidden="true" />
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Executive summary</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.6 }}>{analysis.summary}</p>
              </Card>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 12 }}>
                {[
                  ["Risks", analysis.risks?.length || 0, "risk", "alert-triangle"],
                  ["Dates", analysis.dates?.length || 0, "date", "calendar"],
                  ["Stakeholders", analysis.stakeholders?.length || 0, "stakeholder", "users"],
                  ["Key clauses", analysis.keyClauses?.length || 0, "clause", "file-text"],
                ].map(([label, count, color, icon]) => (
                  <div key={label} style={{ background: COLORS[color].bg, border: `0.5px solid ${COLORS[color].border}`, borderRadius: "var(--border-radius-md)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <i className={`ti ti-${icon}`} style={{ fontSize: 14, color: COLORS[color].text }} aria-hidden="true" />
                      <span style={{ fontSize: 11, color: COLORS[color].text }}>{label}</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 500, color: COLORS[color].text }}>{count}</div>
                  </div>
                ))}
              </div>

              <Section title="Risks identified" icon="alert-triangle" items={analysis.risks || []} color="risk" empty="No explicit risks found." />
              <Section title="Important dates & deadlines" icon="calendar" items={analysis.dates || []} color="date" empty="No specific dates found." />
              <Section title="Stakeholders & parties" icon="users" items={analysis.stakeholders || []} color="stakeholder" empty="No stakeholders identified." />

              {/* Key clauses */}
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <i className="ti ti-file-text" style={{ fontSize: 16, color: COLORS.clause.text }} aria-hidden="true" />
                  <span style={{ fontWeight: 500, fontSize: 14 }}>Key clauses</span>
                </div>
                {(analysis.keyClauses || []).map((clause, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < (analysis.keyClauses?.length || 0) - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, minWidth: 20, color: COLORS.clause.text, paddingTop: 2 }}>§{i + 1}</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{clause}</span>
                  </div>
                ))}
              </Card>
            </>
          )}

          {tab === "qa" && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <i className="ti ti-message-question" style={{ fontSize: 16, color: "var(--color-text-secondary)" }} aria-hidden="true" />
                <span style={{ fontWeight: 500, fontSize: 14 }}>Ask questions about the document</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 10px" }}>
                The AI will answer only from the document and cite specific sections.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && askQuestion()}
                  placeholder="e.g. What are the termination conditions?"
                  style={{ flex: 1, fontSize: 13 }}
                />
                <button onClick={askQuestion} disabled={!question.trim() || qaLoading}>
                  {qaLoading ? "…" : "Ask ↗"}
                </button>
              </div>
              {answer && (
                <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", borderLeft: `3px solid ${COLORS.date.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <i className="ti ti-sparkles" style={{ fontSize: 13, color: COLORS.date.text }} aria-hidden="true" />
                    <span style={{ fontSize: 11, fontWeight: 500, color: COLORS.date.text }}>AI answer (cited from document)</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{answer}</p>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {analysis?.error && (
        <div style={{ padding: "12px 14px", background: COLORS.risk.bg, border: `0.5px solid ${COLORS.risk.border}`, borderRadius: "var(--border-radius-md)", fontSize: 13, color: COLORS.risk.text }}>
          {analysis.error}
        </div>
      )}

      {!analysis && !loading && (
        <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--color-text-tertiary)" }}>
          <i className="ti ti-file-search" style={{ fontSize: 32, display: "block", marginBottom: 8 }} aria-hidden="true" />
          <span style={{ fontSize: 13 }}>Upload or paste a document to begin analysis</span>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  BookOpen,
  HelpCircle,
  Send,
  Languages,
  FileCheck,
  Check,
  ExternalLink,
  AlertCircle,
  Mic,
  Copy,
  Sparkles,
  UploadCloud,
  FileText,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function PolicyClarifier() {
  const [samplePolicies, setSamplePolicies] = useState([]);
  const [activePolicyTitle, setActivePolicyTitle] = useState("");
  const [activePolicyText, setActivePolicyText] = useState("");
  const [activePolicyDept, setActivePolicyDept] = useState("");
  const [policyUploadMode, setPolicyUploadMode] = useState("preset"); // "preset" | "upload" | "paste"
  const [policyPasteText, setPolicyPasteText] = useState("");
  const [selectedPolicyFile, setSelectedPolicyFile] = useState(null);
  const [policyExtractLoading, setPolicyExtractLoading] = useState(false);
  const policyFileInputRef = useRef(null);

  const [policyQuestion, setPolicyQuestion] = useState("");
  const [policyAsking, setPolicyAsking] = useState(false);
  const [policyAnswerResult, setPolicyAnswerResult] = useState(null);
  const [targetLang, setTargetLang] = useState("hi");
  const [translatedAnswer, setTranslatedAnswer] = useState("");
  const [translatingAnswer, setTranslatingAnswer] = useState(false);
  const [copiedPolicyAnswer, setCopiedPolicyAnswer] = useState(false);
  const [isPolicyRecording, setIsPolicyRecording] = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [policyBlobUrl, setPolicyBlobUrl] = useState("");

  const answerRef = useRef(null);

  // GSAP reveal for answered policy
  useGSAP(() => {
    if (policyAnswerResult && answerRef.current) {
      gsap.from(answerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      });
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [policyAnswerResult]);

  const loadSamplePolicies = async () => {
    try {
      const res = await fetch("/api/policy/samples");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSamplePolicies(data);
        if (data.length > 0 && !activePolicyText) {
          handleSelectSamplePolicy(data[0].id);
        }
      }
    } catch (e) {
      console.error("Error loading sample policies:", e);
    }
  };

  useEffect(() => {
    loadSamplePolicies();
  }, []);

  const handleSelectSamplePolicy = async (id) => {
    try {
      const res = await fetch(`/api/policy/sample/${id}`);
      const data = await res.json();
      setActivePolicyTitle(data.title);
      setActivePolicyText(data.text);
      setActivePolicyDept(data.department);
      setPolicyBlobUrl("");
      setPolicyAnswerResult(null);
      setTranslatedAnswer("");
    } catch (e) {
      console.error("Error selecting sample policy:", e);
    }
  };

  const handleExtractPolicyFile = async () => {
    if (!selectedPolicyFile) {
      alert("Please choose a policy circular file (PDF/Image) first.");
      return;
    }
    setPolicyExtractLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedPolicyFile);
      const res = await fetch("/api/policy/extract", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setActivePolicyTitle(data.title || selectedPolicyFile.name);
      setActivePolicyText(data.text);
      setActivePolicyDept("Uploaded Government Circular");
      setPolicyBlobUrl(data.blob_url || "");
      setPolicyAnswerResult(null);
      setTranslatedAnswer("");
    } catch (e) {
      console.error("Error extracting policy file:", e);
      alert("Failed to analyze policy file.");
    } finally {
      setPolicyExtractLoading(false);
    }
  };

  const handleApplyPastedPolicy = async () => {
    if (!policyPasteText.trim()) {
      alert("Please paste government policy text first.");
      return;
    }
    setPolicyExtractLoading(true);
    try {
      const res = await fetch("/api/policy/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: policyPasteText.trim() }),
      });
      const data = await res.json();
      setActivePolicyTitle(data.title || "Custom Pasted Circular");
      setActivePolicyText(data.text);
      setActivePolicyDept("Custom Municipal Notification");
      setPolicyBlobUrl(data.blob_url || "");
      setPolicyAnswerResult(null);
      setTranslatedAnswer("");
    } catch (e) {
      console.error("Error applying pasted text:", e);
      alert("Failed to process policy text.");
    } finally {
      setPolicyExtractLoading(false);
    }
  };

  const handleAskPolicyDoubt = async (overrideQuestion) => {
    const q = overrideQuestion || policyQuestion;
    if (!q.trim()) return;
    if (!activePolicyText) {
      alert("Please select or upload a policy document first.");
      return;
    }
    setPolicyAsking(true);
    setPolicyAnswerResult(null);
    setTranslatedAnswer("");
    try {
      const res = await fetch("/api/policy/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.trim(),
          policy_text: activePolicyText,
          policy_title: activePolicyTitle,
          department: activePolicyDept,
        }),
      });
      const data = await res.json();
      setPolicyAnswerResult(data);
    } catch (e) {
      console.error("Error asking policy doubt:", e);
      alert("Failed to synthesize legal answer.");
    } finally {
      setPolicyAsking(false);
    }
  };

  const handleTranslatePolicyAnswer = async () => {
    if (!policyAnswerResult || !policyAnswerResult.answer) return;
    setTranslatingAnswer(true);
    try {
      const res = await fetch("/api/policy/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: policyAnswerResult.answer,
          target_lang: targetLang,
        }),
      });
      const data = await res.json();
      setTranslatedAnswer(data.translated_text || "");
    } catch (e) {
      console.error("Error translating answer:", e);
      alert("Translation failed.");
    } finally {
      setTranslatingAnswer(false);
    }
  };

  const togglePolicySpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isPolicyRecording) {
      setIsPolicyRecording(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "hi-IN";
      recognition.onstart = () => setIsPolicyRecording(true);
      recognition.onend = () => setIsPolicyRecording(false);
      recognition.onerror = () => setIsPolicyRecording(false);
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setPolicyQuestion((prev) => (prev ? prev + " " + transcript : transcript));
      };
      recognition.start();
    } catch (err) {
      setIsPolicyRecording(false);
    }
  };

  const copyAnswerToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopiedPolicyAnswer(true);
    setTimeout(() => setCopiedPolicyAnswer(false), 2000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <BookOpen size={22} color="var(--terracotta)" />
            <span>Government Policy Clarifier & Citizen Doubts</span>
          </h2>
          <p className="card-subtitle">
            Grounded question answering over official welfare schemes, statutory rules, and gazette notifications.
          </p>
        </div>
        <span className="badge badge-primary">Statutory Policy Engine</span>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`btn btn-sm ${policyUploadMode === "preset" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setPolicyUploadMode("preset")}
        >
          <Building2 size={14} />
          <span>Official Chandigarh Schemes</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${policyUploadMode === "upload" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setPolicyUploadMode("upload")}
        >
          <UploadCloud size={14} />
          <span>Upload Circular (PDF/Image)</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${policyUploadMode === "paste" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setPolicyUploadMode("paste")}
        >
          <FileText size={14} />
          <span>Paste Custom Policy Text</span>
        </button>
      </div>

      {/* 1. Official Schemes Library */}
      {policyUploadMode === "preset" && (
        <div style={{ marginBottom: "2rem" }}>
          <label className="field-label" style={{ marginBottom: "0.75rem", display: "block" }}>
            Select an Official Government Welfare Policy:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {samplePolicies.map((p) => {
              const isSelected = activePolicyTitle === p.title;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectSamplePolicy(p.id)}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "10px",
                    border: `1px solid ${isSelected ? "var(--slate-900)" : "var(--slate-200)"}`,
                    background: isSelected ? "var(--surface-subtle)" : "#ffffff",
                    cursor: "pointer",
                    boxShadow: isSelected ? "var(--shadow-sm)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--terracotta)", textTransform: "uppercase", marginBottom: "4px" }}>
                    {p.department}
                  </div>
                  <strong style={{ fontSize: "0.96rem", color: "var(--slate-900)", display: "block", marginBottom: "6px" }}>
                    {p.title}
                  </strong>
                  <p style={{ fontSize: "0.82rem", color: "var(--slate-600)", lineHeight: 1.45, margin: 0 }}>
                    {p.summary}
                  </p>
                  {isSelected && (
                    <div style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--emerald-dark)", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={12} />
                      <span>Active Document</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. File Upload Mode */}
      {policyUploadMode === "upload" && (
        <div style={{ marginBottom: "2rem" }}>
          <input
            type="file"
            ref={policyFileInputRef}
            accept=".pdf,image/png,image/jpeg"
            style={{ display: "none" }}
            onChange={(e) => setSelectedPolicyFile(e.target.files[0] || null)}
          />

          <div
            className="dropzone-box"
            onClick={() => policyFileInputRef.current && policyFileInputRef.current.click()}
          >
            <div className="dropzone-icon">
              <UploadCloud size={40} />
            </div>
            <strong style={{ fontSize: "0.96rem", color: "var(--slate-900)", display: "block" }}>
              {selectedPolicyFile ? `Selected: ${selectedPolicyFile.name}` : "Click to Upload Official Circular (PDF / Image)"}
            </strong>
            <p style={{ fontSize: "0.82rem", color: "var(--slate-500)", marginTop: "4px" }}>
              Azure Document Intelligence extracts sections and statutory clauses.
            </p>
          </div>

          <button
            type="button"
            className="btn-primary-action"
            onClick={handleExtractPolicyFile}
            disabled={policyExtractLoading || !selectedPolicyFile}
          >
            <FileCheck size={16} />
            <span>{policyExtractLoading ? "Analyzing Circular..." : "Analyze & Ingest Document"}</span>
          </button>
        </div>
      )}

      {/* 3. Paste Text Mode */}
      {policyUploadMode === "paste" && (
        <div style={{ marginBottom: "2rem" }}>
          <div className="form-group">
            <label className="form-label">Paste Government Policy / Circular Text</label>
            <textarea
              placeholder="Paste full text of municipal notification, subsidy circular, or statutory gazette here..."
              value={policyPasteText}
              onChange={(e) => setPolicyPasteText(e.target.value)}
              className="form-textarea"
              style={{ minHeight: "130px" }}
            />
          </div>

          <button
            type="button"
            className="btn-primary-action"
            onClick={handleApplyPastedPolicy}
            disabled={!policyPasteText.trim() || policyExtractLoading}
          >
            <Check size={16} />
            <span>Load & Ingest Policy Text</span>
          </button>
        </div>
      )}

      {/* Active Document Header Banner */}
      {activePolicyText && (
        <div style={{ background: "var(--surface-subtle)", border: "1px solid var(--slate-200)", borderRadius: "10px", padding: "1.25rem", marginBottom: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--terracotta)", textTransform: "uppercase" }}>
              Active Grounding Circular
            </span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--slate-900)", marginTop: "2px" }}>
              {activePolicyTitle}
            </h3>
            <div style={{ fontSize: "0.78rem", color: "var(--slate-500)", marginTop: "2px" }}>
              Jurisdiction: <strong>{activePolicyDept}</strong> • {activePolicyText.length.toLocaleString()} characters indexed
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {policyBlobUrl && (
              <a
                href={policyBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                title="View original file in Azure Blob Storage"
              >
                <ExternalLink size={13} />
                <span>Azure Blob</span>
              </a>
            )}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowDocPreview(!showDocPreview)}
            >
              {showDocPreview ? "Hide Circular Text ▲" : "View Full Circular ▼"}
            </button>
          </div>
        </div>
      )}

      {showDocPreview && activePolicyText && (
        <div style={{ background: "var(--surface-subtle)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--slate-200)", maxHeight: "280px", overflowY: "auto", marginBottom: "1.75rem" }}>
          <pre style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--slate-800)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {activePolicyText}
          </pre>
        </div>
      )}

      {/* Q&A Console */}
      <div style={{ background: "#ffffff", border: "1px solid var(--slate-200)", borderRadius: "12px", padding: "1.75rem", boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <label className="field-label" style={{ margin: 0, fontSize: "0.88rem" }}>
            Ask a Question or Clarification Regarding This Policy:
          </label>
          <button
            type="button"
            className={`voice-btn ${isPolicyRecording ? "recording" : ""}`}
            onClick={togglePolicySpeechRecognition}
          >
            <Mic size={14} />
            <span>{isPolicyRecording ? "Listening..." : "Speak Question"}</span>
          </button>
        </div>

        {/* Suggested Quick Questions */}
        <div className="quick-scenarios-panel" style={{ marginTop: 0 }}>
          <span className="quick-scenarios-title">Common Queries:</span>
          <div className="quick-chips-row">
            {activePolicyTitle.includes("Water") ? (
              <>
                <button
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => {
                    setPolicyQuestion("What happens if water consumption exceeds 20,000 litres?");
                    handleAskPolicyDoubt("What happens if water consumption exceeds 20,000 litres?");
                  }}
                >
                  💧 Exceeding 20,000 litres rule?
                </button>
                <button
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => {
                    setPolicyQuestion("Who is eligible for the 20kL free water lifeline scheme?");
                    handleAskPolicyDoubt("Who is eligible for the 20kL free water lifeline scheme?");
                  }}
                >
                  💧 Who is eligible?
                </button>
                <button
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => {
                    setPolicyQuestion("What is the billing rule if the water meter is defective or stopped?");
                    handleAskPolicyDoubt("What is the billing rule if the water meter is defective or stopped?");
                  }}
                >
                  💧 Defective meter assessment rule?
                </button>
              </>
            ) : activePolicyTitle.includes("Surya") ? (
              <>
                <button
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => {
                    setPolicyQuestion("How much central financial assistance subsidy is granted for a 3 kW rooftop solar system?");
                    handleAskPolicyDoubt("How much central financial assistance subsidy is granted for a 3 kW rooftop solar system?");
                  }}
                >
                  ⚡ Subsidy for 3 kW system?
                </button>
                <button
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => {
                    setPolicyQuestion("What documents are required to apply for PM Surya Ghar in Chandigarh?");
                    handleAskPolicyDoubt("What documents are required to apply for PM Surya Ghar in Chandigarh?");
                  }}
                >
                  ⚡ Required documents?
                </button>
                <button
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => {
                    setPolicyQuestion("What is the statutory timeline for CPDL to inspect and install net meters?");
                    handleAskPolicyDoubt("What is the statutory timeline for CPDL to inspect and install net meters?");
                  }}
                >
                  ⚡ Net meter timeline?
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => {
                    setPolicyQuestion("What is the penalty if the Public Information Officer delays response beyond 30 days?");
                    handleAskPolicyDoubt("What is the penalty if the Public Information Officer delays response beyond 30 days?");
                  }}
                >
                  📜 Penalty for 30-day delay?
                </button>
                <button
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => {
                    setPolicyQuestion("Are citizens below poverty line (BPL) exempt from application and copying fees?");
                    handleAskPolicyDoubt("Are citizens below poverty line (BPL) exempt from application and copying fees?");
                  }}
                >
                  📜 BPL citizen exemptions?
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <textarea
            placeholder="Type your question or doubt in Hindi, Punjabi, or English..."
            value={policyQuestion}
            onChange={(e) => setPolicyQuestion(e.target.value)}
            className="form-textarea"
            style={{ minHeight: "90px" }}
          />
        </div>

        <button
          type="button"
          className="btn-primary-action"
          onClick={() => handleAskPolicyDoubt()}
          disabled={policyAsking || !policyQuestion.trim() || !activePolicyText}
        >
          <Sparkles size={16} />
          <span>{policyAsking ? "Synthesizing Grounded Legal Answer with Azure OpenAI..." : "Analyze & Ground Legal Answer"}</span>
        </button>
      </div>

      {/* Answer & Translation Card */}
      {policyAnswerResult && (
        <div ref={answerRef} style={{ marginTop: "2rem", border: "1px solid var(--slate-200)", borderRadius: "12px", padding: "1.75rem", background: "#ffffff", boxShadow: "var(--shadow-card)", borderLeft: "4px solid var(--cobalt)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "1rem", borderBottom: "1px solid var(--slate-100)", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <span className="badge badge-success">✓ Grounded Policy Verification</span>
              <div style={{ fontSize: "0.78rem", color: "var(--slate-500)", marginTop: "4px" }}>
                Engine: <strong>{policyAnswerResult.source}</strong> (Azure AI Search + GPT-5-mini)
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => copyAnswerToClipboard(policyAnswerResult.answer)}
            >
              {copiedPolicyAnswer ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
              <span>{copiedPolicyAnswer ? "Copied" : "Copy Official Text"}</span>
            </button>
          </div>

          {/* Cited Statutory Clauses */}
          {policyAnswerResult.cited_clauses && policyAnswerResult.cited_clauses.length > 0 && (
            <div style={{ background: "var(--amber-subtle)", border: "1px solid var(--amber-border)", borderRadius: "8px", padding: "0.85rem 1rem", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "var(--amber)", display: "block", marginBottom: "4px" }}>
                Statutory Citations:
              </span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {policyAnswerResult.cited_clauses.map((clause, idx) => (
                  <span key={idx} style={{ background: "#ffffff", border: "1px solid var(--amber-border)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.76rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--slate-900)" }}>
                    § {clause}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* English Verified Answer */}
          <div style={{ marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.74rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "var(--slate-500)", display: "block", marginBottom: "6px" }}>
              Official Legal & Policy Finding:
            </span>
            <div style={{ fontSize: "0.95rem", color: "var(--slate-900)", lineHeight: 1.75, whiteSpace: "pre-line" }}>
              {policyAnswerResult.answer}
            </div>
          </div>

          {/* Regional Language Translation Tool */}
          <div style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--slate-100)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--slate-700)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Languages size={15} />
                <span>Translate to Regional Language:</span>
              </span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="form-input"
                style={{ width: "auto", minWidth: 160 }}
              >
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
                <option value="ur">Urdu (اردو)</option>
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleTranslatePolicyAnswer}
                disabled={translatingAnswer}
              >
                {translatingAnswer ? "Translating..." : "Translate via Azure AI"}
              </button>
            </div>

            {translatedAnswer && (
              <div style={{ background: "var(--surface-subtle)", border: "1px solid var(--slate-200)", borderRadius: "8px", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.76rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--slate-900)", marginBottom: "6px" }}>
                  <span>Translated Version ({targetLang.toUpperCase()}):</span>
                  <button
                    type="button"
                    style={{ background: "transparent", border: "none", color: "var(--cobalt)", cursor: "pointer", textDecoration: "underline", fontSize: "0.72rem" }}
                    onClick={() => copyAnswerToClipboard(translatedAnswer)}
                  >
                    Copy
                  </button>
                </div>
                <div style={{ fontSize: "0.92rem", color: "var(--slate-800)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                  {translatedAnswer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

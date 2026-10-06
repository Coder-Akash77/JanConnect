import { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  FileCheck,
  Scan,
  Droplets,
  Zap,
  Receipt,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function DocumentIntelligence({
  availableDocs,
  extractedDocs,
  setExtractedDocs,
  docLoading,
  setDocLoading,
}) {
  const [docExtractMode, setDocExtractMode] = useState("file_upload");
  const [manualDocText, setManualDocText] = useState("");
  const [liveDocResult, setLiveDocResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const docTemplates = [
    {
      label: "MCC Chandigarh Water Bill",
      icon: Droplets,
      color: "var(--cobalt)",
      text: "MUNICIPAL CORPORATION CHANDIGARH (MCC)\nWATER SUPPLY & SEWERAGE BILL\nAccount Number: CHD-WTR-22B-8902\nConsumer Name: Virender Sharma\nService Address: House No 1240, Sector 22-B, Chandigarh - 160022\nSub-Division: Sub Division No. 2, Sector 22\nBilling Period: August 2026\nMeter Number: MTR-CH-88319\nPrevious Reading: 1420 KL\nCurrent Reading: 2890 KL\nUnits Consumed: 1470 KL\nWater Charges: Rs. 3,850\nSewerage Cess (20%): Rs. 770\nTotal Amount Due: Rs. 4,850\nDue Date: 15-09-2026\nPayment Portal: e-Sampark Chandigarh / mcchandigarh.gov.in"
    },
    {
      label: "CPDL Electricity Bill",
      icon: Zap,
      color: "var(--amber)",
      text: "CHANDIGARH POWER DISTRIBUTION LIMITED (CPDL)\nELECTRICITY BILL - UT CHANDIGARH\nConsumer ID / Account No: CPDL-DS-35C-4410\nConsumer Name: Harpreet Singh\nService Address: House 312, Sector 35-C, Chandigarh - 160035\nOperation Sub-Division: Sector 34\nTariff Category: Domestic Supply (DS)\nSanctioned Load: 5.00 KW\nMeter Status: Normal\nUnits Billed: 480 kWh\nEnergy Charges: Rs. 2,160\nElectricity Duty & Taxes: Rs. 480\nTotal Payable Amount: Rs. 2,640\nDue Date: 22-09-2026\n24x7 Call Centre: 19121"
    },
    {
      label: "e-Sampark Service Receipt",
      icon: Receipt,
      color: "var(--terracotta)",
      text: "CHANDIGARH ADMINISTRATION - e-SAMPARK CENTER\nCITIZEN SERVICE ACKNOWLEDGEMENT RECEIPT\nCenter Location: e-Sampark Center, Sector 17, Chandigarh\nToken Number: CHD-SMP-2026-10492\nService Name: MCC Public Grievance Registration - Pipeline Leakage\nApplicant Name: Pooja Verma\nMobile Number: 9876543210\nAddress: Sector 19-C, Chandigarh\nSubmission Date: 08-09-2026\nStatutory Redressal Target: 48 Hours\nNodal Authority: Sub-Divisional Officer (PH), Municipal Corporation Chandigarh"
    }
  ];

  // Stage 2: Extract text manually
  const handleExtractManualText = async () => {
    if (!manualDocText.trim()) {
      alert("Please enter or paste document text to extract.");
      return;
    }
    setDocLoading(true);
    try {
      const res = await fetch("/api/extract-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manualDocText }),
      });
      const data = await res.json();
      setLiveDocResult(data);
    } catch (e) {
      console.error("Error extracting text:", e);
    } finally {
      setDocLoading(false);
    }
  };

  // Stage 2: Extract from file upload
  const handleExtractFile = async () => {
    if (!selectedFile) {
      alert("Please choose a file to upload first.");
      return;
    }
    setDocLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/extract-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setLiveDocResult(data);
    } catch (e) {
      console.error("Error extracting file:", e);
    } finally {
      setDocLoading(false);
    }
  };

  // Stage 2: Extract sample mock document
  const handleExtractSampleDoc = async (docId) => {
    setDocLoading(true);
    try {
      const res = await fetch(`/api/extract/${docId}`);
      const data = await res.json();
      setExtractedDocs((prev) => ({ ...prev, [docId]: data }));
    } catch (e) {
      console.error("Error extracting document:", e);
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Scan size={22} color="var(--terracotta)" />
            <span>Chandigarh Citizen Document Intelligence</span>
          </h2>
          <p className="card-subtitle">
            Extract structured civic entities (Consumer number, Sector/Ward, Amount due, Meter reading) from proof attachments using Azure Document Intelligence and Azure OpenAI.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className={`btn btn-sm ${docExtractMode === "file_upload" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setDocExtractMode("file_upload")}
          >
            <UploadCloud size={14} />
            <span>Upload Bill</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${docExtractMode === "manual_text" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setDocExtractMode("manual_text")}
          >
            <FileText size={14} />
            <span>Paste Text</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${docExtractMode === "samples" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setDocExtractMode("samples")}
          >
            <Receipt size={14} />
            <span>Sample Library</span>
          </button>
        </div>
      </div>

      {/* OPTION 1: UPLOAD FILE */}
      {docExtractMode === "file_upload" && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.png,.jpg,.jpeg,.tiff"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />

          <div
            className="dropzone-box"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <div className="dropzone-icon">
              <UploadCloud size={44} />
            </div>
            <strong style={{ fontSize: "1rem", color: "var(--slate-900)", display: "block" }}>
              {selectedFile ? `Selected: ${selectedFile.name}` : "Click to Browse & Upload Document"}
            </strong>
            <p style={{ fontSize: "0.82rem", color: "var(--slate-500)", marginTop: "4px" }}>
              Supports PDF, PNG, JPG, TIFF. Files are processed with Azure Document Intelligence (`prebuilt-layout`) and stored in Azure Blob Storage.
            </p>
          </div>

          <button
            type="button"
            className="btn-primary-action"
            onClick={handleExtractFile}
            disabled={docLoading || !selectedFile}
          >
            <Scan size={16} />
            <span>{docLoading ? "Processing with Azure Document Intelligence..." : "Analyze File with Azure Document Intelligence"}</span>
          </button>
        </div>
      )}

      {/* OPTION 2: PASTE TEXT */}
      {docExtractMode === "manual_text" && (
        <div>
          <div className="form-group">
            <label className="form-label">Paste Bill or Receipt Text</label>
            <textarea
              placeholder="Paste or type text from an MCC water bill, CPDL electricity bill, or e-Sampark receipt here..."
              value={manualDocText}
              onChange={(e) => setManualDocText(e.target.value)}
              className="form-textarea"
              style={{ minHeight: 140 }}
            />
          </div>

          {/* Quick Templates */}
          <div className="quick-scenarios-panel">
            <span className="quick-scenarios-title">Load Sample Bill Template:</span>
            <div className="quick-chips-row">
              {docTemplates.map((tpl, i) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    className="quick-chip-btn"
                    onClick={() => setManualDocText(tpl.text)}
                  >
                    <Icon size={13} color={tpl.color} />
                    <span>{tpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="btn-primary-action"
            onClick={handleExtractManualText}
            disabled={docLoading || !manualDocText.trim()}
          >
            <Search size={16} />
            <span>{docLoading ? "Extracting Entities with Azure OpenAI..." : "Extract Structured Entities"}</span>
          </button>
        </div>
      )}

      {/* LIVE EXTRACTION RESULT DISPLAY */}
      {liveDocResult && (docExtractMode === "file_upload" || docExtractMode === "manual_text") && (
        liveDocResult.error ? (
          <div style={{ marginTop: "1.75rem", padding: "1.25rem", background: "var(--critical-subtle)", color: "var(--critical)", borderRadius: "8px", border: "1px solid var(--critical-border)" }}>
            <strong>Extraction Error:</strong> {liveDocResult.error}
          </div>
        ) : (
          <div className="doc-card" style={{ marginTop: "2rem", border: "2px solid var(--cobalt-border)" }}>
            <div className="doc-card-header">
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--slate-900)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={16} color="var(--emerald)" />
                  <span>Extracted Document Entities</span>
                </strong>
                <div style={{ fontSize: "0.76rem", color: "var(--slate-500)", marginTop: "2px" }}>
                  Engine: {liveDocResult._source || "Azure Document Intelligence + OpenAI gpt-5-mini"}
                </div>
              </div>
              <span className="badge badge-success">Verified Structured Fields</span>
            </div>

            <table className="doc-fields-table">
              <tbody>
                {Object.entries(liveDocResult)
                  .filter(([k]) => !k.startsWith("_"))
                  .map(([key, val]) => (
                    <tr key={key}>
                      <td className="doc-field-name">{key.replace(/_/g, " ").toUpperCase()}:</td>
                      <td className="doc-field-value">{String(val)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* OPTION 3: SAMPLES LIBRARY */}
      {docExtractMode === "samples" && (
        <div className="doc-grid">
          {availableDocs && availableDocs.length > 0 ? (
            availableDocs.map((docId) => {
              const extracted = extractedDocs[docId];
              return (
                <div key={docId} className="doc-card">
                  <div className="doc-card-header">
                    <div>
                      <strong style={{ fontSize: "0.95rem", color: "var(--slate-900)" }}>
                        {docId.toUpperCase()}
                      </strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>
                        Archival Mock Document
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleExtractSampleDoc(docId)}
                      disabled={docLoading}
                    >
                      {extracted ? "Re-Extract" : "Extract"}
                    </button>
                  </div>

                  {extracted ? (
                    <table className="doc-fields-table">
                      <tbody>
                        {Object.entries(extracted)
                          .filter(([k]) => !k.startsWith("_"))
                          .map(([key, val]) => (
                            <tr key={key}>
                              <td className="doc-field-name">{key.replace(/_/g, " ")}:</td>
                              <td className="doc-field-value">{String(val)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontSize: "0.82rem", color: "var(--slate-500)", margin: "0.5rem 0" }}>
                      Click extract to parse consumer details, meter numbers, and billing amounts.
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--slate-500)" }}>
              No mock documents configured. Use Upload or Paste mode.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

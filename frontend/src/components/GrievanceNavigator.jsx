import { useState, useRef, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Droplets,
  Zap,
  Trash2,
  Construction,
  ShieldCheck,
  Clock,
  MapPin,
  Mic,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Search,
  AlertCircle,
  FileCheck,
  Building,
  HelpCircle,
} from "lucide-react";

export default function GrievanceNavigator({
  complaints = [],
  selectedComplaintId,
  setSelectedComplaintId,
  routingResult,
  setRoutingResult,
  filedResult,
  setFiledResult,
  loading,
  setLoading,
  filingLoading,
  setFilingLoading,
  onNavigateToTracker,
}) {
  const [intakeMode, setIntakeMode] = useState("manual");
  const [citizenName, setCitizenName] = useState("");
  const [selectedSector, setSelectedSector] = useState("Sector 22");
  const [selectedZone, setSelectedZone] = useState("All");
  const [customText, setCustomText] = useState("");
  const [apiError, setApiError] = useState(null);
  const [filingError, setFilingError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const audioInputRef = useRef(null);

  const containerRef = useRef(null);
  const findingCardRef = useRef(null);
  const ticketCardRef = useRef(null);

  // Administrative Sectors grouped by Urban Zones
  const sectorDatabase = [
    { sector: "Sector 1", zone: "Zone 1", sub: "Heritage / Capitol Complex" },
    { sector: "Sector 2", zone: "Zone 1", sub: "VIP / Administrative" },
    { sector: "Sector 3", zone: "Zone 1", sub: "Raj Bhavan Area" },
    { sector: "Sector 4", zone: "Zone 1", sub: "MLA Hostel & Residences" },
    { sector: "Sector 7", zone: "Zone 1", sub: "Sub-Div 1" },
    { sector: "Sector 8", zone: "Zone 1", sub: "Sub-Div 1" },
    { sector: "Sector 9", zone: "Zone 1", sub: "UT Secretariat / RTI Cell" },
    { sector: "Sector 10", zone: "Zone 1", sub: "Museum & Arts" },
    { sector: "Sector 11", zone: "Zone 1", sub: "Colleges / Residential" },
    { sector: "Sector 12", zone: "Zone 2", sub: "PGIMER & PEC" },
    { sector: "Sector 13 (Manimajra)", zone: "Zone 2", sub: "Manimajra Sub-Div" },
    { sector: "Sector 14 (Panjab University)", zone: "Zone 2", sub: "PU Campus" },
    { sector: "Sector 15", zone: "Zone 2", sub: "Sub-Div 2" },
    { sector: "Sector 16", zone: "Zone 2", sub: "General Hospital" },
    { sector: "Sector 17 (City Center)", zone: "Zone 2", sub: "MCC Head Office / Delux" },
    { sector: "Sector 18", zone: "Zone 2", sub: "CPDL Electricity Secretariat" },
    { sector: "Sector 19", zone: "Zone 2", sub: "Sub-Div 2" },
    { sector: "Sector 20", zone: "Zone 2", sub: "Sub-Div 2" },
    { sector: "Sector 21", zone: "Zone 2", sub: "Sub-Div 2" },
    { sector: "Sector 22", zone: "Zone 2", sub: "MCC Water Sub-Div 2" },
    { sector: "Sector 23", zone: "Zone 2", sub: "Sub-Div 2" },
    { sector: "Sector 26 (Grain Market)", zone: "Zone 3", sub: "Commercial / Transport" },
    { sector: "Sector 27", zone: "Zone 3", sub: "Sub-Div 3" },
    { sector: "Sector 28", zone: "Zone 3", sub: "Sub-Div 3" },
    { sector: "Sector 29", zone: "Zone 3", sub: "Industrial / Res" },
    { sector: "Sector 30", zone: "Zone 3", sub: "Sub-Div 3" },
    { sector: "Sector 31", zone: "Zone 3", sub: "Sub-Div 3" },
    { sector: "Sector 32 (GMCH)", zone: "Zone 3", sub: "Medical College" },
    { sector: "Sector 33", zone: "Zone 3", sub: "Sub-Div 3" },
    { sector: "Sector 34 (Commercial Hub)", zone: "Zone 3", sub: "Financial District" },
    { sector: "Sector 35", zone: "Zone 3", sub: "CPDL Sub-Div Sector 34" },
    { sector: "Sector 36", zone: "Zone 3", sub: "Sub-Div 3" },
    { sector: "Sector 37", zone: "Zone 3", sub: "Sub-Div 3" },
    { sector: "Sector 38", zone: "Zone 3", sub: "Sub-Div 3" },
    { sector: "Sector 39", zone: "Zone 4", sub: "Water Works / Maloya" },
    { sector: "Sector 40", zone: "Zone 4", sub: "Sub-Div 4" },
    { sector: "Sector 41", zone: "Zone 4", sub: "Sub-Div 4" },
    { sector: "Sector 42", zone: "Zone 4", sub: "Lake / Sports" },
    { sector: "Sector 43 (ISBT 43)", zone: "Zone 4", sub: "Interstate Bus Terminal" },
    { sector: "Sector 44", zone: "Zone 4", sub: "Sub-Div 4" },
    { sector: "Sector 45 (Burail)", zone: "Zone 4", sub: "Sub-Div 4" },
    { sector: "Sector 46", zone: "Zone 4", sub: "MOH Sanitation Ward 46" },
    { sector: "Sector 47", zone: "Zone 4", sub: "Sub-Div 4" },
    { sector: "Sector 48", zone: "Zone 4", sub: "Society Sectors" },
    { sector: "Sector 49", zone: "Zone 4", sub: "Society Sectors" },
    { sector: "Sector 50", zone: "Zone 4", sub: "Society Sectors" },
    { sector: "Industrial Area Phase 1", zone: "Zone 3", sub: "Industrial Cluster" },
    { sector: "Industrial Area Phase 2", zone: "Zone 3", sub: "Industrial Cluster" },
  ];

  const filteredSectors = useMemo(() => {
    if (selectedZone === "All") return sectorDatabase;
    return sectorDatabase.filter((s) => s.zone === selectedZone);
  }, [selectedZone]);

  // Curated Chandigarh Case Dossiers with Lucide icons
  const caseDossiers = [
    {
      label: "Sector 22 Water Bill Surge",
      icon: Droplets,
      text: "I received an inflated water bill of Rs. 4,850 for House No 1240, Sector 22-B via e-Sampark. Last month was Rs. 650. I suspect the smart water meter is faulty.",
      sector: "Sector 22",
      name: "Virender Sharma",
      color: "var(--cobalt)",
    },
    {
      label: "Manimajra Power Outage (ਪੰਜਾਬੀ)",
      icon: Zap,
      text: "Manimajra sub-division vich pichhle 4 ghante to bijli band hai. 19121 helpline te koi phone nahi chuk reha, kripya local transformer check karvao.",
      sector: "Sector 13 (Manimajra)",
      name: "Gurpreet Singh Sandhu",
      color: "var(--amber)",
    },
    {
      label: "Sector 35 Streetlights Out (हिन्दी)",
      icon: Construction,
      text: "Sector 35-C ke inner park aur V4 road ki street lights pichhle 5 din se band hain, raat ko pura andhera rehta hai aur chori ka darr hai.",
      sector: "Sector 35",
      name: "Sunita Aggarwal",
      color: "var(--terracotta)",
    },
    {
      label: "Sector 46 Waste Tipper Missed",
      icon: Trash2,
      text: "The MCC door-to-door waste collection tipper vehicle has missed Sector 46-D for two consecutive days. Segregated garbage is piling up.",
      sector: "Sector 46",
      name: "Deepak Mehta",
      color: "var(--emerald)",
    },
    {
      label: "Sector 19 Road Cave-in / Pothole",
      icon: Construction,
      text: "A dangerous deep pothole and road caving has formed near Sector 19 market roundabout causing two-wheeler accidents. Needs urgent patchwork.",
      sector: "Sector 19",
      name: "Pooja Verma",
      color: "var(--terracotta)",
    },
  ];

  // Multi-tier script and linguistic language detection
  const scriptTelemetry = useMemo(() => {
    if (!customText || !customText.trim()) {
      return { name: "Latin (English)", code: "en" };
    }

    const text = customText.trim();

    // 1. Native Unicode Script Detection
    if (/[\u0A00-\u0A7F]/.test(text)) return { name: "Gurmukhi (ਪੰਜਾਬੀ)", code: "pa" };
    if (/[\u0900-\u097F]/.test(text)) return { name: "Devanagari (हिन्दी)", code: "hi" };
    if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) return { name: "Urdu (اردو)", code: "ur" };
    if (/[\u0980-\u09FF]/.test(text)) return { name: "Bengali (বাংলা)", code: "bn" };
    if (/[\u0B80-\u0BFF]/.test(text)) return { name: "Tamil (தமிழ்)", code: "ta" };
    if (/[\u0C00-\u0C7F]/.test(text)) return { name: "Telugu (తెలుగు)", code: "te" };
    if (/[\u0A80-\u0AFF]/.test(text)) return { name: "Gujarati (ગુજરાતી)", code: "gu" };
    if (/[\u0C80-\u0CFF]/.test(text)) return { name: "Kannada (ಕನ್ನಡ)", code: "kn" };
    if (/[\u0D00-\u0D7F]/.test(text)) return { name: "Malayalam (മലയാളം)", code: "ml" };

    // 2. Romanized / Transliterated Language Detection (Latin Script)
    const lower = text.toLowerCase();

    // Distinct Punjabi tokens (Roman Punjabi / Gurmukhi in Latin script)
    const punjabiMarkers = [
      "vich", "wich", "chuk reha", "chuk rahi", "chuk rahe", "chuk rehi",
      "ghante to", "din to", "saade", "saada", "saadi", "tuhanu", "tuhada",
      "tuhadi", "assi", "tusi", "hunda", "hundi", "hunde", "karvao", "karwao",
      "kariye", "painda", "ditta", "ditti", "chali gayi", "jithe", "othe",
      "kithon", "kinne", "nai chuk", "nahi chuk", "chukda", "chuko",
      "te koi", "te phone", "helpline te", "manimajra"
    ];

    let punjabiScore = 0;
    for (const marker of punjabiMarkers) {
      if (lower.includes(marker)) punjabiScore += 3;
    }
    const punjabiWords = lower.match(/\b(vich|te|to|di|da|de|assi|tusi|saade|chuk|reha|rehi|karvao|kariye|hunda|chali)\b/g);
    if (punjabiWords) punjabiScore += punjabiWords.length;

    // Distinct Hindi / Hinglish tokens
    const hindiMarkers = [
      "hai", "hain", "tha", "thi", "the", "mein", "mai", "se", "aur", "ya",
      "mera", "meri", "mere", "humara", "humari", "humare", "aapka", "aapki",
      "kripya", "kripa", "kripaya", "bohot", "bahut", "zyada", "jyada",
      "pichhle", "din", "raat", "andhera", "rehta", "rehti", "chori", "darr",
      "sadak", "gaddha", "khadda", "kooda", "kachra", "gaadi", "theek",
      "karo", "karein", "aaya", "aayi", "gaya", "gayi", "band", "chahiye",
      "hoga", "hogi", "nahi", "nahin", "paani", "bijli", "sadak par", "din se"
    ];

    let hindiScore = 0;
    for (const marker of hindiMarkers) {
      if (lower.includes(marker)) hindiScore += 1;
    }
    const hindiWords = lower.match(/\b(hai|hain|tha|thi|the|ke|ki|ka|ko|mein|se|aur|ya|mera|meri|humara|kripya|bohot|bahut|zyada|din|raat|nahi|nahin|theek|karo|karein|band|aaya|aayi|gaya|gayi)\b/g);
    if (hindiWords) hindiScore += (hindiWords.length * 1.5);

    // Explicit check for Roman Punjabi dominance
    if (punjabiScore >= 2 && punjabiScore >= hindiScore) {
      return { name: "Punjabi (ਪੰਜਾਬੀ)", code: "pa" };
    }

    // Explicit check for Hinglish / Roman Hindi dominance
    if (hindiScore >= 3) {
      return { name: "Hindi (हिन्दी)", code: "hi" };
    }

    return { name: "Latin (English)", code: "en" };
  }, [customText]);

  // GSAP Smooth Reveal for Advisory Finding
  useGSAP(() => {
    if (routingResult && findingCardRef.current) {
      gsap.from(findingCardRef.current, {
        y: 25,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      });
      findingCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [routingResult]);

  // GSAP Smooth Reveal & Confetti for Stamped Certificate
  useGSAP(() => {
    if (filedResult && ticketCardRef.current) {
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ea580c", "#059669", "#2563eb", "#d97706"],
        });
      } catch (err) {
        // ignore
      }

      gsap.from(ticketCardRef.current, {
        scale: 0.96,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.2)",
      });
      ticketCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [filedResult]);

  // Browser Speech Recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech recognition is not supported in this browser. Please use Chrome/Edge or upload an audio file.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "hi-IN";

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCustomText((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  // Azure Cognitive Speech File Upload
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/transcribe-audio", {
        method: "POST",
        body: formData,
      });
      const txt = data.text || data.transcribed_text;
      if (txt) {
        setCustomText((prev) => (prev ? prev + " " + txt : txt));
      } else if (data.error) {
        alert("Azure Speech note: " + data.error);
      }
    } catch (err) {
      console.error("Audio transcription error:", err);
    } finally {
      setAudioUploading(false);
    }
  };

  // Process & Route Grievance
  const handleProcessComplaint = async () => {
    setApiError(null);
    let bodyData = {};
    if (intakeMode === "manual") {
      if (!customText || !customText.trim()) {
        setApiError("Please enter your grievance description or select a curated case dossier.");
        return;
      }
      let fullText = customText.trim();
      if (selectedSector && !fullText.toLowerCase().includes(selectedSector.toLowerCase())) {
        fullText = `[Location: ${selectedSector}] ${fullText}`;
      }
      bodyData = {
        raw_text: fullText,
        citizen_name: citizenName.trim() || "Chandigarh Citizen",
      };
    } else {
      if (!selectedComplaintId) {
        setApiError("Please select an archival grievance scenario from the list.");
        return;
      }
      bodyData = { complaint_id: selectedComplaintId };
    }

    setLoading(true);
    setFiledResult(null);
    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.error || !data.routing) {
        throw new Error(data?.error || `Server returned error (${res.status}).`);
      }
      setRoutingResult(data);
    } catch (e) {
      console.error("Error processing complaint:", e);
      setApiError(e.message || "Failed to reach backend server. Verify Flask is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  // Official Grievance Filing
  const handleFileComplaint = async () => {
    if (!routingResult) return;
    setFilingLoading(true);
    setFilingError(null);
    try {
      let bodyData = {};
      if (intakeMode === "manual") {
        bodyData = {
          raw_text: routingResult.complaint?.raw_text || customText,
          citizen_name: routingResult.complaint?.citizen_name || citizenName || "Chandigarh Citizen",
        };
      } else {
        bodyData = { complaint_id: selectedComplaintId };
      }

      const res = await fetch("/api/file-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.error || !data.tracking_id) {
        throw new Error(data?.error || `Failed to file grievance (status ${res.status})`);
      }
      setFiledResult(data);
    } catch (e) {
      console.error("Error filing complaint:", e);
      setFilingError(e.message || "Could not register grievance in Azure Table Storage.");
    } finally {
      setFilingLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* =====================================================================
          CARD 1: CITIZEN INTAKE STUDIO
          ===================================================================== */}
      <section className="studio-card">
        <header className="studio-header">
          <div className="studio-title-area">
            <span className="section-tag">
              <Sparkles size={14} />
              <span>Phase 1 • Citizen Intake & Location Radar</span>
            </span>
            <h2 className="studio-title">Draft & Route Public Grievance</h2>
            <p className="studio-subtitle">
              Submit in Hindi, Punjabi, or English. Instant statutory routing to MCC, CPDL, or UT Administration under the Punjab Right to Service Act 2011.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className={`btn btn-sm ${intakeMode === "manual" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setIntakeMode("manual")}
            >
              Draft Grievance
            </button>
            <button
              type="button"
              className={`btn btn-sm ${intakeMode === "mock" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setIntakeMode("mock")}
            >
              Archival Cases ({complaints.length})
            </button>
          </div>
        </header>

        {apiError && (
          <div style={{ background: "var(--critical-subtle)", border: "1px solid var(--critical-border)", color: "var(--critical)", padding: "0.85rem 1.15rem", borderRadius: "8px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.86rem" }}>
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        {intakeMode === "manual" ? (
          <div>
            {/* Form Row: Name & Phone */}
            <div className="form-grid-2">
              <div className="field-group">
                <label className="field-label">Citizen Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Virender Sharma"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="field-input"
                />
              </div>

              {/* Sector Picker with Zones */}
              <div className="field-group">
                <label className="field-label">Administrative Sector</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="field-input"
                >
                  {sectorDatabase.map((s) => (
                    <option key={s.sector} value={s.sector}>
                      {s.sector} — {s.sub} ({s.zone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Zone Filter Chips */}
            <div className="sector-picker-panel">
              <div className="sector-picker-header">
                <span className="sector-picker-title">
                  <MapPin size={13} color="var(--terracotta)" />
                  <span>Filter Sectors by Administrative Zone:</span>
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--slate-500)", fontFamily: "var(--font-mono)" }}>
                  {filteredSectors.length} Sectors Active
                </span>
              </div>
              <div className="zone-filter-strip">
                {["All", "Zone 1", "Zone 2", "Zone 3", "Zone 4"].map((z) => (
                  <button
                    key={z}
                    type="button"
                    className={`zone-pill ${selectedZone === z ? "active" : ""}`}
                    onClick={() => setSelectedZone(z)}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            {/* Grievance Drafting Canvas */}
            <div className="drafting-wrapper">
              <label className="field-label" style={{ marginBottom: "0.5rem" }}>
                Grievance Narration (Text or Voice)
              </label>
              <textarea
                placeholder="Describe your issue with water bills, power cuts, missed garbage collection, potholes, or streetlights in any language..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="drafting-textarea"
              />

              <div className="drafting-toolbar">
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span className="script-badge">
                    <span>Language Detected:</span>
                    <strong>{scriptTelemetry.name}</strong>
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className={`voice-btn ${isRecording ? "recording" : ""}`}
                    onClick={toggleSpeechRecognition}
                  >
                    <Mic size={14} />
                    <span>{isRecording ? "Listening (Click to Stop)..." : "Record Voice Note"}</span>
                  </button>

                  <input
                    type="file"
                    ref={audioInputRef}
                    accept="audio/*"
                    style={{ display: "none" }}
                    onChange={handleAudioUpload}
                  />

                  <button
                    type="button"
                    className="voice-btn"
                    onClick={() => audioInputRef.current && audioInputRef.current.click()}
                    disabled={audioUploading}
                  >
                    <span>{audioUploading ? "Transcribing..." : "Upload Audio (.wav/.mp3)"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Scenario Chips */}
            <div className="scenarios-strip">
              <span className="scenarios-title">
                <FileCheck size={13} color="var(--slate-600)" />
                <span>Quick Chandigarh Test Cases:</span>
              </span>
              <div className="scenario-chips-row">
                {caseDossiers.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      className="scenario-chip"
                      onClick={() => {
                        setCustomText(c.text);
                        setCitizenName(c.name);
                        setSelectedSector(c.sector);
                      }}
                    >
                      <Icon size={14} color={c.color} />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Analysis Trigger */}
            <button
              type="button"
              className="btn-primary-action"
              onClick={handleProcessComplaint}
              disabled={loading || !customText.trim()}
            >
              <Send size={16} />
              <span>{loading ? "Analyzing with Azure AI Search + Foundry..." : "Analyze & Formulate Legal Advisory"}</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Mock Complaints List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {complaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaintId(c.id)}
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "8px",
                    border: `1px solid ${selectedComplaintId === c.id ? "var(--slate-900)" : "var(--slate-200)"}`,
                    background: selectedComplaintId === c.id ? "var(--surface-subtle)" : "#ffffff",
                    cursor: "pointer",
                    boxShadow: selectedComplaintId === c.id ? "var(--shadow-sm)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "0.92rem", color: "var(--slate-900)" }}>{c.citizen_name}</strong>
                    <span className="badge badge-primary">{c.sector || "UT Chandigarh"}</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--slate-600)", margin: 0 }}>"{c.raw_text}"</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-primary-action"
              onClick={handleProcessComplaint}
              disabled={loading || !selectedComplaintId}
            >
              <Send size={16} />
              <span>{loading ? "Processing Archival Docket..." : "Analyze Selected Case"}</span>
            </button>
          </div>
        )}
      </section>

      {/* =====================================================================
          CARD 2: PROGRESSIVE STATUTORY LEGAL ADVISORY (GSAP REVEAL)
          ===================================================================== */}
      {routingResult && (
        <section ref={findingCardRef} className="statutory-finding-card">
          <header className="finding-header">
            <div>
              <span className="section-tag" style={{ color: "var(--cobalt)" }}>
                <ShieldCheck size={14} />
                <span>Phase 2 • Grounded Statutory Advisory</span>
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 800, color: "var(--slate-900)" }}>
                {routingResult.routing?.department_name || "Assigned Authority"}
              </h3>
            </div>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <span className="badge badge-primary">
                Confidence: {routingResult.routing?.confidence ? `${Math.round(routingResult.routing.confidence * 100)}%` : "Verified"}
              </span>
              <span className="badge badge-warning">
                <Clock size={12} />
                <span>SLA: {routingResult.response?.statutory_sla || "15 Days"}</span>
              </span>
            </div>
          </header>

          {/* Metadata Grid */}
          <div className="finding-meta-grid">
            <div className="meta-cell">
              <span className="meta-label">Competent Authority</span>
              <span className="meta-value">{routingResult.response?.authority || "Municipal Corporation Chandigarh"}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">Statutory Regulation</span>
              <span className="meta-value">{routingResult.response?.rule || "Punjab Right to Service Act 2011"}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">Official Nodal Office</span>
              <span className="meta-value">{routingResult.response?.office || "MCC Delux Building, Sector 17"}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">Department Helpline</span>
              <span className="meta-value" style={{ color: "var(--cobalt)" }}>
                {routingResult.response?.helpline || "0172-2787200"}
              </span>
            </div>
          </div>

          {/* Synthesized Legal Advisory */}
          <div className="finding-content-box">
            <span className="finding-content-title">
              <FileCheck size={14} />
              <span>Official Citizen Advisory & Redressal Procedures:</span>
            </span>
            <p className="finding-content-text" style={{ whiteSpace: "pre-line", lineHeight: 1.65 }}>
              {routingResult.response?.statutory_advice || routingResult.response?.grounded_response || routingResult.response?.answer || "Grievance received and verified against Chandigarh Municipal policies."}
            </p>
          </div>

          {filingError && (
            <div style={{ background: "var(--critical-subtle)", border: "1px solid var(--critical-border)", color: "var(--critical)", padding: "0.85rem 1.15rem", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.86rem" }}>
              ⚠️ {filingError}
            </div>
          )}

          {/* Action to File Grievance */}
          <button
            type="button"
            className="btn-file-ticket"
            onClick={handleFileComplaint}
            disabled={filingLoading}
          >
            <ShieldCheck size={18} />
            <span>{filingLoading ? "Registering in Azure Table Database..." : "File Official Grievance & Issue Docket"}</span>
          </button>
        </section>
      )}

      {/* =====================================================================
          CARD 3: OFFICIAL VERIFIED DIGITAL TICKET (CERTIFICATE)
          ===================================================================== */}
      {filedResult && (
        <section ref={ticketCardRef} className="ticket-credential-card">
          <header className="ticket-header-row">
            <div>
              <span className="section-tag" style={{ color: "var(--emerald-dark)" }}>
                <CheckCircle2 size={14} />
                <span>Phase 3 • Grievance Registered & Filed</span>
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "4px" }}>
                <span className="ticket-docket-badge">{filedResult.tracking_id}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => copyToClipboard(filedResult.tracking_id)}
                  title="Copy Docket ID"
                >
                  {copiedId ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
                  <span>{copiedId ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <span className="badge badge-success">
                ● Status: {filedResult.status || "Filed"}
              </span>
              <span className="badge badge-primary">
                {filedResult._storage || "Azure Table Storage"}
              </span>
            </div>
          </header>

          {/* Ticket Information Grid */}
          <div className="ticket-grid">
            <div className="meta-cell">
              <span className="meta-label">Citizen</span>
              <span className="meta-value">{filedResult.citizen_name || "Citizen"}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">Assigned Department</span>
              <span className="meta-value">{filedResult.department_name || "Municipal Authority"}</span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">Statutory SLA Target</span>
              <span className="meta-value" style={{ color: "var(--amber)" }}>
                {filedResult.sla_target_days ? `${filedResult.sla_target_days} Days` : "Standard SLA"}
              </span>
            </div>
            <div className="meta-cell">
              <span className="meta-label">Target Completion Date</span>
              <span className="meta-value">
                {filedResult.sla_deadline ? new Date(filedResult.sla_deadline).toLocaleDateString() : "Pending"}
              </span>
            </div>
          </div>

          {/* Summary Box */}
          <div style={{ background: "var(--surface-subtle)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--slate-200)", marginBottom: "1.75rem" }}>
            <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "var(--slate-500)", display: "block", marginBottom: "4px" }}>
              Registered Summary:
            </span>
            <p style={{ fontSize: "0.9rem", color: "var(--slate-800)", margin: 0 }}>
              "{filedResult.complaint_text}"
            </p>
          </div>

          {/* Action Bar */}
          <div className="ticket-action-bar">
            {filedResult.report_blob_url && (
              <a
                href={filedResult.report_blob_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <ExternalLink size={14} />
                <span>Azure Blob Audit Dossier</span>
              </a>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateToTracker(filedResult.tracking_id, filedResult)}
            >
              <Search size={15} />
              <span>Track in Real-Time Lifecycle</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

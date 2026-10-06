import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import PipelineStepper from "./components/PipelineStepper";
import GrievanceNavigator from "./components/GrievanceNavigator";
import DocumentIntelligence from "./components/DocumentIntelligence";
import StatusTracker from "./components/StatusTracker";
import DepartmentMatrix from "./components/DepartmentMatrix";
import OfficerDesk from "./components/OfficerDesk";
import AdminLoginModal from "./components/AdminLoginModal";
import PolicyClarifier from "./components/PolicyClarifier";
import { Sparkles, BookOpen, Search, FileText, Building2 } from "lucide-react";
import gsap from "gsap";

const DEFAULT_CHANDIGARH_COMPLAINTS = [
  {
    id: "complaint_1",
    citizen_name: "Virender Sharma",
    language: "en",
    sector: "Sector 22-B",
    raw_text: "I received an inflated water bill of Rs. 4,850 for House No 1240, Sector 22-B via e-Sampark. Last month our bill was only Rs. 650. The smart water meter reading appears to be running erratically."
  },
  {
    id: "complaint_2",
    citizen_name: "Sunita Aggarwal",
    language: "hi",
    sector: "Sector 35-C",
    raw_text: "Sector 35-C ke inner park aur V4 road ki street lights pichhle 5 din se band hain, raat ko pura andhera rehta hai aur chori ka darr hai.",
    translated_text: "The street lights in the inner park and V4 road of Sector 35-C have been off for the last 5 days, it remains pitch dark at night with fear of theft."
  },
  {
    id: "complaint_3",
    citizen_name: "Gurpreet Singh Sandhu",
    language: "pa",
    sector: "Sector 13 (Manimajra)",
    raw_text: "Manimajra sub-division vich pichhle 4 ghante to bijli band hai. 19121 helpline te koi phone nahi chuk reha, kripya local transformer check karvao.",
    translated_text: "Electricity has been out in Manimajra sub-division for the last 4 hours. No one is picking up on the 19121 helpline, please get the local transformer checked."
  },
  {
    id: "complaint_4",
    citizen_name: "Deepak Mehta",
    language: "en",
    sector: "Sector 46-D",
    raw_text: "The MCC door-to-door waste collection tipper vehicle has missed Sector 46-D for two days straight. Household waste is piling up outside houses."
  },
  {
    id: "complaint_5",
    citizen_name: "Pooja Verma",
    language: "en",
    sector: "Sector 19-C",
    raw_text: "A dangerous deep pothole has formed near the Sector 19 market roundabout following recent rains, causing frequent two-wheeler accidents."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("navigator"); // "navigator", "documents", "tracker", "policy_qa", "departments"
  
  // Page View & Admin Portal Auth State
  const [currentView, setCurrentView] = useState("citizen"); // "citizen" | "admin"
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem("janconnect_admin_auth") === "true";
    } catch {
      return false;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Pipeline State
  const [complaints, setComplaints] = useState(DEFAULT_CHANDIGARH_COMPLAINTS);
  const [selectedComplaintId, setSelectedComplaintId] = useState("complaint_1");
  const [routingResult, setRoutingResult] = useState(null);
  const [filedResult, setFiledResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filingLoading, setFilingLoading] = useState(false);
  
  // Document Extraction State
  const [availableDocs, setAvailableDocs] = useState([]);
  const [extractedDocs, setExtractedDocs] = useState({});
  const [docLoading, setDocLoading] = useState(false);

  // Tracking Lookup State
  const [lookupId, setLookupId] = useState("");
  const [trackedStatus, setTrackedStatus] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Dynamic Department Catalog (Fetched directly from Azure Table Storage / local)
  const [departmentsList, setDepartmentsList] = useState([]);

  // Load initial departments, complaints, and documents
  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDepartmentsList(data);
        }
      })
      .catch((err) => console.error("Error loading departments:", err));

    fetch("/api/complaints")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setComplaints(data);
          setSelectedComplaintId(data[0].id);
        }
      })
      .catch((err) => console.error("Error loading complaints:", err));

    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => setAvailableDocs(data))
      .catch((err) => console.error("Error loading documents:", err));
  }, []);

  // Shortcut from receipt to tracker tab
  const handleNavigateToTracker = (id, ticketData) => {
    setLookupId(id);
    setTrackedStatus(ticketData);
    setActiveTab("tracker");
  };

  // Admin Portal Navigation & Auth Handlers
  const handleOpenAdminPortal = () => {
    if (isAdminAuthenticated) {
      setCurrentView("admin");
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowLoginModal(false);
    setCurrentView("admin");
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("janconnect_admin_auth");
    } catch {
      // ignore
    }
    setIsAdminAuthenticated(false);
    setCurrentView("citizen");
  };

  const handleSwitchToCitizen = () => {
    setCurrentView("citizen");
  };

  const handleOfficerComplaintUpdated = (updatedComplaint) => {
    if (trackedStatus && trackedStatus.tracking_id === updatedComplaint.tracking_id) {
      setTrackedStatus(updatedComplaint);
    }
  };

  // Determine current active pipeline step
  const currentStep = filedResult ? 5 : routingResult ? 4 : selectedComplaintId ? 2 : 1;

  return (
    <div className="app-layout">
      {/* Top Navigation Bar with UT Chandigarh Pilot Branding & Admin Portal Access */}
      <Navbar
        currentView={currentView}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminPortal={handleOpenAdminPortal}
        onSwitchToCitizen={handleSwitchToCitizen}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="main-content">
        {currentView === "admin" ? (
          <OfficerDesk
            onBackToCitizen={handleSwitchToCitizen}
            onLogout={handleLogout}
            onComplaintUpdated={handleOfficerComplaintUpdated}
          />
        ) : (
          <>
            {/* Citizen Navigation Tabs with clear iconography and spacing */}
            <nav className="nav-tabs" aria-label="Sections">
              <button
                type="button"
                className={`tab-btn ${activeTab === "navigator" ? "active" : ""}`}
                onClick={() => setActiveTab("navigator")}
              >
                <Sparkles size={16} />
                <span>Grievance Navigator</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "policy_qa" ? "active" : ""}`}
                onClick={() => setActiveTab("policy_qa")}
              >
                <BookOpen size={16} />
                <span>Policy Clarifier</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "tracker" ? "active" : ""}`}
                onClick={() => setActiveTab("tracker")}
              >
                <Search size={16} />
                <span>Live Tracker</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
                onClick={() => setActiveTab("documents")}
              >
                <FileText size={16} />
                <span>Document OCR</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "departments" ? "active" : ""}`}
                onClick={() => setActiveTab("departments")}
              >
                <Building2 size={16} />
                <span>Chandigarh Directory</span>
              </button>
            </nav>

            {/* TAB 1: CHANDIGARH GRIEVANCE NAVIGATOR */}
            {activeTab === "navigator" && (
              <div className="tab-pane">
                <PipelineStepper currentStep={currentStep} />
                <GrievanceNavigator
                  complaints={complaints}
                  selectedComplaintId={selectedComplaintId}
                  setSelectedComplaintId={setSelectedComplaintId}
                  routingResult={routingResult}
                  setRoutingResult={setRoutingResult}
                  filedResult={filedResult}
                  setFiledResult={setFiledResult}
                  loading={loading}
                  setLoading={setLoading}
                  filingLoading={filingLoading}
                  setFilingLoading={setFilingLoading}
                  onNavigateToTracker={handleNavigateToTracker}
                />
              </div>
            )}

            {/* TAB 2: POLICY CLARIFIER & CITIZEN DOUBTS */}
            {activeTab === "policy_qa" && (
              <div className="tab-pane">
                <PolicyClarifier />
              </div>
            )}

            {/* TAB 3: TRACK GRIEVANCE STATUS (STAGE 5) */}
            {activeTab === "tracker" && (
              <div className="tab-pane">
                <StatusTracker
                  lookupId={lookupId}
                  setLookupId={setLookupId}
                  trackedStatus={trackedStatus}
                  setTrackedStatus={setTrackedStatus}
                  trackingLoading={trackingLoading}
                  setTrackingLoading={setTrackingLoading}
                />
              </div>
            )}

            {/* TAB 4: CITIZEN DOCUMENT INTELLIGENCE (STAGE 2) */}
            {activeTab === "documents" && (
              <div className="tab-pane">
                <DocumentIntelligence
                  availableDocs={availableDocs}
                  extractedDocs={extractedDocs}
                  setExtractedDocs={setExtractedDocs}
                  docLoading={docLoading}
                  setDocLoading={setDocLoading}
                />
              </div>
            )}

            {/* TAB 5: CHANDIGARH AUTHORITIES & POLICY MATRIX */}
            {activeTab === "departments" && (
              <div className="tab-pane">
                <DepartmentMatrix departmentsList={departmentsList} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Clean Municipal Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-title">
            <strong>Chandigarh JanConnect (ਚੰਡੀਗੜ੍ਹ ਜਨ ਕਨੈਕਟ / चंडीगढ़ जन कनेक्ट)</strong>
          </p>
          <p className="footer-sub">
            Municipal Corporation Chandigarh (MCC) • Chandigarh Power Distribution Limited (CPDL) • Right to Service Act 2011 Redressal Bridge
          </p>
          <div className="footer-meta">
            <span>Powered by Azure AI Foundry (gpt-5-mini)</span>
            <span>•</span>
            <span>Azure Document Intelligence</span>
            <span>•</span>
            <span>Azure Table Database</span>
          </div>
        </div>
      </footer>

      {/* Admin Login Dialog Modal */}
      {showLoginModal && (
        <AdminLoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}

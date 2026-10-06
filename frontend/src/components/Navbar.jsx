import { useState } from "react";
import { Landmark, ShieldCheck, Activity, PhoneCall, LogIn, LogOut, ArrowLeft, X } from "lucide-react";

export default function Navbar({
  currentView = "citizen",
  isAdminAuthenticated = false,
  onOpenAdminPortal,
  onSwitchToCitizen,
  onLogout,
}) {
  const [showHotlinesModal, setShowHotlinesModal] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="brand-wrapper" onClick={onSwitchToCitizen} style={{ cursor: "pointer" }} title="JanConnect Home">
            <div className="brand-icon-box">
              <Landmark size={22} />
            </div>
            <div className="brand-titles">
              <div className="brand-title-row">
                <h1 className="brand-title">Chandigarh JanConnect</h1>
                <span className="brand-lang-badge">ਚੰਡੀਗੜ੍ਹ ਜਨ ਕਨੈਕਟ • चंडीगढ़ जन कनेक्ट</span>
              </div>
              <div className="brand-sub">
                Civic Grievance AI Resolution Bridge • Municipal Corporation (MCC) & UT Administration
              </div>
            </div>
          </div>

          <div className="nav-badges">
            {currentView === "admin" ? (
              <>
                <div className="atelier-tag tag-pilot">
                  <Activity size={12} className="text-emerald" />
                  <span>Officer Desk Active</span>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onSwitchToCitizen}
                >
                  <ArrowLeft size={14} />
                  <span>Citizen Portal</span>
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onLogout}
                  title="Log out of Admin Portal"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="hotline-trigger-btn"
                  onClick={() => setShowHotlinesModal(true)}
                  title="View 24x7 Chandigarh Emergency Helplines"
                >
                  <PhoneCall size={14} className="text-amber" />
                  <span>24x7 Helplines</span>
                </button>

                <div className="atelier-tag tag-pilot">
                  <Activity size={12} className="text-emerald" />
                  <span>Pilot Active</span>
                </div>
                <div className="atelier-tag tag-azure">
                  <ShieldCheck size={12} className="text-cobalt" />
                  <span>Azure AI</span>
                </div>
                <button
                  type="button"
                  className="btn-admin-portal"
                  onClick={onOpenAdminPortal}
                  title="Access Municipal Officer Resolution Desk (Protected Portal)"
                >
                  <LogIn size={14} />
                  <span>{isAdminAuthenticated ? "Admin Desk (Active)" : "Officer Portal"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Emergency Hotlines Modal */}
      {showHotlinesModal && (
        <div className="modal-overlay" onClick={() => setShowHotlinesModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <PhoneCall size={20} color="#ea580c" />
                <h3 className="modal-title">Chandigarh 24x7 Emergency Helplines</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowHotlinesModal(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div style={{ background: "var(--surface-subtle)", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid var(--slate-200)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--slate-900)" }}>⚡ CPDL Electricity Emergency</div>
                <div style={{ fontSize: "0.8rem", color: "var(--slate-600)", marginTop: "2px" }}>Toll-free power outage helpline</div>
                <a href="tel:19121" style={{ display: "inline-block", marginTop: "4px", fontWeight: 700, color: "var(--cobalt)", textDecoration: "none" }}>📞 19121</a>
              </div>

              <div style={{ background: "var(--surface-subtle)", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid var(--slate-200)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--slate-900)" }}>💧 Water Supply & Sewerage Control Room</div>
                <div style={{ fontSize: "0.8rem", color: "var(--slate-600)", marginTop: "2px" }}>Municipal Corporation Chandigarh (MCC)</div>
                <a href="tel:01722540200" style={{ display: "inline-block", marginTop: "4px", fontWeight: 700, color: "var(--cobalt)", textDecoration: "none" }}>📞 0172-2540200</a>
              </div>

              <div style={{ background: "var(--surface-subtle)", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid var(--slate-200)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--slate-900)" }}>🗑️ MOH Waste Collection & Sanitation Hotline</div>
                <div style={{ fontSize: "0.8rem", color: "var(--slate-600)", marginTop: "2px" }}>WhatsApp Grievance Support</div>
                <a href="https://wa.me/919915762917" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "4px", fontWeight: 700, color: "var(--emerald)", textDecoration: "none" }}>💬 99157-62917 (WhatsApp)</a>
              </div>

              <div style={{ background: "var(--surface-subtle)", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid var(--slate-200)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "var(--slate-900)" }}>🏛️ Integrated Command and Control Centre (ICCC)</div>
                <div style={{ fontSize: "0.8rem", color: "var(--slate-600)", marginTop: "2px" }}>Centralized Smart City Control Desk</div>
                <a href="tel:01722787200" style={{ display: "inline-block", marginTop: "4px", fontWeight: 700, color: "var(--cobalt)", textDecoration: "none" }}>📞 0172-2787200</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from "react";
import { Landmark, ShieldCheck, Activity, PhoneCall, LogIn, LogOut, ArrowLeft, X } from "lucide-react";

const NAVBAR_TEXT = {
  en: {
    tagline: "Civic Resolution",
    track: "Track Complaint",
    helplines: "Helplines",
    officer: "Officer",
    officerDesk: "Officer Desk",
  },
  hi: {
    tagline: "नागरिक समाधान",
    track: "शिकायत ट्रैक करें",
    helplines: "हेल्पलाइन",
    officer: "अधिकारी",
    officerDesk: "अधिकारी डेस्क",
  },
  pa: {
    tagline: "ਨਾਗਰਿਕ ਹੱਲ",
    track: "ਸ਼ਿਕਾਇਤ ਟਰੈਕ ਕਰੋ",
    helplines: "ਹੈਲਪਲਾਈਨ",
    officer: "ਅਧਿਕਾਰੀ",
    officerDesk: "ਅਧਿਕਾਰੀ ਡੈਸਕ",
  },
};

export default function Navbar({
  currentView = "citizen",
  isAdminAuthenticated = false,
  onOpenAdminPortal,
  onSwitchToCitizen,
  onLogout,
  language = "en",
  onLanguageChange,
  onOpenTracker,
}) {
  const [showHotlinesModal, setShowHotlinesModal] = useState(false);
  const t = NAVBAR_TEXT[language] || NAVBAR_TEXT.en;

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          {/* JanConnect Logo & Name */}
          <div className="brand-wrapper" onClick={onSwitchToCitizen} style={{ cursor: "pointer" }} title="JanConnect Home">
            <div className="brand-icon-box">
              <Landmark size={20} />
            </div>
            <div className="brand-titles">
              <div className="brand-title-row">
                <h1 className="brand-title">JanConnect</h1>
                <span className="brand-tagline">{t.tagline}</span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
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
                {/* Language Selector */}
                <div className="lang-selector-wrapper">
                  <select
                    className="lang-select"
                    value={language}
                    onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                    aria-label="Select Language"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                  </select>
                </div>

                {/* Track Complaint Header Button */}
                <button
                  type="button"
                  className="btn-nav-track"
                  onClick={onOpenTracker}
                  title={t.track}
                >
                  <span>{t.track}</span>
                </button>

                {/* Subtle 24x7 Hotline helper */}
                <button
                  type="button"
                  className="hotline-trigger-btn"
                  onClick={() => setShowHotlinesModal(true)}
                  title="24x7 Emergency Helplines"
                >
                  <PhoneCall size={13} className="text-amber" />
                  <span>{t.helplines}</span>
                </button>

                {/* Subtle Officer Desk Access */}
                <button
                  type="button"
                  className="btn-admin-subtle"
                  onClick={onOpenAdminPortal}
                  title="Officer Resolution Portal"
                >
                  <LogIn size={13} />
                  <span>{isAdminAuthenticated ? t.officerDesk : t.officer}</span>
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

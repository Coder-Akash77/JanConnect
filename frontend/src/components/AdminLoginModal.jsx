import { useState } from "react";
import { Landmark, ShieldCheck, AlertCircle, Zap, X, User, KeyRound } from "lucide-react";

export default function AdminLoginModal({ onLoginSuccess, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hardcoded Admin Credentials for municipal review
  const VALID_USER = "admin";
  const VALID_PASS = "admin123";

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username.trim().toLowerCase() === VALID_USER && password === VALID_PASS) {
        sessionStorage.setItem("janconnect_admin_auth", "true");
        onLoginSuccess();
      } else {
        setError("Invalid Officer ID or Password. Restricted to authorized municipal personnel.");
        setLoading(false);
      }
    }, 350);
  };

  const handleFillDemo = () => {
    setUsername(VALID_USER);
    setPassword(VALID_PASS);
    setError("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440 }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ width: 48, height: 48, background: "var(--surface-subtle)", border: "1px solid var(--slate-200)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", color: "var(--slate-900)" }}>
            <Landmark size={24} />
          </div>
          <h3 className="modal-title" style={{ fontSize: "1.25rem", textAlign: "center" }}>
            Municipal Officer Portal
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--slate-500)", marginTop: "4px" }}>
            Restricted gateway for Municipal Corporation Chandigarh (MCC) & CPDL Zonal Engineers.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--critical-subtle)", color: "var(--critical)", border: "1px solid var(--critical-border)", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.82rem" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <User size={13} />
              <span>Officer ID / Username</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <KeyRound size={13} />
              <span>Password</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Quick Demo Credentials Autofill Banner */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-subtle)", border: "1px dashed var(--slate-300)", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--slate-700)" }}>
              <strong style={{ color: "var(--slate-900)" }}>Demo:</strong> <code>admin</code> / <code>admin123</code>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleFillDemo}
              style={{ fontSize: "0.72rem", padding: "3px 8px" }}
            >
              <Zap size={11} color="var(--amber)" />
              <span>Auto-Fill</span>
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !username || !password}
              style={{ minWidth: 140 }}
            >
              {loading ? "Verifying..." : "Log In to Desk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

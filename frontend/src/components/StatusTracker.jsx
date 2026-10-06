import { useState, useEffect } from "react";
import {
  Search,
  Database,
  Clock,
  User,
  MapPin,
  Building,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function StatusTracker({
  lookupId,
  setLookupId,
  trackedStatus,
  setTrackedStatus,
  trackingLoading,
  setTrackingLoading,
}) {
  const [advancing, setAdvancing] = useState(false);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [trackerMode, setTrackerMode] = useState("lookup"); // "lookup" | "cloud_feed"
  const [feedSearch, setFeedSearch] = useState("");
  const [feedDeptFilter, setFeedDeptFilter] = useState("all");

  // Fetch live grievances from Azure Table Storage
  const loadCloudGrievances = async () => {
    setFeedLoading(true);
    try {
      const res = await fetch("/api/grievances");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecentGrievances(data);
      }
    } catch (e) {
      console.error("Error loading cloud grievances:", e);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    loadCloudGrievances();
  }, []);

  // Lookup Status by specific ID
  const handleLookupStatus = async (idToLookup) => {
    const target = typeof idToLookup === "string" ? idToLookup : lookupId;
    const cleanId = (target || "").trim().toUpperCase();
    if (!cleanId) return;
    setLookupId(cleanId);
    setTrackingLoading(true);
    try {
      const res = await fetch(`/api/status/${encodeURIComponent(cleanId)}`);
      const data = await res.json();
      setTrackedStatus(data);
      setTrackerMode("lookup");
    } catch (e) {
      console.error("Error looking up status:", e);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    handleLookupStatus();
  };

  // Status Progression
  const handleAdvanceStatus = async () => {
    if (!trackedStatus || !trackedStatus.tracking_id) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/status/${trackedStatus.tracking_id}/advance`, {
        method: "POST",
      });
      const data = await res.json();
      setTrackedStatus(data);
      loadCloudGrievances(); // Refresh list after status change
    } catch (e) {
      console.error("Error advancing status:", e);
    } finally {
      setAdvancing(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Resolved") return <span className="status-badge status-resolved">✓ Resolved</span>;
    if (status === "Assigned to Field Engineer" || status === "Assigned to Field Officer") {
      return <span className="status-badge status-assigned">● Assigned</span>;
    }
    if (status === "In Progress" || status === "Investigation In Progress") {
      return <span className="status-badge status-progress">● In Progress</span>;
    }
    return <span className="status-badge status-filed">● Logged / Filed</span>;
  };

  // Filter cloud feed
  const filteredFeed = recentGrievances.filter((g) => {
    const q = feedSearch.toLowerCase();
    const matchesSearch =
      !q ||
      (g.tracking_id && g.tracking_id.toLowerCase().includes(q)) ||
      (g.citizen_name && g.citizen_name.toLowerCase().includes(q)) ||
      (g.complaint_text && g.complaint_text.toLowerCase().includes(q));
    const matchesDept =
      feedDeptFilter === "all" ||
      g.department_id === feedDeptFilter ||
      (g.department_name && g.department_name.toLowerCase().includes(feedDeptFilter));
    return matchesSearch && matchesDept;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Search size={22} color="var(--terracotta)" />
            <span>Grievance Lifecycle Status & Cloud Registry</span>
          </h2>
          <p className="card-subtitle">
            Verify real-time case progression, assigned field officers, and statutory Right to Service (RTS) resolution targets.
          </p>
        </div>
        <span className="badge badge-success">Azure Table Database</span>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem" }}>
        <button
          type="button"
          className={`btn btn-sm ${trackerMode === "lookup" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTrackerMode("lookup")}
        >
          <Search size={14} />
          <span>Track Docket ID</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${trackerMode === "cloud_feed" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => {
            setTrackerMode("cloud_feed");
            if (recentGrievances.length === 0) loadCloudGrievances();
          }}
        >
          <Database size={14} />
          <span>Azure Cloud Database ({recentGrievances.length} Tickets)</span>
        </button>
      </div>

      {/* VIEW A: DOCKET LOOKUP */}
      {trackerMode === "lookup" && (
        <div>
          <form onSubmit={handleFormSubmit} style={{ display: "flex", gap: "0.75rem", maxWidth: 680 }}>
            <input
              type="text"
              placeholder="Enter Tracking Docket ID (e.g. GRV-EB5BF9B4 or GRV-CHD-WTR-22B)..."
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="form-input"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={trackingLoading || !lookupId.trim()}
              style={{ minWidth: 140 }}
            >
              {trackingLoading ? "Searching..." : "Inspect Docket"}
            </button>
          </form>

          {/* Quick Lookup Chips */}
          <div className="quick-scenarios-panel">
            <span className="quick-scenarios-title">Quick Test Dockets:</span>
            <div className="quick-chips-row">
              {[
                { id: "GRV-CHD-WTR-22B", label: "GRV-CHD-WTR-22B (Sec 22 Water)" },
                { id: "GRV-CHD-PWR-35C", label: "GRV-CHD-PWR-35C (Sec 35 Power)" },
                { id: "GRV-CHD-PWR-13M", label: "GRV-CHD-PWR-13M (Manimajra)" },
                { id: "GRV-CHD-SAN-46D", label: "GRV-CHD-SAN-46D (Sec 46 Waste)" },
                { id: "GRV-CHD-RDS-19C", label: "GRV-CHD-RDS-19C (Sec 19 Pothole)" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => handleLookupStatus(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rendered Docket Result Card */}
          {trackedStatus && (
            <div style={{ marginTop: "2rem", border: "1px solid var(--slate-200)", borderRadius: "12px", padding: "1.75rem", background: "#ffffff", boxShadow: "var(--shadow-card)" }}>
              {trackedStatus.error ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--critical-subtle)", color: "var(--critical)", border: "1px solid var(--critical-border)", padding: "1rem", borderRadius: "8px" }}>
                  <AlertCircle size={18} />
                  <span><strong>Docket Not Found:</strong> {trackedStatus.error}. Please verify the tracking number.</span>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.25rem", borderBottom: "1px solid var(--slate-100)", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--slate-500)", textTransform: "uppercase", fontWeight: 700 }}>
                        Official Municipal Docket
                      </span>
                      <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 800, color: "var(--slate-900)" }}>
                        {trackedStatus.tracking_id}
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                      <span className="badge badge-primary">{trackedStatus._storage || "Azure Table Storage"}</span>
                      {getStatusBadge(trackedStatus.status)}
                    </div>
                  </div>

                  {/* 4-Stage Visual Lifecycle Stepper */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "2rem 0", position: "relative" }}>
                    {[
                      { num: 1, label: "Logged" },
                      { num: 2, label: "Assigned" },
                      { num: 3, label: "Field Action" },
                      { num: 4, label: "Resolved" },
                    ].map((step, idx) => {
                      const isComplete =
                        (step.num === 1 && trackedStatus.status) ||
                        (step.num === 2 && ["Assigned to Field Engineer", "Assigned to Field Officer", "In Progress", "Investigation In Progress", "Resolved"].includes(trackedStatus.status)) ||
                        (step.num === 3 && ["In Progress", "Investigation In Progress", "Resolved"].includes(trackedStatus.status)) ||
                        (step.num === 4 && trackedStatus.status === "Resolved");

                      return (
                        <div key={step.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: isComplete ? "var(--emerald)" : "var(--slate-100)",
                            border: `2px solid ${isComplete ? "var(--emerald)" : "var(--slate-300)"}`,
                            color: isComplete ? "#ffffff" : "var(--slate-500)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                          }}>
                            {isComplete ? <Check size={14} strokeWidth={3} /> : step.num}
                          </div>
                          <span style={{ fontSize: "0.74rem", fontWeight: 600, color: isComplete ? "var(--emerald-dark)" : "var(--slate-500)", marginTop: "6px" }}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Docket Data Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", background: "var(--surface-subtle)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--slate-200)", marginBottom: "1.25rem" }}>
                    <div>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "var(--slate-500)", display: "block" }}>Citizen</span>
                      <strong style={{ fontSize: "0.92rem", color: "var(--slate-900)" }}>{trackedStatus.citizen_name || "Citizen"}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "var(--slate-500)", display: "block" }}>Assigned Authority</span>
                      <strong style={{ fontSize: "0.92rem", color: "var(--slate-900)" }}>{trackedStatus.department_name}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "var(--slate-500)", display: "block" }}>Target Resolution SLA</span>
                      <strong style={{ fontSize: "0.92rem", color: "var(--amber)" }}>
                        {trackedStatus.sla_target_days ? `${trackedStatus.sla_target_days} Days` : "Standard SLA"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "var(--slate-500)", display: "block" }}>Completion Deadline</span>
                      <strong style={{ fontSize: "0.92rem", color: "var(--slate-900)" }}>
                        {trackedStatus.sla_deadline ? new Date(trackedStatus.sla_deadline).toLocaleDateString() : "Pending"}
                      </strong>
                    </div>
                  </div>

                  {/* Complaint Description */}
                  <div style={{ background: "var(--surface-subtle)", padding: "1rem 1.25rem", borderRadius: "8px", border: "1px solid var(--slate-200)", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "var(--slate-500)", display: "block", marginBottom: "3px" }}>
                      Registered Grievance Summary:
                    </span>
                    <p style={{ fontSize: "0.88rem", color: "var(--slate-800)", margin: 0 }}>"{trackedStatus.complaint_text}"</p>
                  </div>

                  {/* Officer Notes if available */}
                  {trackedStatus.officer_remarks && (
                    <div style={{ background: "var(--cobalt-subtle)", borderLeft: "4px solid var(--cobalt)", padding: "1rem 1.25rem", borderRadius: "0 8px 8px 0", marginBottom: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--cobalt)", display: "block", marginBottom: "3px" }}>
                        🛡️ Officer Resolution Notes:
                      </span>
                      <p style={{ fontSize: "0.86rem", color: "var(--slate-800)", margin: 0 }}>{trackedStatus.officer_remarks}</p>
                    </div>
                  )}

                  {/* Cloud Blob Dossier */}
                  {trackedStatus.report_blob_url && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--emerald-subtle)", border: "1px solid var(--emerald-border)", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--emerald-dark)" }}>
                        ☁️ Immutable Audit Dossier stored in Azure Blob Storage
                      </span>
                      <a
                        href={trackedStatus.report_blob_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink size={13} />
                        <span>Open JSON Dossier</span>
                      </a>
                    </div>
                  )}

                  {/* Simulation Action */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--slate-100)", flexWrap: "wrap", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
                      Interactive Lifecycle Demo: Simulate field engineer progression in Azure Table Storage
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleAdvanceStatus}
                      disabled={advancing || trackedStatus.status === "Resolved"}
                    >
                      {advancing ? "Updating..." : trackedStatus.status === "Resolved" ? "✓ Ticket Fully Resolved" : "Advance Status ➔"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW B: AZURE CLOUD DATABASE FEED */}
      {trackerMode === "cloud_feed" && (
        <div>
          {/* Controls Bar */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search by ID, Citizen Name, or Content..."
              value={feedSearch}
              onChange={(e) => setFeedSearch(e.target.value)}
              className="form-input"
              style={{ flex: 1, minWidth: 240 }}
            />

            <select
              value={feedDeptFilter}
              onChange={(e) => setFeedDeptFilter(e.target.value)}
              className="form-input"
              style={{ width: "auto", minWidth: 180 }}
            >
              <option value="all">All Departments</option>
              <option value="water">Water Supply</option>
              <option value="electricity">CPDL Electricity</option>
              <option value="sanitation">MOH Sanitation</option>
              <option value="roads">B&R Roads</option>
            </select>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={loadCloudGrievances}
              disabled={feedLoading}
            >
              <RefreshCw size={14} className={feedLoading ? "animate-spin" : ""} />
              <span>{feedLoading ? "Refreshing..." : "Refresh Feed"}</span>
            </button>
          </div>

          {/* Table */}
          {filteredFeed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--slate-500)", background: "var(--surface-subtle)", borderRadius: "8px" }}>
              {feedLoading ? "Connecting to Azure Table Storage..." : "No grievances match your filter criteria."}
            </div>
          ) : (
            <div style={{ overflowX: "auto", border: "1px solid var(--slate-200)", borderRadius: "8px", background: "#ffffff" }}>
              <table className="civic-data-table">
                <thead>
                  <tr>
                    <th>Docket ID</th>
                    <th>Citizen & Sector</th>
                    <th>Department</th>
                    <th>Filed On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeed.map((g) => (
                    <tr key={g.tracking_id}>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--slate-900)" }}>
                          {g.tracking_id}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--slate-900)" }}>{g.citizen_name || "Citizen"}</div>
                        {g.detected_sector && <div style={{ fontSize: "0.74rem", color: "var(--terracotta)" }}>📍 {g.detected_sector}</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "var(--slate-700)" }}>{g.department_name}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem", color: "var(--slate-500)", fontFamily: "var(--font-mono)" }}>
                          {g.filed_at ? new Date(g.filed_at).toLocaleDateString() : "Active"}
                        </span>
                      </td>
                      <td>{getStatusBadge(g.status)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleLookupStatus(g.tracking_id)}
                        >
                          <span>Inspect</span>
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

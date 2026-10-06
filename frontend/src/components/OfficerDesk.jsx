import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Activity,
  Clock,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Search,
  Edit3,
  Filter,
  X,
  FileText,
  User,
  HardHat,
  AlertCircle,
} from "lucide-react";

export default function OfficerDesk({ onBackToCitizen, onLogout, onComplaintUpdated }) {
  const [adminComplaints, setAdminComplaints] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminDeptFilter, setAdminDeptFilter] = useState("all");
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");

  // Status Edit Modal State
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState("Assigned to Field Engineer");
  const [officerNameValue, setOfficerNameValue] = useState("Er. V. Sharma (Junior Engineer)");
  const [officerRemarksValue, setOfficerRemarksValue] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Load all complaints and KPI metrics from backend
  const loadAdminComplaints = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch("/api/admin/complaints");
      const data = await res.json();
      setAdminComplaints(data.complaints || []);
      setAdminMetrics(data.metrics || null);
    } catch (e) {
      console.error("Error loading admin complaints:", e);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    loadAdminComplaints();
  }, []);

  // Update Status handler
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;
    setStatusUpdating(true);
    try {
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tracking_id: editingComplaint.tracking_id,
          status: newStatusValue,
          new_status: newStatusValue,
          officer_name: officerNameValue,
          remarks: officerRemarksValue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadAdminComplaints();
        if (onComplaintUpdated && data.complaint) {
          onComplaintUpdated(data.complaint);
        }
        setEditingComplaint(null);
      } else {
        alert("Failed to update status: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Filter complaints based on search query, department, and status
  const filteredComplaints = adminComplaints.filter((c) => {
    const matchesDept = adminDeptFilter === "all" || c.department_id === adminDeptFilter;
    const matchesStatus = adminStatusFilter === "all" || c.status === adminStatusFilter;
    const q = adminSearchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.tracking_id.toLowerCase().includes(q) ||
      (c.citizen_name && c.citizen_name.toLowerCase().includes(q)) ||
      (c.complaint_text && c.complaint_text.toLowerCase().includes(q));
    return matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <div className="card">
      {/* Top Banner with Navigation & Authenticated Status */}
      <div className="card-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h2 className="card-title" style={{ margin: 0 }}>
              <ShieldCheck size={24} color="var(--terracotta)" />
              <span>Municipal Officer Resolution Desk</span>
            </h2>
            <span className="badge badge-success">
              ● Officer Active
            </span>
          </div>
          <p className="card-subtitle">
            Official municipal administration portal for Chandigarh zonal officers, SDOs, and junior engineers.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={onBackToCitizen}>
            <ArrowLeft size={14} />
            <span>Citizen Portal</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={loadAdminComplaints} disabled={adminLoading}>
            <RefreshCw size={14} className={adminLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onLogout} title="Log out of Admin Portal">
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Metric Cards */}
      {adminMetrics && (
        <div className="admin-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">
              <FileText size={22} color="var(--cobalt)" />
            </div>
            <div>
              <div className="kpi-value">{adminMetrics.total}</div>
              <div className="kpi-label">Total Grievances</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <Clock size={22} color="var(--amber)" />
            </div>
            <div>
              <div className="kpi-value">{adminMetrics.pending_verification}</div>
              <div className="kpi-label">Pending Verification</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <HardHat size={22} color="var(--terracotta)" />
            </div>
            <div>
              <div className="kpi-value">{adminMetrics.in_progress}</div>
              <div className="kpi-label">Field Assigned</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <CheckCircle2 size={22} color="var(--emerald)" />
            </div>
            <div>
              <div className="kpi-value">{adminMetrics.resolved}</div>
              <div className="kpi-label">Resolved & Closed</div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by Tracking ID, Citizen Name, or Content..."
          value={adminSearchQuery}
          onChange={(e) => setAdminSearchQuery(e.target.value)}
          className="form-input"
          style={{ flex: 1, minWidth: 240 }}
        />
        <select
          value={adminDeptFilter}
          onChange={(e) => setAdminDeptFilter(e.target.value)}
          className="form-input"
          style={{ width: "auto", minWidth: 180 }}
        >
          <option value="all">All Departments</option>
          <option value="water">Water Supply (MCC)</option>
          <option value="electricity">Electricity (CPDL)</option>
          <option value="sanitation">Sanitation (MOH)</option>
          <option value="roads">Roads & B&R (MCC)</option>
          <option value="rti">RTI Cell</option>
        </select>

        <select
          value={adminStatusFilter}
          onChange={(e) => setAdminStatusFilter(e.target.value)}
          className="form-input"
          style={{ width: "auto", minWidth: 160 }}
        >
          <option value="all">All Statuses</option>
          <option value="Filed">Filed</option>
          <option value="Under Verification">Under Verification</option>
          <option value="Assigned to Field Engineer">Assigned to Field Engineer</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Complaints Table */}
      <div style={{ overflowX: "auto", border: "1px solid var(--slate-200)", borderRadius: "8px", background: "#ffffff" }}>
        <table className="civic-data-table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Citizen</th>
              <th>Department</th>
              <th>Grievance Summary</th>
              <th>Assigned Officer</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2.5rem", color: "var(--slate-500)" }}>
                  {adminLoading ? "Loading grievances from cloud database..." : "No grievances found matching the selected filters."}
                </td>
              </tr>
            ) : (
              filteredComplaints.map((c) => (
                <tr key={c.tracking_id}>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--slate-900)" }}>
                      {c.tracking_id}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "var(--slate-900)" }}>{c.citizen_name || "Citizen"}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", color: "var(--slate-700)" }}>{c.department_name}</span>
                  </td>
                  <td style={{ maxWidth: 280, fontSize: "0.85rem", color: "var(--slate-600)" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.complaint_text}>
                      {c.complaint_text}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.82rem", color: "var(--slate-800)", fontWeight: 500 }}>
                      {c.assigned_officer || "Unassigned"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        fontSize: "0.72rem",
                        padding: "3px 8px",
                        background:
                          c.status === "Resolved"
                            ? "var(--emerald-subtle)"
                            : c.status === "Assigned to Field Engineer"
                            ? "var(--cobalt-subtle)"
                            : "var(--slate-100)",
                        color:
                          c.status === "Resolved"
                            ? "var(--emerald-dark)"
                            : c.status === "Assigned to Field Engineer"
                            ? "var(--cobalt)"
                            : "var(--slate-700)",
                        border:
                          c.status === "Resolved"
                            ? "1px solid var(--emerald-border)"
                            : c.status === "Assigned to Field Engineer"
                            ? "1px solid var(--cobalt-border)"
                            : "1px solid var(--slate-200)",
                      }}
                    >
                      {c.status || "Filed"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEditingComplaint(c);
                        setNewStatusValue(c.status || "Assigned to Field Engineer");
                        setOfficerNameValue(c.assigned_officer || "Er. V. Sharma (Junior Engineer)");
                        setOfficerRemarksValue(c.officer_remarks || "");
                      }}
                    >
                      <Edit3 size={13} />
                      <span>Update</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Status Modal */}
      {editingComplaint && (
        <div className="modal-overlay" onClick={() => setEditingComplaint(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Update Grievance Status</h3>
                <span style={{ fontSize: "0.8rem", color: "var(--slate-500)", fontFamily: "var(--font-mono)" }}>
                  {editingComplaint.tracking_id} • {editingComplaint.citizen_name}
                </span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setEditingComplaint(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Workflow Status</label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="Filed">Filed</option>
                  <option value="Under Verification">Under Verification</option>
                  <option value="Assigned to Field Engineer">Assigned to Field Engineer</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Assigned Officer / Engineer</label>
                <input
                  type="text"
                  value={officerNameValue}
                  onChange={(e) => setOfficerNameValue(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Er. S. K. Verma (Assistant Engineer)"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Official Resolution Remarks</label>
                <textarea
                  value={officerRemarksValue}
                  onChange={(e) => setOfficerRemarksValue(e.target.value)}
                  className="form-textarea"
                  placeholder="Detail site visit, actions taken, pipeline/transformer repair notes..."
                  style={{ minHeight: "85px" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingComplaint(null)}
                  disabled={statusUpdating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={statusUpdating}>
                  {statusUpdating ? "Saving to Azure..." : "Confirm & Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

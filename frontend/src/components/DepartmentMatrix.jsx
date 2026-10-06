import {
  Droplets,
  Zap,
  Trash2,
  Construction,
  FileText,
  Building2,
  Phone,
  Clock,
  BookOpen,
} from "lucide-react";

const DEFAULT_CHANDIGARH_DEPARTMENTS = [
  {
    id: "water",
    name: "MCC Water Supply & Sewerage Operations (Public Health Wing)",
    authority: "Municipal Corporation Chandigarh (MCC)",
    office: "MCC Head Office, New Deluxe Building, Sector 17, Chandigarh",
    helpline: "0172-2540200 / 0172-2787200",
    sla: "15 working days (RTS Rule 4)",
    icon: Droplets,
    color: "var(--cobalt)",
    badgeClass: "badge-water",
    keywords: ["water", "meter", "bill", "pipeline", "leak", "sewerage", "tap", "pani", "paani", "low pressure", "e-sampark", "contamination"],
    policies: [
      "Disputed water bills received via e-Sampark may be submitted for re-metering within 30 days. Resolved within 15 working days.",
      "Major pipeline leakages or contamination in sector lines must be inspected within 4 hours and repaired within 24 to 48 hours.",
      "Sewerage blockages and overflowing manholes are cleared via super-suction machines within 24 hours of filing.",
      "Official 24x7 Water Supply Control Room: 0172-2540200 | MCC ICCC: 0172-2787200."
    ]
  },
  {
    id: "electricity",
    name: "Chandigarh Power Distribution Limited (CPDL)",
    authority: "Electricity Department, UT Chandigarh",
    office: "Electricity Operation Circle, UT Secretariat, Sector 18, Chandigarh",
    helpline: "19121 (24x7 Outage Call Centre)",
    sla: "4 hours for outages / 7 days for meter inspection",
    icon: Zap,
    color: "var(--amber)",
    badgeClass: "badge-electricity",
    keywords: ["electricity", "power", "outage", "bijli", "transformer", "feeder", "voltage", "power cut", "burnt meter", "cpdl", "19121"],
    policies: [
      "Power outages exceeding 4 hours in urban sectors must be restored within 4 hours. Unresolved outages escalate to SDO after 2h and XEN after 4h.",
      "Distribution transformer breakdowns or 11kV feeder faults must be restored within 24 to 72 hours.",
      "Defective or burnt electricity meters are inspected within 7 working days and replaced within 15 working days.",
      "24x7 Central Power Call Centre: 19121 | Consumer Grievance Redressal Forum (CGRF), Sector 18."
    ]
  },
  {
    id: "sanitation",
    name: "MCC Medical Officer of Health (MOH) — Sanitation & Waste",
    authority: "Municipal Corporation Chandigarh (MCC)",
    office: "MOH Wing, Municipal Corporation, Sector 17, Chandigarh",
    helpline: "WhatsApp: 9915762917 / ICCC: 0172-2787200",
    sla: "24 hours for missed tipper / 12-24h for open dumps",
    icon: Trash2,
    color: "var(--emerald)",
    badgeClass: "badge-sanitation",
    keywords: ["sanitation", "garbage", "waste", "kooda", "kachra", "safai", "dustbin", "dumper", "tipper", "door to door", "ssk", "dadumajra"],
    policies: [
      "Missed door-to-door segregated garbage collection vehicle must be redressed within 24 hours of citizen reporting.",
      "Accumulated garbage dumps, overflowing SSKs, or dead animal removal must be cleared within 12 to 24 hours.",
      "Waste processing complaints and storm-water drain choking must be addressed within 48 hours.",
      "Dedicated MCC WhatsApp Grievance Hotline: 9915762917 | Central Control Room: 0172-2787200."
    ]
  },
  {
    id: "roads",
    name: "MCC Roads, Streetlights & Infrastructure (B&R Division)",
    authority: "Municipal Corporation Chandigarh (MCC)",
    office: "B&R Division, Municipal Corporation, Sector 17, Chandigarh",
    helpline: "0172-2787200 / e-Sampark: 1800-180-1725",
    sla: "3-7 working days for streetlights / 7 days for potholes",
    icon: Construction,
    color: "var(--terracotta)",
    badgeClass: "badge-roads",
    keywords: ["road", "roads", "streetlight", "street light", "pothole", "potholes", "sadak", "gaddha", "khamba", "dark spot", "footpath", "caving"],
    policies: [
      "Non-functional LED streetlights on sector roads (V3/V4/V5/V6) or dark spots must be repaired within 3 to 7 working days under EESL contract.",
      "Dangerous potholes, road cave-ins, or damaged footpaths on sector roads must be repaired with bitumen patchwork within 7 working days.",
      "Overgrown tree branches obstructing streetlights or road signboards must be pruned within 5 working days.",
      "MCC ICCC Toll-Free: 0172-2787200 | e-Sampark: 1800-180-1725."
    ]
  },
  {
    id: "rti",
    name: "Right to Information (RTI) Cell",
    authority: "UT Administration Chandigarh",
    office: "UT Secretariat, Sector 9, Chandigarh",
    helpline: "e-Sampark: 1800-180-1725",
    sla: "30 days (48h for life & liberty)",
    icon: FileText,
    color: "var(--slate-700)",
    badgeClass: "badge-primary",
    keywords: ["rti", "right to information", "application", "public information", "records", "appeal"],
    policies: [
      "An RTI application can be filed online or via any e-Sampark center in Chandigarh with the statutory ₹10 application fee.",
      "The Public Information Officer (PIO) must furnish information within 30 days of application receipt.",
      "If information concerns life or liberty of a person, it must be provided within 48 hours."
    ]
  }
];

export default function DepartmentMatrix({ departmentsList = [] }) {
  const displayDepts = departmentsList && departmentsList.length > 0 ? departmentsList : DEFAULT_CHANDIGARH_DEPARTMENTS;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Building2 size={22} color="var(--terracotta)" />
            <span>Chandigarh Municipal Authorities & Routing Matrix</span>
          </h2>
          <p className="card-subtitle">
            Explore departmental policy grounding rules, monitored keywords for automatic sector routing, official head offices, and Right to Service (RTS) statutory deadlines.
          </p>
        </div>
        <span className="badge badge-primary">5 UT Civic Departments</span>
      </div>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {displayDepts.map((dept) => {
          const Icon = typeof dept.icon === "function" ? dept.icon : Building2;
          return (
            <div key={dept.id} className="dept-matrix-card">
              <div className="dept-matrix-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div className="dept-icon-box">
                    <Icon size={22} color={dept.color || "var(--slate-800)"} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "1.05rem", color: "var(--slate-900)" }}>{dept.name}</strong>
                    <div style={{ fontSize: "0.78rem", color: "var(--slate-500)", marginTop: "2px" }}>
                      Authority: <strong>{dept.authority}</strong> • Office: {dept.office}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span className="badge" style={{ background: "var(--surface-subtle)", color: "var(--slate-700)", border: "1px solid var(--slate-200)" }}>
                    <Phone size={12} />
                    <span>{dept.helpline}</span>
                  </span>
                  <span className={`badge ${dept.badgeClass || "badge-primary"}`}>
                    <Clock size={12} />
                    <span>SLA: {dept.sla}</span>
                  </span>
                </div>
              </div>

              <div className="dept-kw-section">
                <span className="dept-kw-title">
                  Monitored Grievance Keywords (English, Hindi, Punjabi):
                </span>
                <div className="dept-kw-list">
                  {dept.keywords.map((kw) => (
                    <span key={kw} className="dept-kw-badge">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="dept-policy-section">
                <span className="dept-policy-title">
                  Grounding Policy Rules (Indexed in Azure AI Search & RTS Act):
                </span>
                <ul className="dept-policy-list">
                  {dept.policies.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

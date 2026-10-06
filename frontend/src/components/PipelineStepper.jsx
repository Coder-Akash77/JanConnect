import { Check } from "lucide-react";

export default function PipelineStepper({ currentStep = 1 }) {
  const steps = [
    { num: 1, title: "Intake", desc: "Citizen Voice/Text" },
    { num: 2, title: "Normalize", desc: "Azure Translation" },
    { num: 3, title: "Routing", desc: "Department Classifier" },
    { num: 4, title: "Advisory", desc: "Azure AI Foundry" },
    { num: 5, title: "Filing", desc: "RTS Ticket & SLA" },
  ];

  const progressPercent = Math.min(100, Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100));

  return (
    <div className="pipeline-stepper">
      <div className="stepper-header">
        <span>Grievance Resolution Lifecycle</span>
        <span style={{ color: currentStep === 5 ? "var(--emerald-dark)" : "var(--slate-700)" }}>
          {currentStep === 5 ? "Ticket Filed & Tracked" : `Phase ${currentStep} of 5`}
        </span>
      </div>

      <div className="stepper-flow">
        <div className="stepper-track-line">
          <div
            className="stepper-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {steps.map((s) => {
          const isCompleted = currentStep > s.num || (currentStep === 5 && s.num === 5);
          const isActive = currentStep === s.num && currentStep !== 5;
          return (
            <div
              key={s.num}
              className={`stepper-step-item ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
            >
              <div className="step-circle">
                {isCompleted ? <Check size={14} strokeWidth={3} /> : s.num}
              </div>
              <span className="step-label">{s.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

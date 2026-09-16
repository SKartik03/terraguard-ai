import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Loader2, Database, ShieldAlert, BarChart3 } from 'lucide-react';

export default function ProcessingView({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Geospatial Data Ingestion", desc: "Validating coordinate boundary, elevation profile, and DEM interpolation..." },
    { title: "Input Normalization", desc: "Mapping continuous hydrological variables to unit risk intervals (0.0 – 1.0)..." },
    { title: "Layer 1 Deterministic Calculation", desc: "Applying 6-factor geotechnical weights and accumulation window multiplier..." },
    { title: "Layer 2 Machine Learning Inference", desc: "Executing Random Forest ensemble classification on historical event tree..." },
    { title: "Explainability & Advisory Synthesis", desc: "Ranking dominant hazard drivers and structuring actionable mitigation alerts..." }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 350);
    const timer2 = setTimeout(() => setCurrentStep(2), 700);
    const timer3 = setTimeout(() => setCurrentStep(3), 1100);
    const timer4 = setTimeout(() => setCurrentStep(4), 1500);
    const timer5 = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 680, margin: '40px auto', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '36px 32px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(14, 165, 233, 0.2))', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
          <Cpu size={32} color="var(--emerald-400)" className="animate-spin" />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Computing Landslide Risk Assessment</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 28 }}>
          Executing deterministic geotechnical calculations and empirical Random Forest inference.
        </p>

        {/* Pipeline Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: isCurrent ? 'rgba(16, 185, 129, 0.08)' : (isCompleted ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.4)'),
                  border: `1px solid ${isCurrent ? 'var(--border-active)' : (isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-subtle)')}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isCompleted ? (
                    <CheckCircle2 size={20} color="var(--emerald-400)" />
                  ) : isCurrent ? (
                    <Loader2 size={20} color="var(--sky-400)" className="animate-spin" />
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{idx + 1}</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isCurrent ? 'var(--text-primary)' : (isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)') }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

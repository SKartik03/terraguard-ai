import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Loader2, MapPin, BookOpen, CloudSun, BarChart3, Bot, Compass } from 'lucide-react';

export default function ProcessingView({ onComplete, locationName = "Selected Coordinates" }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: MapPin, title: "Identifying location...", desc: `Resolving coordinates and geographic terrain boundary for ${locationName}...` },
    { icon: BookOpen, title: "Checking historical landslide records...", desc: "Scanning 150+ documented events within 25 km proximity radius..." },
    { icon: CloudSun, title: "Loading current conditions...", desc: "Ingesting live precipitation, 24h forecast, and temperature from Open-Meteo..." },
    { icon: BarChart3, title: "Preparing risk factors...", desc: "Evaluating terrain slope, geological stability, and soil moisture saturation..." },
    { icon: Bot, title: "Calculating assessment...", desc: "Applying dynamic factor normalization (Mode A / Mode B) and safety limits..." },
    { icon: Compass, title: "Preparing result...", desc: "Synthesizing explainable justification and interactive spatial visualization..." }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 320);
    const timer2 = setTimeout(() => setCurrentStep(2), 650);
    const timer3 = setTimeout(() => setCurrentStep(3), 980);
    const timer4 = setTimeout(() => setCurrentStep(4), 1300);
    const timer5 = setTimeout(() => setCurrentStep(5), 1600);
    const timer6 = setTimeout(() => {
      onComplete();
    }, 1950);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [onComplete]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 660, margin: '30px auto', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '34px 28px' }}>
        <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(14, 165, 233, 0.2))', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto' }}>
          <Cpu size={30} color="var(--emerald-400)" className="animate-spin" />
        </div>

        <h2 style={{ fontSize: '1.45rem', marginBottom: 6 }}>Analyzing Location for Landslide Susceptibility</h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
          Target: <strong style={{ color: 'var(--emerald-400)' }}>{locationName}</strong>
        </p>

        {/* 6-Stage Pipeline Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            const Icon = step.icon;

            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: isCurrent ? 'rgba(16, 185, 129, 0.09)' : (isCompleted ? 'rgba(15, 23, 42, 0.75)' : 'rgba(15, 23, 42, 0.35)'),
                  border: `1px solid ${isCurrent ? 'var(--emerald-500)' : (isCompleted ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)')}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isCompleted ? (
                    <CheckCircle2 size={18} color="var(--emerald-400)" />
                  ) : isCurrent ? (
                    <Loader2 size={18} color="var(--sky-400)" className="animate-spin" />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{idx + 1}</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: isCurrent ? 'var(--text-primary)' : (isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)'), display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={14} color={isCurrent ? 'var(--sky-400)' : (isCompleted ? 'var(--emerald-400)' : 'var(--text-muted)')} />
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
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

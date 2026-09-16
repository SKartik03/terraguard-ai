import React from 'react';
import { Rocket, Radio, Satellite, Smartphone, Compass, ShieldAlert, Cpu } from 'lucide-react';

export default function FutureExtensionsView() {
  const roadmap = [
    {
      phase: "Phase 1 (Months 1–3)",
      title: "Spaceborne InSAR Radar Interferometry",
      tag: "Remote Sensing",
      icon: Satellite,
      color: "var(--sky-400)",
      desc: "Integrate ESA Sentinel-1 and NASA-ISRO NISAR synthetic aperture radar to measure millimeter-scale pre-failure hillside creep before visible surface scars develop."
    },
    {
      phase: "Phase 2 (Months 4–6)",
      title: "Real-Time Subsurface IoT Mesh",
      tag: "Hardware Telemetry",
      icon: Radio,
      color: "var(--emerald-400)",
      desc: "Deploy solar-powered wireless LoRaWAN geotechnical nodes equipped with MEMS dual-axis tiltmeters, vibrating wire piezometers, and acoustic emission microphones."
    },
    {
      phase: "Phase 3 (Months 7–9)",
      title: "Common Alerting Protocol (CAP) Integration",
      tag: "Disaster Management",
      icon: ShieldAlert,
      color: "var(--risk-high)",
      desc: "Direct XML/JSON machine-to-machine federation with National Disaster Management Authority (NDMA) and State Emergency Operation Centers for automated sirens."
    },
    {
      phase: "Phase 4 (Months 10–12)",
      title: "Community Mobile Reporting & Offline P2P Mesh",
      tag: "Civic Technology",
      icon: Smartphone,
      color: "var(--indigo-500)",
      desc: "Flutter-based citizen mobile app allowing mountain residents to report new slope fissures and spring muddying, functioning offline via Bluetooth peer-to-peer mesh."
    }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Future Research & Product Roadmap</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Transparent evolution path from historical-data decision support to real-time physical telemetry.
        </p>
      </div>

      <div className="scope-banner" style={{ marginBottom: 26 }}>
        <Rocket className="scope-banner-icon" size={22} color="var(--sky-400)" />
        <div>
          <strong style={{ color: 'var(--sky-400)' }}>Engineering Integrity Note:</strong> The initiatives below represent our post-prototype development horizon. None of these future modules are faked or falsely represented in the working build.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {roadmap.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {item.phase}
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>{item.tag}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={item.color} />
                </div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{item.title}</h3>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

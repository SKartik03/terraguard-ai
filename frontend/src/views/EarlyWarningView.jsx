import React, { useState } from 'react';
import { AlertOctagon, Radio, MessageSquare, Copy, Check, ShieldAlert, Users, Bell, FileText } from 'lucide-react';

export default function EarlyWarningView() {
  const [selectedLocation, setSelectedLocation] = useState("Wayanad Vythiri Ghats");
  const [hazardTier, setHazardTier] = useState("CRITICAL");
  const [copiedSMS, setCopiedSMS] = useState(false);
  const [copiedRadio, setCopiedRadio] = useState(false);

  const smsTemplates = {
    CRITICAL: `[EMERGENCY ADVISORY - TERRAGUARD AI] High landslide probability detected at ${selectedLocation}. Immediate evacuation recommended for downslope residents. Proceed via Ridge Route A to Kalpetta Shelter. Emergency line: 112.`,
    HIGH: `[HAZARD ALERT - TERRAGUARD AI] Elevated slope failure risk at ${selectedLocation} due to heavy rainfall accumulation. Restrict hillside travel. Prepare emergency kits. Local DDMA standby.`,
    MODERATE: `[WEATHER WATCH - TERRAGUARD AI] Moderate landslide sensitivity at ${selectedLocation}. Continuous rain anticipated. Monitor drainage outlets and report tension fissures.`
  };

  const radioTemplates = {
    CRITICAL: `URGENT BROADCAST BULLETIN — DISASTER MANAGEMENT DISPATCH:
"Attention residents of ${selectedLocation}. Soil saturation and torrential precipitation have crossed critical stability thresholds. Geological displacement probability is extremely high. All families situated on steep slopes or within debris flow ravines must commence immediate orderly evacuation. Do NOT use valley roadways. Utilize the upper ridge route to designated shelters. Tune to 104.2 FM for continuous civil updates."`,
    HIGH: `ADVISORY DISPATCH — INCIDENT COMMAND:
"This is an urgent public safety notice for ${selectedLocation}. Rainfall accumulation over the last 24 hours has saturated regional hillslopes. Civil defense units are activated. Commercial hauling along mountain passes is halted. Vulnerable households are advised to relocate elderly and children to community centers."`,
    MODERATE: `MONITORING BULLETIN:
"Regional rain gauges in ${selectedLocation} record sustained moderate runoff. Slope stability models show moderate risk. Forest wardens and village officers are requested to inspect interceptor ditches."`
  };

  const copyText = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'sms') {
      setCopiedSMS(true);
      setTimeout(() => setCopiedSMS(false), 2000);
    } else {
      setCopiedRadio(true);
      setTimeout(() => setCopiedRadio(false), 2000);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Early Warning & Community Advisory Panel</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Multi-channel alert synthesis, threshold escalation matrices, and civil defense communication templates.
        </p>
      </div>

      {/* Scope Disclaimer */}
      <div className="scope-banner" style={{ marginBottom: 24 }}>
        <AlertOctagon className="scope-banner-icon" size={22} color="var(--risk-crit)" />
        <div>
          <strong style={{ color: 'var(--risk-crit)' }}>Non-Claim & Advisory Disclaimer:</strong> Bulletins synthesized here are decision-support drafts intended for civil defense tabletop rehearsals. Live public dissemination requires direct authorization by District Disaster Management Authorities (DDMA) and National Emergency Services.
        </div>
      </div>

      {/* Corridor & Tier Selector */}
      <div className="glass-panel" style={{ padding: '18px 22px', marginBottom: 24, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Target Mountain Corridor:
          </label>
          <select 
            className="form-control form-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="Wayanad Vythiri Ghats">Wayanad Vythiri Ghats (Western Ghats)</option>
            <option value="Joshimath Subsidence Ridge">Joshimath Subsidence Ridge (Uttarakhand)</option>
            <option value="Malin Hills Escarpment">Malin Hills Escarpment (Maharashtra)</option>
            <option value="Nilgiris Coonoor Slopes">Nilgiris Coonoor Slopes (Tamil Nadu)</option>
            <option value="Shimla Upper Ridge">Shimla Upper Ridge (Himachal Pradesh)</option>
            <option value="Darjeeling Lebong Spur">Darjeeling Lebong Spur (West Bengal)</option>
          </select>
        </div>

        <div style={{ width: 220 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Advisory Hazard Tier:
          </label>
          <select 
            className="form-control form-select"
            value={hazardTier}
            onChange={(e) => setHazardTier(e.target.value)}
          >
            <option value="CRITICAL">Tier 4: CRITICAL (Evacuate)</option>
            <option value="HIGH">Tier 3: HIGH (Standby)</option>
            <option value="MODERATE">Tier 2: MODERATE (Advisory)</option>
          </select>
        </div>
      </div>

      {/* Generated Templates Grid */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* SMS Broadcast */}
        <div className="glass-panel" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={18} color="var(--sky-400)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Civil Defense SMS Draft</h3>
            </div>
            <button 
              onClick={() => copyText(smsTemplates[hazardTier], 'sms')} 
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {copiedSMS ? <Check size={14} color="var(--emerald-400)" /> : <Copy size={14} />}
              {copiedSMS ? "Copied" : "Copy SMS"}
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            Concise 160-character mobile broadcast template for regional cell towers:
          </p>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-primary)', flex: 1, whiteSpace: 'pre-wrap' }}>
            {smsTemplates[hazardTier]}
          </div>
        </div>

        {/* Radio Emergency Dispatch */}
        <div className="glass-panel" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={18} color="var(--emerald-400)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Emergency Radio Dispatch</h3>
            </div>
            <button 
              onClick={() => copyText(radioTemplates[hazardTier], 'radio')} 
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {copiedRadio ? <Check size={14} color="var(--emerald-400)" /> : <Copy size={14} />}
              {copiedRadio ? "Copied" : "Copy Bulletin"}
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            Standard operating procedure script for public community radio and loudspeakers:
          </p>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-primary)', flex: 1, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {radioTemplates[hazardTier]}
          </div>
        </div>
      </div>

      {/* Evacuation Escalation Matrix */}
      <div className="glass-panel" style={{ padding: '22px 24px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={18} color="var(--risk-high)" /> Regional Escalation Matrix
        </h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tier Level</th>
                <th>Score Range</th>
                <th>Threshold Condition</th>
                <th>Triggered Protocols</th>
                <th>Community Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge badge-low">Tier 1: Normal</span></td>
                <td>0 – 39</td>
                <td>Cumulative rain &lt; 50mm, stable slopes</td>
                <td>Routine telemetric telemetry checks</td>
                <td>Maintain clear domestic drains</td>
              </tr>
              <tr>
                <td><span className="badge badge-mod">Tier 2: Advisory</span></td>
                <td>40 – 69</td>
                <td>Sustained rain 50-100mm, saturated soil</td>
                <td>Incident command staging, gauge alerts</td>
                <td>Prepare 72h grab bags; avoid stream beds</td>
              </tr>
              <tr>
                <td><span className="badge badge-high">Tier 3: Warning</span></td>
                <td>70 – 84</td>
                <td>Rainfall &gt; 120mm, weak bedrock scarp</td>
                <td>Road closures on unstable cuts, patrol deployed</td>
                <td>Pre-evacuation of elderly; avoid valley corridors</td>
              </tr>
              <tr>
                <td><span className="badge badge-crit">Tier 4: Critical</span></td>
                <td>85 – 100</td>
                <td>Extreme rain, liquefaction saturation</td>
                <td>Full sirens, National Disaster Response activation</td>
                <td>Immediate mandatory evacuation via Ridge Route A</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

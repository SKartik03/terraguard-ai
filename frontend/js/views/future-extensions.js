/**
 * TerraGuard AI - Future Extensions & Offline Grand Finale Roadmap View (Vanilla JS)
 * Technical roadmap planned for the HackDays 2.0 Offline Grand Finale at GCET.
 */
export const FutureExtensionsView = {
  render(container) {
    const milestones = [
      {
        tag: "PLANNED · OFFLINE FINALE ROUND",
        title: "1. Drone Aerial Scarp Inspection via Gemini Vision",
        desc: "Autonomous drone flight path ingestion feeding high-resolution 4K orthophotos directly into Gemini 1.5/2.5 Pro Vision API for automated tension crack identification and scarp headwall displacement detection before ground failure.",
        status: "Target Date: 26 September 2026 (GCET Finale)",
        color: "var(--sky-400)"
      },
      {
        tag: "PLANNED · OFFLINE FINALE ROUND",
        title: "2. Conversational Gemini Voice Commander for Field Responders",
        desc: "Audio-native conversational assistant for National Disaster Response Force (NDRF) teams in low-connectivity areas to ask spoken queries like 'What is the safest evacuation road from Vythiri?' and receive immediate real-time spoken guidance.",
        status: "Prototype Speech Pipeline Architecture Ready",
        color: "var(--emerald-400)"
      },
      {
        tag: "PLANNED · OFFLINE FINALE ROUND",
        title: "3. LoRa Edge Seismograph & Soil Inclinometer Nodes",
        desc: "Sub-dollar solar-powered micro-accelerometer hardware mesh transmitting slope creep millimeter displacements over long-range LoRaWAN telemetry directly into TerraGuard AI's background ingestion loop.",
        status: "Hardware Pinout & Ingestion Endpoints Ready",
        color: "#A78BFA"
      },
      {
        tag: "PLANNED · OFFLINE FINALE ROUND",
        title: "4. Air-Gapped Edge Computing Appliance",
        desc: "Full containerized packaging (Docker / Podman) running on ruggedized field laptops with local quantized LLM inference for areas where cellular towers are washed away during extreme monsoon disasters.",
        status: "Local SQLite & Fallback Engine Verified",
        color: "#F59E0B"
      }
    ];

    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Header -->
        <div class="glass-panel" style="padding: 24px;">
          <h1 style="font-size: 1.8rem; margin: 0 0 6px 0; color: #FFFFFF;">Future Extensions & Grand Finale Roadmap</h1>
          <p style="color: var(--text-secondary); font-size: 0.92rem; margin: 0; line-height: 1.5;">
            Clear, honest progression: Features A & B (Explainability and Multilingual Alert Dispatch) are currently 
            live in production; advanced multimodal drone vision, voice interfaces, and hardware IoT are scheduled for the 
            26 September Offline Round at GCET.
          </p>
        </div>

        <!-- Milestones List -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${milestones.map(m => `
            <div class="glass-panel" style="padding: 22px 26px; border-left: 4px solid ${m.color};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
                <span class="badge" style="background: rgba(15, 23, 42, 0.8); color: ${m.color}; border: 1px solid var(--border-subtle); font-size: 0.72rem;">
                  ${m.tag}
                </span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">
                  ${m.status}
                </span>
              </div>
              <h3 style="margin: 0 0 10px 0; font-size: 1.2rem; color: #FFFFFF;">${m.title}</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin: 0;">
                ${m.desc}
              </p>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  }
};

export default FutureExtensionsView;

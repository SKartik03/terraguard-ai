/**
 * TerraGuard AI - Safe Evacuation Corridor Routing View (Vanilla JS)
 * Computes high-ground escape routes avoiding hazardous landslide colluvium and steep ravines.
 */
import { TerraGuardMap } from '../map.js';

export const SafeRouteView = {
  render(container, state, router) {
    const loc = state.activeLocationTarget || {
      name: "Wayanad Vythiri Ghats",
      lat: 11.5540,
      lon: 76.0422
    };

    // Designated high-ground relief centers
    const shelters = [
      { id: "s1", name: "Vythiri Taluk Relief & Community Shelter", lat: 11.5410, lon: 76.0580, dist: "2.4 km", elev: "+140 m High-Ground", capacity: "450 Persons" },
      { id: "s2", name: "Meppadi Government Higher Secondary School", lat: 11.5510, lon: 76.1280, dist: "8.6 km", elev: "+210 m Plateau", capacity: "800 Persons" },
      { id: "s3", name: "Kalpetta District Multi-Purpose Evacuation Hall", lat: 11.6080, lon: 76.0820, dist: "7.1 km", elev: "+180 m Valley Rim", capacity: "1,200 Persons" }
    ];

    let selectedShelter = shelters[0];

    container.innerHTML = `
      <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
        
        <!-- Header -->
        <div class="glass-panel" style="padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.12); color: var(--emerald-400); font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 9999px; margin-bottom: 6px;">
              <span>🧭</span> Civil Defense Escape Corridor Engine
            </div>
            <h1 style="font-size: 1.8rem; margin: 0 0 4px 0; color: #FFFFFF;">Safe Evacuation Vector & Shelter Routing</h1>
            <span style="font-size: 0.82rem; color: var(--text-muted);">
              Calculates safest descent paths away from identified geotechnical failure scars and flooded talwegs.
            </span>
          </div>
          <button id="route-re-eval-btn" class="btn btn-secondary btn-sm">
            ⚡ Re-Assess Location Risk
          </button>
        </div>

        <!-- Evacuation Map Canvas -->
        <div class="glass-panel" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 style="margin: 0; font-size: 0.95rem; color: #FFFFFF;">
              📍 Active Evacuation Corridor from ${loc.name}
            </h4>
            <span style="color: var(--emerald-400); font-size: 0.75rem; font-weight: 600;">
              Vector Status: Clear of Documented Scars
            </span>
          </div>
          <div id="route-map-container" style="height: 420px; width: 100%; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          </div>
        </div>

        <!-- Shelters & Route Directives -->
        <div class="grid-2">
          
          <!-- Shelter Destination Cards -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 14px;">
            <h3 style="margin: 0; font-size: 1.15rem; color: #FFFFFF;">
              Designated Emergency Relief Centers
            </h3>
            <div id="shelters-list" style="display: flex; flex-direction: column; gap: 10px;">
              ${shelters.map(s => `
                <div class="shelter-card ${s.id === selectedShelter.id ? 'active-shelter' : ''}" data-id="${s.id}" style="
                  padding: 14px 18px;
                  border-radius: var(--radius-md);
                  background: ${s.id === selectedShelter.id ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.6)'};
                  border: 1px solid ${s.id === selectedShelter.id ? 'var(--emerald-500)' : 'var(--border-subtle)'};
                  cursor: pointer;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                ">
                  <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 0.95rem; color: #FFFFFF;">${s.name}</h4>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${s.elev} · Capacity: ${s.capacity}</span>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 1rem; font-weight: 700; color: var(--emerald-400);">${s.dist}</div>
                    <span style="font-size: 0.7rem; color: var(--text-secondary);">Direct Safe Vector</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Step-by-Step Navigation Directives -->
          <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 14px;">
            <h3 style="margin: 0; font-size: 1.15rem; color: #FFFFFF;">
              Step-by-Step Escape Vector Directives
            </h3>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem; line-height: 1.5;">
              <div style="padding: 10px 14px; background: rgba(15, 23, 42, 0.6); border-radius: var(--radius-sm); border-left: 3px solid var(--emerald-500);">
                <strong>Step 1: Immediate Ridge Crest Egress</strong><br>
                <span style="color: var(--text-secondary);">Depart arterial hillside slope cut immediately. Avoid walking beneath saturated cuts or standing water pools.</span>
              </div>
              <div style="padding: 10px 14px; background: rgba(15, 23, 42, 0.6); border-radius: var(--radius-sm); border-left: 3px solid var(--sky-400);">
                <strong>Step 2: Talweg & Stream Valley Bypass</strong><br>
                <span style="color: var(--text-secondary);">Do NOT take seasonal ravine footpaths; heavy mud debris flows travel down drainage gullies first.</span>
              </div>
              <div style="padding: 10px 14px; background: rgba(15, 23, 42, 0.6); border-radius: var(--radius-sm); border-left: 3px solid var(--indigo-500);">
                <strong>Step 3: Proceed to High-Ground Relief Center</strong><br>
                <span style="color: var(--text-secondary);">Check in with District Administration and SDRF personnel stationed at the shelter checkpoint.</span>
              </div>
            </div>

            <!-- Emergency Helplines -->
            <div style="margin-top: 10px; padding: 12px 16px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-sm); font-size: 0.78rem; color: #FBBF24;">
              <strong>Emergency Contacts:</strong> National Disaster Response Force (NDRF): <strong>1078</strong> · Kerala SDMA Control: <strong>1077</strong> · Emergency Services: <strong>112</strong>
            </div>
          </div>

        </div>

      </div>
    `;

    // Initialize Map and Evacuation Route
    let routeMap = null;

    const updateRoute = (shelter) => {
      if (!routeMap) return;
      const start = [loc.lat, loc.lon];
      const waypoints = [
        [loc.lat + (shelter.lat - loc.lat) * 0.35, loc.lon + (shelter.lon - loc.lon) * 0.25],
        [loc.lat + (shelter.lat - loc.lat) * 0.70, loc.lon + (shelter.lon - loc.lon) * 0.65]
      ];
      const end = [shelter.lat, shelter.lon];

      routeMap.setSelectedLocation(loc.lat, loc.lon, loc.name);
      routeMap.setEvacuationRoute(start, waypoints, end, shelter.name);
    };

    setTimeout(() => {
      routeMap = new TerraGuardMap('route-map-container', {
        center: [loc.lat, loc.lon],
        zoom: 12
      });
      routeMap.init();
      updateRoute(selectedShelter);
    }, 50);

    // Shelter selection handler
    container.querySelectorAll('.shelter-card').forEach(card => {
      card.onclick = () => {
        const sid = card.dataset.id;
        selectedShelter = shelters.find(s => s.id === sid);
        container.querySelectorAll('.shelter-card').forEach(c => {
          c.style.background = c.dataset.id === sid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.6)';
          c.style.borderColor = c.dataset.id === sid ? 'var(--emerald-500)' : 'var(--border-subtle)';
        });
        updateRoute(selectedShelter);
      };
    });

    const reEvalBtn = document.getElementById('route-re-eval-btn');
    if (reEvalBtn) {
      reEvalBtn.onclick = () => router.navigate('processing');
    }
  }
};

export default SafeRouteView;

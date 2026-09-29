/**
 * TerraGuard AI - Vanilla Client Application Entrypoint
 * Initializes router, binds navigation events, mounts views,
 * and maintains continuous health ping to FastAPI backend.
 */
import api from './api.js';
import Router from './router.js';

// Import All 14 Core Views
import HomeView from './views/home.js';
import DashboardView from './views/dashboard.js';
import RiskAssessmentView from './views/risk-assessment.js';
import ProcessingView from './views/processing.js';
import RiskResultView from './views/risk-result.js';
import RiskMapView from './views/risk-map.js';
import HistoricalEventsView from './views/historical-events.js';
import DataSourcesView from './views/data-sources.js';
import EarlyWarningView from './views/early-warning.js';
import SafeRouteView from './views/safe-route.js';
import MethodologyView from './views/methodology.js';
import TechnicalArchitectureView from './views/technical-architecture.js';
import FutureExtensionsView from './views/future-extensions.js';
import SystemStatusView from './views/system-status.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Client Router
  const routes = {
    home: HomeView,
    dashboard: DashboardView,
    assessment: RiskAssessmentView,
    processing: ProcessingView,
    result: RiskResultView,
    map: RiskMapView,
    events: HistoricalEventsView,
    sources: DataSourcesView,
    warning: EarlyWarningView,
    route: SafeRouteView,
    methodology: MethodologyView,
    architecture: TechnicalArchitectureView,
    extensions: FutureExtensionsView,
    status: SystemStatusView
  };

  const router = new Router(routes, { containerId: 'main-content' });

  // 2. Mobile Sidebar Toggle Listener
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.querySelector('.mobile-toggle-btn');
  if (toggleBtn && sidebar) {
    toggleBtn.onclick = () => {
      sidebar.classList.toggle('open');
    };
  }

  // 3. Bind Navigation Sidebar Links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = () => {
      const viewId = link.getAttribute('data-view');
      if (viewId) {
        router.navigate(viewId);
        if (sidebar) sidebar.classList.remove('open');
      }
    };
  });

  // 4. Bind Topbar "Assess Risk" Quick Action Button
  const topAssessBtn = document.getElementById('topbar-assess-btn');
  if (topAssessBtn) {
    topAssessBtn.onclick = () => {
      router.navigate('assessment');
    };
  }

  // 5. Periodic Backend Health Check (every 15 seconds)
  const checkHealth = async () => {
    try {
      const res = await api.getHealth();
      if (res && res.status === 'healthy') {
        router.setBackendStatus(true);
      } else {
        router.setBackendStatus(false);
      }
    } catch {
      router.setBackendStatus(false);
    }
  };

  checkHealth();
  setInterval(checkHealth, 15000);

  // 6. Start Router
  router.init();
});

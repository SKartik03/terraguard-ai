/**
 * TerraGuard AI - Vanilla Client-Side Router
 * Manages view switching, hash-based deep linking, shared application state,
 * and sidebar synchronization without any build tools.
 */
import { safeRender } from './components/error-boundary.js';

export class Router {
  constructor(routes = {}, options = {}) {
    this.routes = routes;
    this.containerId = options.containerId || 'main-content';
    this.currentView = 'home';
    this.state = {
      backendOnline: true,
      pendingResult: null,
      resultData: this.loadCachedResult(),
      activeLocationTarget: {
        name: "Wayanad Vythiri Ghats",
        region: "Western Ghats, Kerala",
        lat: 11.5540,
        lon: 76.0422
      },
      processingLocationName: "Wayanad Vythiri Ghats",
      assessmentParams: {
        location_name: "Wayanad Vythiri Ghats",
        latitude: 11.5540,
        longitude: 76.0422,
        rainfall_mm: 125.0,
        slope_deg: 38.5,
        soil_moisture_pct: 74.0,
        geology_condition: "Weak",
        ndvi: 0.35,
        land_cover: "Barren",
        window_hours: 24
      }
    };

    window.addEventListener('hashchange', () => this.handleHashChange());
    window.router = this;
  }

  loadCachedResult() {
    try {
      const saved = localStorage.getItem('terraguard_last_location_analysis');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  registerView(id, viewModule) {
    this.routes[id] = viewModule;
  }

  init() {
    const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    const initialView = this.routes[hash] ? hash : 'home';
    this.navigate(initialView, {}, false);
  }

  handleHashChange() {
    const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    if (hash && this.routes[hash] && hash !== this.currentView) {
      this.navigate(hash, {}, false);
    }
  }

  navigate(viewId, params = {}, updateHash = true) {
    if (!this.routes[viewId]) {
      console.warn(`Route '${viewId}' not found; defaulting to 'home'.`);
      viewId = 'home';
    }

    this.currentView = viewId;

    if (updateHash) {
      window.location.hash = `#/${viewId}`;
    }

    // Update navigation UI (active link & topbar title)
    this.updateNavigationUI(viewId);

    // Mount view inside main container using safeRender boundary
    const container = document.getElementById(this.containerId);
    if (!container) return;

    const viewModule = this.routes[viewId];
    safeRender(
      container,
      (c) => viewModule.render(c, this.state, this),
      () => this.navigate(viewId, params, false),
      () => this.navigate('home', {}, true)
    );

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateNavigationUI(viewId) {
    // 1. Sidebar active class
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const linkView = link.getAttribute('data-view');
      if (linkView === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 2. Top bar title
    const titleEl = document.getElementById('current-view-title');
    if (titleEl) {
      const activeItem = document.querySelector(`.nav-link[data-view="${viewId}"] span`);
      titleEl.textContent = activeItem ? activeItem.textContent : 'Platform';
    }

    // 3. Quick Assess button visibility
    const assessBtn = document.getElementById('topbar-assess-btn');
    if (assessBtn) {
      if (viewId === 'assessment' || viewId === 'processing') {
        assessBtn.style.display = 'none';
      } else {
        assessBtn.style.display = 'inline-flex';
      }
    }
  }

  setBackendStatus(online) {
    this.state.backendOnline = online;
    const dot = document.getElementById('backend-status-dot');
    const text = document.getElementById('backend-status-text');
    const sideDot = document.getElementById('sidebar-status-dot');
    const sideText = document.getElementById('sidebar-status-text');

    if (dot) dot.style.background = online ? '#10B981' : '#F59E0B';
    if (text) {
      text.textContent = online ? 'API Online (8000)' : 'Offline Fallback';
      text.style.color = online ? 'var(--emerald-400)' : 'var(--risk-mod)';
    }
    if (sideDot) sideDot.style.background = online ? '#10B981' : '#F59E0B';
    if (sideText) sideText.textContent = online ? 'FastAPI Connected' : 'Local Resilience Mode';
  }
}

export default Router;

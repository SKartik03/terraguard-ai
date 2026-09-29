/**
 * TerraGuard AI - Error Boundary Utility (Vanilla JS)
 * Wraps view mounting and rendering in try/catch to prevent whole-page blanking.
 * Displays user-friendly fallback state with retry and navigation hooks.
 */

export function safeRender(container, renderFn, onRetry = null, onNavigateHome = null) {
  try {
    renderFn(container);
  } catch (error) {
    console.error("TerraGuard UI Error caught by boundary:", error);
    renderErrorUI(container, error, onRetry, onNavigateHome);
  }
}

export function renderErrorUI(container, error, onRetry = null, onNavigateHome = null) {
  if (!container) return;

  container.innerHTML = `
    <div class="glass-panel animate-fade-in" style="padding: 40px 32px; text-align: center; max-width: 640px; margin: 40px auto; border: 1px solid rgba(239, 68, 68, 0.35);">
      <div style="display: inline-flex; padding: 14px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); color: #EF4444; margin-bottom: 16px; font-size: 32px;">
        ⚠️
      </div>
      <h2 style="font-size: 1.4rem; color: #FFFFFF; margin-bottom: 10px;">
        Unable to load the assessment for this location right now
      </h2>
      <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.5; margin-bottom: 24px;">
        Please try again. If the issue persists, select another location or inspect the area directly on the interactive map.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="err-boundary-retry-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
          🔄 Try Again
        </button>
        <button id="err-boundary-home-btn" class="btn btn-secondary" style="display: flex; align-items: center; gap: 8px;">
          🏠 Choose Another Location
        </button>
      </div>
    </div>
  `;

  const retryBtn = container.querySelector('#err-boundary-retry-btn');
  if (retryBtn && onRetry) {
    retryBtn.onclick = () => onRetry();
  }

  const homeBtn = container.querySelector('#err-boundary-home-btn');
  if (homeBtn) {
    homeBtn.onclick = () => {
      if (onNavigateHome) onNavigateHome();
      else if (window.router) window.router.navigate('home');
    };
  }
}

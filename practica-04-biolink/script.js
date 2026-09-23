/**
 * StudyQuest - Core Application Logic
 * Architecture: Clean Vanilla JS (ES6+)
 * Theme: Pink Rose & Magenta Palette
 */

// State Management
const state = {
  userXp: 320,
  maxXp: 500,
  activeCodeTab: 'html',
  isWireframe: false
};

// Accessible Code Templates
const CODE_FILES = Object.freeze({
  html: `<!-- ESTRUCTURA PRINCIPAL index.html -->\n<!DOCTYPE html>\n<html lang="es">\n  <!-- Semantic HTML5, ARIA Landmarks y Schema JSON-LD -->\n</html>`,
  css: `/* styles.css - Paleta Rosa & Accesibilidad */\n@media (prefers-reduced-motion: reduce) {\n  * { animation: none !important; transition: none !important; }\n}`,
  js: `// script.js - Gestión de estado y ARIA\nfunction updateProgress(xp) {\n  const el = document.getElementById('xpProgressBar');\n  if (el) el.setAttribute('aria-valuenow', xp);\n}`
});

// Lifecycle Initializer
window.addEventListener('DOMContentLoaded', () => {
  initializeIcons();
  updateCodeBlock();
});

function initializeIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * System Gamification & XP Handling
 */
function gainXp(amount) {
  state.userXp = Math.min(state.userXp + amount, state.maxXp);
  
  const isMax = state.userXp === state.maxXp;
  const message = isMax 
    ? "Nivel máximo alcanzado (500/500 XP)" 
    : `+${amount} XP recibidos`;
  
  showToast(message);
  renderXpUI();
}

function renderXpUI() {
  const pct = (state.userXp / state.maxXp) * 100;
  const xpBar = document.getElementById('xpBar');
  const xpText = document.getElementById('xpText');
  const xpProgressBar = document.getElementById('xpProgressBar');

  if (xpBar) xpBar.style.width = `${pct}%`;
  if (xpText) xpText.innerText = `${state.userXp} / ${state.maxXp} XP`;
  if (xpProgressBar) xpProgressBar.setAttribute('aria-valuenow', state.userXp);
}

/**
 * Interface Layout & View Modes
 */
function toggleMode() {
  state.isWireframe = !state.isWireframe;
  const app = document.getElementById('main-content');
  const wfBanner = document.getElementById('wfBanner');

  if (state.isWireframe) {
    app?.classList.add('wireframe-mode');
    wfBanner?.classList.remove('hidden');
    showToast("Modo Blueprint activado");
  } else {
    app?.classList.remove('wireframe-mode');
    wfBanner?.classList.add('hidden');
    showToast("Modo Estándar activado");
  }
}

function switchMainView(view) {
  const prev = document.getElementById('previewContainer');
  const code = document.getElementById('codeContainer');
  const btnApp = document.getElementById('btnViewApp');
  const btnCode = document.getElementById('btnViewCode');

  const isPreview = view === 'preview';

  prev?.classList.toggle('hidden', !isPreview);
  code?.classList.toggle('hidden', isPreview);
  
  btnApp?.setAttribute('aria-pressed', isPreview ? 'true' : 'false');
  btnCode?.setAttribute('aria-pressed', isPreview ? 'false' : 'true');
}

function switchCodeTab(tab) {
  state.activeCodeTab = tab;
  
  ['Html', 'Css', 'Js'].forEach(t => {
    const btn = document.getElementById('tab' + t);
    const isCurrent = t.toLowerCase() === tab;
    
    if (btn) {
      btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      btn.className = isCurrent 
        ? 'px-3 py-1.5 text-xs font-semibold text-pink-900 border-b-2 border-pink-700 transition-colors bg-pink-100'
        : 'px-3 py-1.5 text-xs font-semibold text-pink-300 border-b-2 border-transparent hover:text-pink-100 transition-colors';
    }
  });

  updateCodeBlock();
}

function updateCodeBlock() {
  const block = document.getElementById('codeBlock');
  if (block) {
    block.textContent = CODE_FILES[state.activeCodeTab];
  }
}

/**
 * Professional Modals & Notifications
 */
function openModal(type) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  if (!content || !overlay) return;

  if (type === 'techStack' || type === 'proposalRequest') {
    content.innerHTML = `
      <div class="space-y-4">
        <h3 id="modalTitle" class="font-bold text-sm text-pink-100 flex items-center gap-2 border-b border-pink-800 pb-2">
          <i data-lucide="cpu" class="w-4 h-4 text-pink-300" aria-hidden="true"></i>
          Arquitectura del Sistema
        </h3>
        <p class="text-xs text-pink-200 leading-relaxed">
          Plataforma modular estructurada bajo estándares internacionales de accesibilidad (WCAG 2.1 AA) y optimización SEO.
        </p>
        <div class="flex flex-wrap gap-2 text-[11px]">
          <span class="bg-pink-950 text-pink-200 border border-pink-800 px-2.5 py-1 rounded font-mono">Semantic HTML5</span>
          <span class="bg-pink-950 text-pink-200 border border-pink-800 px-2.5 py-1 rounded font-mono">ARIA Standards</span>
          <span class="bg-pink-950 text-pink-200 border border-pink-800 px-2.5 py-1 rounded font-mono">JSON-LD Schema</span>
        </div>
        <button onclick="closeModal()" class="w-full py-2 bg-pink-100 hover:bg-white text-pink-950 font-bold text-xs rounded-lg transition-colors mt-2">
          Cerrar
        </button>
      </div>
    `;
  }

  initializeIcons();
  overlay.classList.remove('hidden');
}

function openServiceDetail(title, desc) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  if (!content || !overlay) return;

  content.innerHTML = `
    <div class="space-y-4">
      <span class="text-[10px] uppercase tracking-wider bg-pink-950 text-pink-300 font-bold px-2 py-0.5 rounded border border-pink-800">Servicio</span>
      <h3 id="modalTitle" class="font-bold text-base text-pink-100">${title}</h3>
      <p class="text-xs text-pink-200 leading-relaxed">${desc}</p>
      <button onclick="showToast('Solicitud recibida para: ${title}'); closeModal();" class="w-full py-2.5 bg-pink-100 hover:bg-white text-pink-950 font-bold text-xs rounded-lg transition-colors">
        Solicitar Información
      </button>
    </div>
  `;
  
  initializeIcons();
  overlay.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.add('hidden');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;

  toastMsg.innerText = msg;
  toast.classList.remove('translate-y-20', 'opacity-0');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}
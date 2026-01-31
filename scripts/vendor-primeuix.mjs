import { promises as fs } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const OUT_DIR = path.resolve(process.cwd(), 'public', 'vendor', 'primeuix');
const OUT_PATH = path.join(OUT_DIR, 'nora.css');

async function generateCompleteCSS() {
  try {
    const themeModulePath = path.resolve(
      process.cwd(),
      'node_modules',
      '@primeuix',
      'themes',
      'dist',
      'nora',
      'index.mjs'
    );
    const themeModule = await import(pathToFileURL(themeModulePath).href);
    const theme = themeModule.default || themeModule;

    const semantic = theme.semantic || {};
    const darkScheme = semantic.colorScheme?.dark || {};
    const primitive = theme.primitive || {};

    // Helper function to resolve token references
    const resolveColor = (ref) => {
      if (!ref) return ref;
      if (typeof ref !== 'string') return String(ref);
      const match = ref.match(/\{(.+?)\}/);
      if (match) {
        const path = match[1];
        const parts = path.split('.');
        let val = primitive;
        for (const part of parts) {
          val = val?.[part];
        }
        return val || ref;
      }
      return ref;
    };

    // Resolve colors to actual values
    const primaryColor = resolveColor(darkScheme.primary?.color) || '#059669';
    const primaryHover = resolveColor(darkScheme.primary?.hoverColor) || '#047857';
    const primaryActive = resolveColor(darkScheme.primary?.activeColor) || '#065f46';
    const surfaceText = '#ffffff';
    const surfaceSecondary = '#94a3b8';
    const contentBg = '#0f172a';
    const contentBorder = 'rgba(255,255,255,0.06)';
    const contentColor = '#e6eef8';
    const contentHoverBg = '#334155';
    const highlightBg = primaryColor;
    const highlightColor = '#ffffff';
    const listFocusBg = '#334155';
    const listSelectedBg = highlightBg;
    const listSelectedColor = highlightColor;
    const formFieldBg = '#0f172a';
    const formFieldBorder = '#334155';
    const formFieldColor = '#ffffff';
    const formFieldPlaceholder = '#94a3b8';

    const cssContent = `/* PrimeUIX Nora Dark Theme - Generated CSS */

[data-theme="dark"] {
  /* Surface colors */
  --p-surface-0: #ffffff;
  --p-surface-50: #f8fafc;
  --p-surface-100: #f1f5f9;
  --p-surface-200: #e2e8f0;
  --p-surface-300: #cbd5e1;
  --p-surface-400: #94a3b8;
  --p-surface-500: #64748b;
  --p-surface-600: #475569;
  --p-surface-700: #334155;
  --p-surface-800: #1e293b;
  --p-surface-900: #0f172a;
  --p-surface-950: #020617;

  /* Primary color */
  --p-primary-color: ${primaryColor};
  --p-primary-500: ${primaryColor};
  --p-primary-400: ${primaryHover};
  --p-primary-600: ${primaryActive};
  --p-primary-contrast-color: #ffffff;

  /* Text colors */
  --p-text-color: ${surfaceText};
  --p-text-muted-color: ${surfaceSecondary};
  --p-text-hover-color: #ffffff;

  /* Content colors */
  --p-content-background: ${contentBg};
  --p-content-border-color: ${contentBorder};
  --p-content-color: ${contentColor};
  --p-content-hover-background: ${contentHoverBg};

  /* Overlay colors */
  --p-overlay-background: ${contentBg};
  --p-overlay-border-color: ${contentHoverBg};

  /* Highlight colors */
  --p-highlight-background: ${highlightBg};
  --p-highlight-focus-background: ${primaryHover};
  --p-highlight-color: ${highlightColor};

  /* List/Select colors */
  --p-list-option-focus-background: ${listFocusBg};
  --p-list-option-selected-background: ${listSelectedBg};
  --p-list-option-selected-color: ${listSelectedColor};
  --p-list-option-selected-focus-background: ${primaryHover};

  /* Form field colors */
  --p-form-field-background: ${formFieldBg};
  --p-form-field-border-color: ${formFieldBorder};
  --p-form-field-color: ${formFieldColor};
  --p-form-field-placeholder-color: ${formFieldPlaceholder};
}

/* ===== PrimeVue Component Styles ===== */

/* Dropdowns and overlays */
.p-dropdown-panel,
.p-autocomplete-panel,
.p-multiselect-panel,
.p-selectpanel,
.p-overlaypanel,
.p-listbox,
.p-autocomplete {
  background: var(--p-content-background, #0f172a) !important;
  color: var(--p-content-color, #e6eef8) !important;
  border-color: var(--p-overlay-border-color, #334155) !important;
  font-family: inherit;
}

/* Dropdown/Autocomplete items */
.p-dropdown-items .p-dropdown-item,
.p-autocomplete-items .p-autocomplete-item,
.p-multiselect-items .p-multiselect-item,
.p-selectpanel .p-selectitem,
.p-listbox .p-listbox-item {
  background: transparent;
  color: var(--p-content-color, #e6eef8);
  padding: 0.5rem 0.75rem;
}

/* Hover state for dropdown items */
.p-dropdown-items .p-dropdown-item:hover,
.p-autocomplete-items .p-autocomplete-item:hover,
.p-multiselect-items .p-multiselect-item:hover,
.p-selectpanel .p-selectitem:hover,
.p-listbox .p-listbox-item:hover {
  background: var(--p-list-option-focus-background, #334155) !important;
  color: var(--p-content-color, #e6eef8) !important;
}

/* Selected/highlighted items */
.p-dropdown-items .p-dropdown-item.p-highlight,
.p-autocomplete-items .p-autocomplete-item.p-highlight,
.p-multiselect-items .p-multiselect-item.p-highlight,
.p-selectpanel .p-selectitem.p-highlight,
.p-listbox .p-listbox-item.p-highlight {
  background: var(--p-list-option-selected-background, #059669) !important;
  color: var(--p-list-option-selected-color, #ffffff) !important;
}

/* DataTable styling */
.p-datatable {
  background: var(--p-content-background, #0f172a);
  color: var(--p-content-color, #e6eef8);
  border-color: var(--p-overlay-border-color, #334155);
}

.p-datatable thead th {
  background: var(--p-surface-800, #1e293b) !important;
  color: var(--p-text-color, #ffffff) !important;
  border-color: var(--p-overlay-border-color, #334155) !important;
  font-weight: 700;
}

.p-datatable tbody td {
  border-color: var(--p-overlay-border-color, #334155) !important;
  color: var(--p-content-color, #e6eef8) !important;
}

/* Form inputs */
.p-inputtext,
.p-dropdown,
.p-select,
.p-autocomplete-input,
.p-textarea {
  background: var(--p-form-field-background, #0f172a) !important;
  color: var(--p-form-field-color, #ffffff) !important;
  border-color: var(--p-form-field-border-color, #334155) !important;
  font-family: inherit;
}

.p-inputtext::placeholder,
.p-textarea::placeholder {
  color: var(--p-form-field-placeholder-color, #94a3b8) !important;
}

/* Buttons */
.p-button {
  font-family: inherit;
  transition: all 0.2s ease;
}

.p-button.p-button-secondary {
  background: var(--p-surface-700, #334155) !important;
  border-color: var(--p-surface-700, #334155) !important;
  color: var(--p-content-color, #e6eef8) !important;
}

.p-button.p-button-text {
  background: transparent !important;
  color: var(--p-text-muted-color, #94a3b8) !important;
}

.p-button.p-button-text:hover {
  background: rgba(255,255,255,0.05) !important;
  color: var(--p-text-color, #ffffff) !important;
}

/* Panels and cards */
.p-panel {
  background: var(--p-content-background, #0f172a);
  border-color: var(--p-overlay-border-color, #334155);
  color: var(--p-content-color, #e6eef8);
}

.p-panel .p-panel-header {
  background: var(--p-surface-800, #1e293b);
  color: var(--p-text-color, #ffffff);
  border-color: var(--p-overlay-border-color, #334155);
}

.p-card {
  background: var(--p-content-background, #0f172a);
  border-color: var(--p-overlay-border-color, #334155);
  color: var(--p-content-color, #e6eef8);
}

/* Ensure theme attribute on body is respected for overlays */
body[data-theme="dark"] .p-dropdown-panel,
body[data-theme="dark"] .p-autocomplete-panel,
body[data-theme="dark"] .p-multiselect-panel,
body[data-theme="dark"] .p-listbox {
  background: var(--p-content-background, #0f172a) !important;
  color: var(--p-content-color, #e6eef8) !important;
}

/* @generated-by: vendor-primeuix.mjs */
`;

    await fs.mkdir(OUT_DIR, { recursive: true });
    await fs.writeFile(OUT_PATH, cssContent, 'utf8');
    console.log(`✓ Generated PrimeUIX CSS: ${OUT_PATH} (${cssContent.length} bytes)`);
    return true;
  } catch (err) {
    console.error('❌ Failed to generate CSS:', err.message);
    return false;
  }
}

(async () => {
  const success = await generateCompleteCSS();
  process.exit(success ? 0 : 1);
})();

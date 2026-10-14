export interface PageSEOConfig {
  title: string;
  description?: string;
  canonicalPath?: string;
  type?: string;
  publishedAt?: string;
  category?: string;
  keywords?: string[];
  jsonLd?: Record<string, unknown>;
}

const DEFAULT_TITLE = 'Vastu Ritam — Classical Vastu Vidya & Spatial Research';
const DEFAULT_DESCRIPTION =
  'A dedicated classical knowledge repository and architectural research institution for authentic Vastu Shastra, cosmic spatial geometry, and environmental harmony.';

export function setPageSEO(config: PageSEOConfig): void {
  if (typeof document === 'undefined') return;

  if (config.title) {
    document.title = config.title.includes('Vastu Ritam')
      ? config.title
      : `${config.title} | Vastu Ritam`;
  }

  if (config.description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', config.description);
  }

  if (config.jsonLd) {
    let scriptEl = document.getElementById('vastu-ritam-jsonld') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'vastu-ritam-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(config.jsonLd);
  }
}

export function resetSEO(): void {
  if (typeof document === 'undefined') return;
  document.title = DEFAULT_TITLE;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', DEFAULT_DESCRIPTION);
  }
  const scriptEl = document.getElementById('vastu-ritam-jsonld');
  if (scriptEl) {
    scriptEl.remove();
  }
}

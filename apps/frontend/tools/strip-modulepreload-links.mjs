const MODULEPRELOAD_LINK_TAGS = /<link\b[^>]*rel="modulepreload"[^>]*>/g;

export function stripModulePreloadLinks(html) {
  return html.replace(MODULEPRELOAD_LINK_TAGS, '');
}

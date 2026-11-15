interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  readonly ASSETS: AssetsBinding;
}

const API_ORIGIN = 'https://api.xemtuvimienphi.top';
const API_PATH_PREFIX = '/api/';
const SPA_SHELL_PATH = '/spa-shell';

function proxyToApi(request: Request, url: URL): Promise<Response> {
  return fetch(new Request(`${API_ORIGIN}${url.pathname}${url.search}`, request));
}

function serveSpaShell(request: Request, url: URL, env: Env): Promise<Response> {
  return env.ASSETS.fetch(new Request(new URL(SPA_SHELL_PATH, url), request));
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith(API_PATH_PREFIX)) {
      return proxyToApi(request, url);
    }
    return serveSpaShell(request, url, env);
  },
};

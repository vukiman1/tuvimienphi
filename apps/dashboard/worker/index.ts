interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  readonly ASSETS: AssetsBinding;
}

const API_ORIGIN = 'https://api.xemtuvimienphi.top';
const API_PATH_PREFIX = '/api/';
const ADMIN_PATH = '/admin';
const APP_SHELL_PATH = '/index.html';
const TEMPORARY_REDIRECT = 302;

function proxyToApi(request: Request, url: URL): Promise<Response> {
  return fetch(new Request(`${API_ORIGIN}${url.pathname}${url.search}`, request));
}

function serveAppShell(request: Request, url: URL, env: Env): Promise<Response> {
  return env.ASSETS.fetch(new Request(new URL(APP_SHELL_PATH, url), request));
}

export default {
  fetch(request: Request, env: Env): Response | Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith(API_PATH_PREFIX)) {
      return proxyToApi(request, url);
    }
    if (url.pathname === '/') {
      return Response.redirect(new URL(ADMIN_PATH, url).toString(), TEMPORARY_REDIRECT);
    }
    return serveAppShell(request, url, env);
  },
};

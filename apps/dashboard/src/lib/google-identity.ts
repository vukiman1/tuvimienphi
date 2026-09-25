import type { GoogleIdentityApi } from '@/types/google-identity';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const NO_ACCOUNTS_API = 'Google Identity Services tải xong nhưng không có accounts API.';
const SCRIPT_FAILED = 'Không tải được Google Identity Services.';

let scriptPromise: Promise<GoogleIdentityApi> | null = null;

function loadScript(): Promise<GoogleIdentityApi> {
  return new Promise<GoogleIdentityApi>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google.accounts.id);
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const api = window.google?.accounts?.id;
      if (api) {
        resolve(api);
      } else {
        reject(new Error(NO_ACCOUNTS_API));
      }
    };
    script.onerror = () => reject(new Error(SCRIPT_FAILED));
    document.head.appendChild(script);
  });
}

export function loadGoogleIdentity(): Promise<GoogleIdentityApi> {
  scriptPromise ??= loadScript();
  return scriptPromise;
}

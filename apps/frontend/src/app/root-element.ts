export const ROOT_ID = 'root';

class MissingRootElementError extends Error {
  constructor() {
    super(`index.html has no #${ROOT_ID} element to mount the app into`);
    this.name = 'MissingRootElementError';
  }
}

export function rootElement(): HTMLElement {
  const element = document.getElementById(ROOT_ID);
  if (!element) {
    throw new MissingRootElementError();
  }
  return element;
}

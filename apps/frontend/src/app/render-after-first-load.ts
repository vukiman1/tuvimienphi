interface FirstLoad {
  readonly load: () => Promise<void>;
}

export async function renderAfterFirstLoad(
  router: FirstLoad,
  renderApp: () => void,
): Promise<void> {
  try {
    await router.load();
  } finally {
    renderApp();
  }
}

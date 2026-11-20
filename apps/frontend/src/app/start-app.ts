export interface StartAppSteps {
  readonly isPrerendered: () => boolean;
  readonly whenFirstPainted: () => Promise<void>;
  readonly loadApp: () => Promise<unknown>;
}

export async function startApp({
  isPrerendered,
  whenFirstPainted,
  loadApp,
}: StartAppSteps): Promise<void> {
  if (!isPrerendered()) {
    await loadApp();
    return;
  }
  try {
    await whenFirstPainted();
  } finally {
    await loadApp();
  }
}

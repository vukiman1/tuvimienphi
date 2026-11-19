import { useEffect } from 'react';

const APP_MOUNTED_DATASET_KEY = 'appMounted';

export function AppMountedMarker(): null {
  useEffect(() => {
    document.documentElement.dataset[APP_MOUNTED_DATASET_KEY] = 'true';
  }, []);
  return null;
}

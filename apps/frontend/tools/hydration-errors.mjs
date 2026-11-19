const HYDRATION_ERROR_MESSAGE = /Minified React error #(418|423|425)\b|Hydration failed/;

export function isHydrationErrorMessage(message) {
  return HYDRATION_ERROR_MESSAGE.test(message);
}

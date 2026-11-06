export class FunnelConfigError extends Error {
  constructor() {
    super('Cannot derive the funnel hashing key: crypto.secretKey is not configured');
    this.name = 'FunnelConfigError';
  }
}

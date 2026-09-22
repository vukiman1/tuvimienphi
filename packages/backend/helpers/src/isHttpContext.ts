export interface TransportContext {
  getType(): string;
}

export function isHttpContext(context: TransportContext): boolean {
  return context.getType() === 'http';
}

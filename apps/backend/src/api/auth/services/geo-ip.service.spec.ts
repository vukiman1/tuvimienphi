import { Request } from 'express';
import { GeoIpService } from './geo-ip.service';

function requestWith(headers: Record<string, string>): Request {
  return { headers } as unknown as Request;
}

describe('GeoIpService', () => {
  let service: GeoIpService;

  beforeEach(() => {
    service = new GeoIpService();
  });

  it('returns an empty location when the edge sent no geo headers', () => {
    expect(service.locate(requestWith({}))).toEqual({ country: null, city: null });
  });

  it('reads country and city from the Cloudflare headers', () => {
    const request = requestWith({ 'cf-ipcountry': 'VN', 'cf-ipcity': 'Hanoi' });
    expect(service.locate(request)).toEqual({ country: 'VN', city: 'Hanoi' });
  });

  it('decodes a percent-encoded city name', () => {
    const request = requestWith({ 'cf-ipcity': 'Ho%20Chi%20Minh%20City' });
    expect(service.locate(request).city).toBe('Ho Chi Minh City');
  });

  it('reads the Cloudflare country header by itself', () => {
    expect(service.locate(requestWith({ 'cf-ipcountry': 'SG' })).country).toBe('SG');
  });

  it('maps a blank header to null', () => {
    const request = requestWith({ 'cf-ipcountry': 'US', 'cf-ipcity': '   ' });
    expect(service.locate(request)).toEqual({ country: 'US', city: null });
  });
});

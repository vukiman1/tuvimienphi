import { Injectable } from '@nestjs/common';
import { Request } from 'express';

export interface GeoLocation {
  country: string | null;
  city: string | null;
}

const EMPTY_LOCATION: GeoLocation = { country: null, city: null };

@Injectable()
export class GeoIpService {
  locate(request: Request): GeoLocation {
    const country = header(request, 'cf-ipcountry');
    const city = header(request, 'cf-ipcity');

    if (!country && !city) {
      return EMPTY_LOCATION;
    }
    return { country, city: city && decodeCity(city) };
  }
}

function header(request: Request, name: string): string | null {
  const value = request.headers[name];
  const first = Array.isArray(value) ? value[0] : value;
  const trimmed = first?.trim();
  return trimmed ? trimmed : null;
}

function decodeCity(value: string): string | null {
  try {
    const decoded = decodeURIComponent(value).trim();
    return decoded ? decoded : null;
  } catch {
    return value;
  }
}

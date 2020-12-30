import fetch, { Headers } from 'node-fetch';
import type { RequestInit, Response } from 'node-fetch';

/**
 * Authenticated fetcher for the Philips Hue remote API
 * (https://developers.meethue.com/develop/hue-api/remote-authentication/)
 */
export class AuthenticatedFetcher {
  private readonly accessToken: string;

  public constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  public async fetch(url: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set('Authorization', await this.getAuthorizationHeader());
    return fetch(url, { ...init, headers });
  }

  public async getAuthorizationHeader(): Promise<string> {
    return `Bearer ${this.accessToken}`;
  }
}

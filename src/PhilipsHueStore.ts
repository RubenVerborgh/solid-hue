import * as assert from 'assert';
import {
  getLoggerFor,
  readableToString,
  BaseResourceStore,
  BasicRepresentation,
  UnsupportedMediaTypeHttpError,
} from '@solid/community-server';
import type {
  Patch,
  Representation,
  ResourceIdentifier,
} from '@solid/community-server';
import type { AuthenticatedFetcher } from './AuthenticatedFetcher';
import { HueContentType } from './Constants';
import { createUrlTemplates } from './UrlTemplates';

// Entry points of the Philips Hue Remote API
const templates = createUrlTemplates({
  lights: 'https://api.meethue.com/bridge/{username}/lights',
  light: 'https://api.meethue.com/bridge/{username}/lights/{light}/state',
});

/**
 * Store that provides access to a set of Philips Hue lights
 * in the Philips Hue JSON format
 * (https://developers.meethue.com/develop/hue-api/lights-api/).
 */
export class PhilipsHueStore extends BaseResourceStore {
  private readonly fetcher: AuthenticatedFetcher;
  private readonly settings: Record<string, any>;
  private readonly logger = getLoggerFor(this);

  public constructor(options: {
    fetcher: AuthenticatedFetcher;
    username: string;
  }) {
    super();
    const { fetcher, ...settings } = options;
    this.fetcher = fetcher;
    this.settings = settings;
  }

  /**
   * Retrieves a JSON representation of all lights.
   */
  public async getRepresentation(identifier: ResourceIdentifier): Promise<Representation> {
    const url = templates.lights.expand(this.settings);
    this.logger.debug(`Retrieving light status from ${url}`);

    const response = await this.fetcher.fetch(url);
    assert.equal(response.status, 200);

    return new BasicRepresentation(await response.text(), identifier, HueContentType);
  }

  /**
   * Replaces the state of multiple lights via a JSON representation.
   */
  public async setRepresentation(identifier: ResourceIdentifier, representation: Representation): Promise<void> {
    // Technically, PUT is for replacing entire representations, and PATCH for (partial) updates.
    // However, any partial or incomplete resource state that could arrive via PUT
    // is complemented by the current physical state of the lights, so we just treat it as a PATCH.
    await this.modifyResource(identifier, representation);
  }

  /**
   * Adjusts the state of multiple lights via a JSON representation.
   */
  public async modifyResource(identifier: ResourceIdentifier, patch: Patch): Promise<void> {
    if (patch.metadata.contentType !== HueContentType) {
      throw new UnsupportedMediaTypeHttpError(`Only ${HueContentType} is supported`);
    }

    // Each light in the patch needs to be updated separately
    const lights = JSON.parse(await readableToString(patch.data));
    const updates = Object.keys(lights).map(async(light): Promise<void> =>
      this.setLightState(light, lights[light].state || {}));
    await Promise.all(updates);
  }

  /**
   * Updates the state of an individual light.
   */
  protected async setLightState(light: string, state: Record<string, any>): Promise<void> {
    const url = templates.light.expand({ ...this.settings, light });
    this.logger.debug(`Updating light status of ${url}`, { state });

    const response = await this.fetcher.fetch(url, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(state),
    });
    assert.equal(response.status, 200);
  }
}

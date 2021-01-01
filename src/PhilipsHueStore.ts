import * as assert from 'assert';
import {
  CONTENT_TYPE,
  getLoggerFor,
  guardedStreamFrom,
  readableToString,
  NotImplementedHttpError,
  RepresentationMetadata,
  UnsupportedMediaTypeHttpError,
} from '@solid/community-server';
import type {
  Conditions,
  Patch,
  Representation,
  RepresentationPreferences,
  ResourceIdentifier,
  ResourceStore,
} from '@solid/community-server';
import type { AuthenticatedFetcher } from './AuthenticatedFetcher';
import { HueContentType } from './Constants';
import { createUrlTemplates } from './UrlTemplates';

const templates = createUrlTemplates({
  lights: 'https://api.meethue.com/bridge/{username}/lights',
  light: 'https://api.meethue.com/bridge/{username}/lights/{light}/state',
});

/**
 * Store that provides access to a set of Philips Hue lights
 * in the Philips Hue JSON format
 * (https://developers.meethue.com/develop/hue-api/lights-api/).
 */
export class PhilipsHueStore implements ResourceStore {
  private readonly fetcher: AuthenticatedFetcher;
  private readonly settings: Record<string, any>;
  private readonly logger = getLoggerFor(this);

  public constructor(options: {
    fetcher: AuthenticatedFetcher;
    username: string;
  }) {
    const { fetcher, ...settings } = options;
    this.fetcher = fetcher;
    this.settings = settings;
  }

  public async getRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences,
    conditions?: Conditions): Promise<Representation> {
    const url = templates.lights.expand(this.settings);
    this.logger.debug(`Retrieving light status from ${url}`);
    const response = await this.fetcher.fetch(url);
    assert.equal(response.status, 200);

    return {
      binary: true,
      data: guardedStreamFrom([await response.text()]),
      metadata: new RepresentationMetadata(identifier, {
        [CONTENT_TYPE]: HueContentType,
      }),
    };
  }

  public async modifyResource(identifier: ResourceIdentifier, patch: Patch, conditions?: Conditions): Promise<void> {
    if (patch.metadata.contentType !== HueContentType) {
      throw new UnsupportedMediaTypeHttpError(`Only ${HueContentType} is supported`);
    }

    // Each light in the patch needs to be updated separately
    const lights = JSON.parse(await readableToString(patch.data));
    const updates = Object.keys(lights).map(async(light): Promise<void> =>
      this.updateLight(light, lights[light].state || {}));
    await Promise.all(updates);
  }

  public async setRepresentation(identifier: ResourceIdentifier, representation: Representation,
    conditions?: Conditions): Promise<void> {
    // Technically, PUT is for replacing entire representations, and PATCH for (partial) updates.
    // However, any partial or incomplete resource state that could arrive via PUT
    // is complemented by the current physical state of the lights, so we just treat it as a PATCH.
    await this.modifyResource(identifier, representation, conditions);
  }

  public async addResource(container: ResourceIdentifier, representation: Representation,
    conditions?: Conditions): Promise<ResourceIdentifier> {
    throw new NotImplementedHttpError();
  }

  public async deleteResource(identifier: ResourceIdentifier, conditions?: Conditions): Promise<void> {
    throw new NotImplementedHttpError();
  }

  protected async updateLight(id: string, state: Record<string, any>): Promise<void> {
    const url = templates.light.expand({ ...this.settings, light: id });
    this.logger.debug(`Updating light status of ${url}`, { state });
    const response = await this.fetcher.fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(state),
    });
    assert.equal(response.status, 200);
  }
}

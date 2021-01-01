import * as assert from 'assert';
import {
  CONTENT_TYPE,
  getLoggerFor,
  guardedStreamFrom,
  NotImplementedHttpError,
  RepresentationMetadata,
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

  public async setRepresentation(identifier: ResourceIdentifier, representation: Representation,
    conditions?: Conditions): Promise<void> {
    throw new NotImplementedHttpError();
  }

  public async addResource(container: ResourceIdentifier, representation: Representation,
    conditions?: Conditions): Promise<ResourceIdentifier> {
    throw new NotImplementedHttpError();
  }

  public async deleteResource(identifier: ResourceIdentifier, conditions?: Conditions): Promise<void> {
    throw new NotImplementedHttpError();
  }

  public async modifyResource(identifier: ResourceIdentifier, patch: Patch, conditions?: Conditions): Promise<void> {
    throw new NotImplementedHttpError();
  }
}

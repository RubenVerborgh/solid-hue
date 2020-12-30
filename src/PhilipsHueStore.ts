import { NotImplementedHttpError } from '@solid/community-server';
import type {
  Conditions,
  Patch,
  Representation,
  RepresentationPreferences,
  ResourceIdentifier,
  ResourceStore,
} from '@solid/community-server';

/**
 * Store that provides access to a set of Philips Hue lights
 * in the Philips Hue JSON format
 * (https://developers.meethue.com/develop/hue-api/lights-api/).
 */
export class PhilipsHueStore implements ResourceStore {
  public async getRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences,
    conditions?: Conditions): Promise<Representation> {
    throw new NotImplementedHttpError();
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

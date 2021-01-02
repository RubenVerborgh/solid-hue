import { PassThrough } from 'stream';
import type { Literal, Quad } from 'rdf-js';
import {
  CONTENT_TYPE, INTERNAL_QUADS,
  RepresentationMetadata,
  TypedRepresentationConverter,
  guardStream,
} from '@solid/community-server';
import type {
  Representation,
  RepresentationConverterArgs,
  ResourceIdentifier,
} from '@solid/community-server';
import { stateMapping, valueParsers } from './Vocabularies';
import { HueContentType } from './Constants';

/**
 * Converts quads to the Philips Hue JSON format.
 */
export class QuadToHueConverter extends TypedRepresentationConverter {
  public async getInputTypes(): Promise<Record<string, number>> {
    return { [INTERNAL_QUADS]: 1 };
  }

  public async getOutputTypes(): Promise<Record<string, number>> {
    return { [HueContentType]: 1 };
  }

  public async handle({ identifier, representation }: RepresentationConverterArgs): Promise<Representation> {
    // Create the resulting representation and its metadata
    const data = guardStream(new PassThrough());
    const metadata = new RepresentationMetadata(representation.metadata, { [CONTENT_TYPE]: HueContentType });

    // Collect light state from every triple
    const lights = {};
    representation.data.on('data', (quad): void => this.extractQuadData(lights, identifier, quad));

    // Convert the collected state to JSON
    representation.data.on('end', (): void => {
      data.push(JSON.stringify(lights));
      data.push(null);
    });
    return { binary: true, data, metadata };
  }

  protected extractQuadData(lights: Record<string, any>, { path: source }: ResourceIdentifier,
    { subject: { value: subject }, predicate: { value: predicate }, object }: Quad): void {
    // Extract the ID of the light
    const light = subject.startsWith(source) ? subject.slice(source.length + 1) : '';

    // Extract the property value if it occurs in the mapping
    const mapping = stateMapping[predicate];
    if (/^\d+$/u.test(light) && mapping?.dataType.equals((object as Literal).datatype)) {
      // Initialize the state of the light if none was present yet
      if (!(light in lights)) {
        lights[light] = { state: {}};
      }
      // Add the parsed object to the light's state
      const parser = valueParsers[mapping.dataType.value];
      lights[light].state[mapping.field] = parser(object.value);
    }
  }
}

import type { Literal, Quad } from 'rdf-js';
import {
  INTERNAL_QUADS,
  BasicRepresentation,
  TypedRepresentationConverter,
  transformSafely,
} from '@solid/community-server';
import type { Representation, RepresentationConverterArgs } from '@solid/community-server';
import { stateMapping, valueParsers } from './Vocabularies';
import { HueContentType } from './Constants';

/**
 * Converts quads to the Philips Hue JSON format.
 */
export class QuadToHueConverter extends TypedRepresentationConverter {
  public constructor() {
    super(INTERNAL_QUADS, HueContentType);
  }

  public async handle({ identifier, representation }: RepresentationConverterArgs): Promise<Representation> {
    const lights: Record<string, any> = {};
    const data = transformSafely<Quad>(representation.data, {
      writableObjectMode: true,
      // Convert every triple to a property about a light
      transform({ subject: { value: subject }, predicate: { value: predicate }, object }): void {
        // Extract the ID of the light
        const light = subject.startsWith(identifier.path) ? subject.slice(identifier.path.length + 1) : '';

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
      },
      // Transforms the end result to JSON
      flush(): void {
        this.push(JSON.stringify(lights));
      },
    });
    return new BasicRepresentation(data, representation.metadata, HueContentType);
  }
}

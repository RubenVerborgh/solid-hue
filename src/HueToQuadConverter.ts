import { namedNode, literal } from '@rdfjs/data-model';
import {
  INTERNAL_QUADS, PREFERRED_PREFIX_TERM, RDF,
  BasicRepresentation,
  RepresentationMetadata,
  TypedRepresentationConverter,
  pushQuad,
  transformSafely,
} from '@solid/community-server';
import type { Representation, RepresentationConverterArgs } from '@solid/community-server';
import { DOGONT, HUE, RDFS, stateMapping } from './Vocabularies';
import { HueContentType } from './Constants';

/**
 * Converts the Philips Hue JSON format to quads.
 */
export class HueToQuadConverter extends TypedRepresentationConverter {
  public constructor() {
    super(HueContentType, INTERNAL_QUADS);
  }

  public async handle({ identifier, representation }: RepresentationConverterArgs): Promise<Representation> {
    const metadata = new RepresentationMetadata(representation.metadata, INTERNAL_QUADS);
    metadata.addQuad(DOGONT.terms.namespace, PREFERRED_PREFIX_TERM, 'dogont');
    metadata.addQuad(RDFS.terms.namespace, PREFERRED_PREFIX_TERM, 'rdfs');
    metadata.addQuad(HUE.terms.namespace, PREFERRED_PREFIX_TERM, 'ph');

    // Transform the JSON into RDF quads
    const json: string[] = [];
    const data = transformSafely(representation.data, {
      readableObjectMode: true,
      transform: (buffer): any => json.push(buffer),
      flush(): void {
        // Generate RDF quads for every light
        const lights: Record<string, any> = JSON.parse(json.join(''));
        for (const [key, light] of Object.entries(lights)) {
          // Generate the type and label
          const id = namedNode(`${identifier.path}#${encodeURIComponent(key)}`);
          pushQuad(this, id, RDF.terms.type, DOGONT.terms.Lamp);
          pushQuad(this, id, RDFS.terms.label, literal(light.name));
          // Generate state properties
          for (const [predicate, { field, dataType }] of Object.entries(stateMapping)) {
            pushQuad(this, id, predicate, literal(`${light.state[field]}`, dataType));
          }
        }
      },
    });
    return new BasicRepresentation(data, metadata);
  }
}

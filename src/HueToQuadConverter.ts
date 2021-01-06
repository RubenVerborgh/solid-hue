import { PassThrough } from 'stream';
import { namedNode, literal } from '@rdfjs/data-model';
import {
  CONTENT_TYPE, INTERNAL_QUADS, PREFERRED_PREFIX_TERM, RDF,
  RepresentationMetadata,
  TypedRepresentationConverter,
  guardStream,
  pushQuad,
  readableToString,
} from '@solid/community-server';
import type {
  Representation,
  RepresentationConverterArgs,
  ResourceIdentifier,
} from '@solid/community-server';
import { DOGONT, HUE, RDFS, stateMapping } from './Vocabularies';
import { HueContentType } from './Constants';

/**
 * Converts the Philips Hue JSON format to quads.
 */
export class HueToQuadConverter extends TypedRepresentationConverter {
  public async getInputTypes(): Promise<Record<string, number>> {
    return { [HueContentType]: 1 };
  }

  public async getOutputTypes(): Promise<Record<string, number>> {
    return { [INTERNAL_QUADS]: 0.5 };
  }

  public async handle({ identifier, representation }: RepresentationConverterArgs): Promise<Representation> {
    // Create the resulting representation and its metadata
    const data = guardStream(new PassThrough({ objectMode: true }));
    const metadata = new RepresentationMetadata(representation.metadata, { [CONTENT_TYPE]: INTERNAL_QUADS });
    metadata.addQuad(DOGONT.terms.namespace, PREFERRED_PREFIX_TERM, 'dogont');
    metadata.addQuad(RDFS.terms.namespace, PREFERRED_PREFIX_TERM, 'rdfs');
    metadata.addQuad(HUE.terms.namespace, PREFERRED_PREFIX_TERM, 'ph');

    // Parse the source asynchronously
    setImmediate(async(): Promise<void> => {
      const lights = JSON.parse(await readableToString(representation.data));
      this.addQuadsFromLights(data, identifier, lights);
    });

    return { binary: false, data, metadata };
  }

  protected addQuadsFromLights(data: PassThrough, source: ResourceIdentifier, lights: Record<string, any>): void {
    for (const id of Object.keys(lights)) {
      this.addQuadsFromLight(data, source, { id, ...lights[id] });
    }
    data.push(null);
  }

  protected addQuadsFromLight(data: PassThrough, source: ResourceIdentifier, light: Record<string, any>): void {
    const id = namedNode(`${source.path}#${encodeURIComponent(light.id)}`);
    pushQuad(data, id, RDF.terms.type, DOGONT.terms.Lamp);
    pushQuad(data, id, RDFS.terms.label, literal(light.name));
    for (const predicate of Object.keys(stateMapping)) {
      const { field, dataType } = stateMapping[predicate];
      pushQuad(data, id, predicate, literal(`${light.state[field]}`, dataType));
    }
  }
}

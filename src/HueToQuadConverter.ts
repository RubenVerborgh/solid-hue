import { PassThrough } from 'stream';
import { namedNode, literal } from '@rdfjs/data-model';
import {
  CONTENT_TYPE,
  INTERNAL_QUADS,
  RDF,
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
import { DOGONT, RDFS, HUE, XSD } from './Vocabularies';
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
    const { state } = light;
    pushQuad(data, id, RDF.terms.type, DOGONT.terms.Lamp);
    pushQuad(data, id, RDFS.terms.label, literal(light.name));
    pushQuad(data, id, HUE.terms.on, literal(`${state.on}`, XSD.terms.boolean));
    pushQuad(data, id, HUE.terms.hue, literal(`${state.hue}`, XSD.terms.integer));
    pushQuad(data, id, HUE.terms.saturation, literal(`${state.sat}`, XSD.terms.integer));
    pushQuad(data, id, HUE.terms.brightness, literal(`${state.bri}`, XSD.terms.integer));
  }
}

/* eslint-disable @typescript-eslint/naming-convention, function-paren-newline */
import { createUriAndTermNamespace } from '@solid/community-server';

export const DOGONT = createUriAndTermNamespace('http://elite.polito.it/ontologies/dogont.owl#',
  'Lamp',
);

export const HUE = createUriAndTermNamespace('urn:tmp:philips:hue#',
  'brightness',
  'hue',
  'on',
  'saturation',
);

export const RDFS = createUriAndTermNamespace('http://www.w3.org/2000/01/rdf-schema#',
  'label',
);

export const XSD = createUriAndTermNamespace('http://www.w3.org/2001/XMLSchema#',
  'boolean',
  'integer',
);

import URITemplate from 'urijs/src/URITemplate';

export const createUrlTemplates = <T extends Record<string, string>>(patterns: T):
Record<keyof T, URITemplate> => {
  const templates: Record<keyof T, URITemplate> = {} as any;
  for (const key in patterns) {
    if (Object.prototype.hasOwnProperty.call(patterns, key)) {
      templates[key] = new URITemplate(patterns[key]);
    }
  }
  return templates;
};

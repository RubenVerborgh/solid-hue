declare module 'urijs/src/URITemplate' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  class URITemplate {
    public constructor(...any);

    public expand(fields?: Record<string, string>): string;
  }
  export = URITemplate;
}

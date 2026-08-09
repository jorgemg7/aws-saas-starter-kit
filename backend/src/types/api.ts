export interface ApiEvent {
  rawPath?: string;
  requestContext?: {
    authorizer?: {
      jwt?: {
        claims?: Record<string, string>;
      };
      claims?: Record<string, string>;
    };
  };
}

export interface ApiEvent {
  rawPath?: string;

  body?: string;

  requestContext?: {
    http?: {
      method?: string;
    };

    authorizer?: {
      jwt?: {
        claims?: Record<string, string>;
      };

      claims?: Record<string, string>;
    };
  };
}

export interface ApiResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

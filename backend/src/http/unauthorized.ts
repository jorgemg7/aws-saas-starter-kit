import { HTTP } from "../constants/http.js";
import { HEADERS } from "../constants/headers.js";
import { MESSAGES } from "../constants/messages.js";
import type { ApiResponse } from "../types/api.js";

export function unauthorized(): ApiResponse {
  return {
    statusCode: HTTP.UNAUTHORIZED,
    headers: HEADERS.JSON,
    body: JSON.stringify({
      message: MESSAGES.UNAUTHORIZED,
    }),
  };
}

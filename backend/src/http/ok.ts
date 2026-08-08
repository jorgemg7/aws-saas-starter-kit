import { HEADERS } from "../constants/headers.js";
import type { ApiResponse } from "../types/api.js";

export function ok(data: unknown): ApiResponse {
  return {
    statusCode: 200,
    headers: HEADERS.JSON,
    body: JSON.stringify(data),
  };
}

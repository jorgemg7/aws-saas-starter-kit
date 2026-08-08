import { APIGatewayProxyEventV2 } from "aws-lambda";

export type ApiEvent = APIGatewayProxyEventV2;

export interface ApiResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

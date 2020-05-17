import { ServerRequest } from "./deps.ts";
import * as matcher from "./matcher.ts";
import { Handler } from "./server.ts";

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "HEAD"
  | "PATCH"
  | "OPTIONS";

type Route = (
  method: HttpMethod,
  path: string,
  handler: RouteHandler,
) => Handler;

interface RouteRequest extends ServerRequest {
  params: undefined | { [key: string]: string };
}

type RouteHandler = (
  req: RouteRequest,
) => Promise<string | object | null | void>;

const createRoute: Route = (method, path, handler) => {
  return async (req) => {
    if (method !== req.method) {
      return;
    }

    // Remove query from url
    const [url] = req.url.split("?");

    // Check if url match route && extract params
    const match = matcher.match(url, [matcher.parse(path)]);

    if (match.length === 0) {
      return;
    }

    const params = matcher.exec(url, match);

    return handler(Object.assign(req, { params: params }));
  };
};

export const get = (path: string, handler: RouteHandler) =>
  createRoute("GET", path, handler);
export const post = (path: string, handler: RouteHandler) =>
  createRoute("POST", path, handler);
export const put = (path: string, handler: RouteHandler) =>
  createRoute("PUT", path, handler);
export const del = (path: string, handler: RouteHandler) =>
  createRoute("DELETE", path, handler);
export const patch = (path: string, handler: RouteHandler) =>
  createRoute("PATCH", path, handler);
export const head = (path: string, handler: RouteHandler) =>
  createRoute("HEAD", path, handler);
export const options = (path: string, handler: RouteHandler) =>
  createRoute("OPTIONS", path, handler);

type Router = (...handlers: Handler[]) => Handler;
export const createRouter: Router = (...handlers) => {
  return async (req) => {
    for (const handler of handlers) {
      const result = await handler(req);

      if (typeof result !== "undefined") {
        return result;
      }
    }

    return;
  };
};

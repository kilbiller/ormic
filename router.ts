import { ServerRequest } from "./deps.ts";
import * as matcher from "./matcher.ts";
import { Handler } from "./server.ts";

const httpMethods = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "HEAD",
  "PATCH",
  "OPTIONS",
];

interface RouteRequest extends ServerRequest {
  params: undefined | Record<string, string>;
}

type RouteHandler = (
  req: RouteRequest,
) => Promise<string | object | null | void>;

type Route = (method: string, path: string, handler: RouteHandler) => Handler;

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

type MethodRoute = (path: string, handler: RouteHandler) => Handler;
export const { get, post, put, del, head, patch, options } = httpMethods
  .reduce((obj: Record<string, MethodRoute>, method) => {
    const funcName = (method === "DELETE" ? "del" : method).toLowerCase();
    obj[funcName] = (path, handler) => createRoute(method, path, handler);
    return obj;
  }, {});

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

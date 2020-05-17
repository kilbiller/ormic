import {
  serve,
  ServerRequest,
  Server,
  Response,
  HTTPOptions,
} from "./deps.ts";

export type Handler = (
  req: ServerRequest,
) => Promise<string | object | null | void>;

export const createServer = (handler: Handler) => {
  let server: Server | undefined;

  return {
    listen: async (addr: string | HTTPOptions) => {
      server = serve(addr);

      for await (const req of server) {
        const body = await handler(req);

        if (body === null) {
          req.respond({ status: 204 });
        } else if (typeof body === "string") {
          req.respond({ body });
        } else if (body) {
          const headers = new Headers({ "content-type": "text/json" });
          req.respond(
            {
              headers: headers,
              body: JSON.stringify(body),
            },
          );
        }
      }
    },
    close: () => {
      server?.close();
    },
  };
};

export const json = (data: object, status = 200, headers = {}): Response => {
  return {
    status,
    body: JSON.stringify(data),
    headers: new Headers({ "content-type": "text/json", ...headers }),
  };
};

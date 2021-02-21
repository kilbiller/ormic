// deno-lint-ignore-file require-await

import { assertEquals } from "./deps.ts";
import { createServer, json } from "./server.ts";
import { createRouter, del, get } from "./router.ts";

const port = 3000;

Deno.test("server should respond correctly", async () => {
  const server = createServer(async (req) => "Hello World !");
  server.listen(`:${port}`);

  const response = await fetch(`http://127.0.0.1:${port}`);
  const body = await response.text();

  assertEquals(body, "Hello World !");

  server.close();
});

Deno.test("router should match routes correctly", async () => {
  const router = createRouter(
    get("/", async (req) => "index"),
    get("/long/*", async (req) => "long"),
    get(
      "/friends/*",
      createRouter(get("/friends/:id", async (req) => req.params?.id)),
    ),
    get("/books/:id/sell", async (req) => {
      return { book_id: req.params?.id };
    }),
    async (req) =>
      req.respond(
        json({ message: "Not found." }, 404),
      ),
  );

  const server = createServer(router);
  server.listen(`:${port}`);

  const indexResponse = await fetch(`http://127.0.0.1:${port}`);
  const indexBody = await indexResponse.text();

  assertEquals(indexBody, "index");

  const longResponse = await fetch(`http://127.0.0.1:${port}/long/i/am/long`);
  const longBody = await longResponse.text();

  assertEquals(longBody, "long");

  const uuid = "0db8f950-9852-11ea-bb37-0242ac130002";
  const bookResponse = await fetch(
    `http://127.0.0.1:${port}/books/${uuid}/sell`,
  );
  const bookBody = await bookResponse.json();

  assertEquals(bookBody.book_id, uuid);

  server.close();
});

Deno.test("DELETE method", async () => {
  const router = createRouter(
    del("/", async (req) => "delete"),
  );

  const server = createServer(router);
  server.listen(`:${port}`);

  const indexResponse = await fetch(`http://127.0.0.1:${port}`, {
    method: "DELETE",
  });
  const indexBody = await indexResponse.text();

  assertEquals(indexBody, "delete");

  server.close();
});

import {
  fetch as undiciFetch,
  Headers,
  Request as UndiciRequest,
  Response,
} from "undici";
import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";

// RTK Query's fetchBaseQuery uses relative paths (e.g. /api/v1/departments).
// In a browser, relative URLs resolve against window.location — but undici's
// Request (which we use to fix jsdom's incompatible AbortSignal) requires
// absolute URLs. Prepend a test origin so both undici and MSW are happy.
const TEST_ORIGIN = "http://localhost";

function toAbsolute(input: string | UndiciRequest | URL): string | UndiciRequest | URL {
  if (typeof input === "string" && input.startsWith("/")) {
    return `${TEST_ORIGIN}${input}`;
  }
  return input;
}

const fetch = (input: string | UndiciRequest | URL, init?: RequestInit) =>
  undiciFetch(toAbsolute(input) as string, init as Parameters<typeof undiciFetch>[1]);

class Request extends UndiciRequest {
  constructor(
    input: string | UndiciRequest,
    init?: ConstructorParameters<typeof UndiciRequest>[1],
  ) {
    super(toAbsolute(input) as string, init);
  }
}

Object.assign(globalThis, { fetch, Headers, Request, Response });

import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

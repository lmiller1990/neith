import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/express";
import { PORT } from "../shared/constants";

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: null,
  links: [
    httpBatchLink({
      url: `http://localhost:${PORT}/trpc`,
    }),
  ],
});

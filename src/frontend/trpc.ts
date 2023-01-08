import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { TRPC_Router } from "../server/controllers/trpc.js";

export const trpc = createTRPCProxyClient<TRPC_Router>({
  links: [
    httpBatchLink({
      url: `/trpc`,
    }),
  ],
});

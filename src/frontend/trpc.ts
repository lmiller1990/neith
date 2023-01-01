import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { TRPC_Router } from "../server/controllers/trpc.js";
import { PORT } from "../shared/constants";

export const trpc = createTRPCProxyClient<TRPC_Router>({
  links: [
    httpBatchLink({
      url: `http://localhost:${PORT}/trpc`,
    }),
  ],
});

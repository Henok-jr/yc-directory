import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Browser-safe Sanity client (no `server-only` import)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

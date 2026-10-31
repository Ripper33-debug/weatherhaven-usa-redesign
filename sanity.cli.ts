/** Settings for the Sanity command line (`npx sanity …`), e.g. `npx sanity schema validate`. */
import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./src/sanity/env";

export default defineCliConfig({ api: { projectId, dataset } });

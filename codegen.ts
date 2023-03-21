
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/schema.graphql",
  generates: {
    "src/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "./pages/api/index#GraphQLContext",
      },
    },
  },
};

export default config;

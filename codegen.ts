
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/schema.graphql",
  documents: "src/documents/**/*.graphql",
  generates: {
    "src/types.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-resolvers",
        "typescript-react-apollo",
      ],
      config: {
        mapperTypeSuffix: "Model",
        mappers: {
          Cart: "@prisma/client#Cart",
          CartItem: "@prisma/client#CartItem",
        },
        contextType: "./pages/api/index#GraphQLContext",
      },
    },
  },
};

export default config;

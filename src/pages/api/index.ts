import { Resolvers } from "@/types";
import { createServer } from "@graphql-yoga/node";
import { readFileSync } from "fs";
import { join } from "path";

const typeDefs = readFileSync(join(process.cwd(), "src/schema.graphql"), {
  encoding: "utf-8",
});

const resolvers: Resolvers = {
  Query: {
    cart: (_, { id }) => {
      return {
        id,
        total: 0,
      };
    },
  },
};

const server = createServer({
  endpoint: "/api",
  schema: {
    typeDefs,
    resolvers,
  },
});

export default server;

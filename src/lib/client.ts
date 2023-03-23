import { ApolloClient, InMemoryCache } from "@apollo/client";

const protocol = `${
  process.env.NODE_ENV === "production" ? "https" : "http"
}://`;

const host =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_VERCEL_URL || "localhost:3000"
    : window.location.host;

export const origin = `${protocol}${host}`;

export const apolloClient = new ApolloClient({
  uri: `${origin}/api`,
  cache: new InMemoryCache(),
});

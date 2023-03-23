import { useMemo } from "react";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { apolloClient, origin } from "@/lib/client";

export const useClient = () => {
  const client = useMemo(() => apolloClient, []);
  return client;
};

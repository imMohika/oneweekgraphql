import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import { useClient } from "@/hooks/useClient";
import { ApolloProvider } from "@apollo/client";
import { Header } from "@/components/Header";

export default function App({ Component, pageProps }: AppProps) {
  const client = useClient();
  return (
    <ApolloProvider client={client}>
      <div className="flex flex-col w-screen h-screen">
        <Header />
        <div className="flex-1">
          <Component {...pageProps} />
        </div>
      </div>
    </ApolloProvider>
  );
}

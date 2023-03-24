import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { useRouter } from "next/router";
import { useGetCartQuery } from "@/types";
import { removeCookies } from "cookies-next";
import { CartList } from "@/components/CartList";

export interface SuccessPageProps {
  session: Stripe.Checkout.Session | null;
}

const SuccessPage: NextPage<SuccessPageProps> = ({
  session,
}: SuccessPageProps) => {
  const { data: cart, loading } = useGetCartQuery({
    variables: { id: Number(session?.metadata?.cartId!) },
    skip: !session?.metadata?.cartId,
  });

  const router = useRouter();
  if (!session) {
    router.push("/");
    return <div />;
  }

  if (!session.metadata?.cartId) {
    return (
      <main className="grid flex-1 max-w-4xl min-h-full grid-cols-2 mx-auto space-y-8">
        <p className="text-xl text-red-600">ERROR</p>
        <p className="text-2xl">Session metadata isn't valid</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="grid flex-1 max-w-4xl min-h-full grid-cols-2 mx-auto space-y-8">
        <p className="text-2xl">Loading...</p>
      </main>
    );
  }

  if (!cart) {
    return (
      <main className="grid flex-1 max-w-4xl min-h-full grid-cols-2 mx-auto space-y-8">
        <p className="text-xl text-red-600">ERROR</p>
        <p className="text-2xl">Cart isn't valid</p>
      </main>
    );
  }

  return (
    <main className="flex w-full h-full gap-8">
      <div className="p-8 space-y-4 border-r border-neutral-700">
        <h1 className="text-4xl">{`Thanks <3`}</h1>
        <p>Your order is confirmed!</p>
        <p>{`You'll receive an email when it's ready.`}</p>
        <div>
          <p>Want to start a new order?</p>
          <button
            className="p-1 font-bold border border-neutral-700 hover:bg-black hover:text-white"
            onClick={() => {
              removeCookies("cartId");
              router.push("/");
            }}
          >
            Click here.
          </button>
        </div>
      </div>
      <div className="flex-1 p-8">
        <CartList cartId={Number(session.metadata.cartId)} readonly />
      </div>
    </main>
  );
};

export default SuccessPage;

export const getServerSideProps: GetServerSideProps<SuccessPageProps> = async ({
  query,
}: GetServerSidePropsContext) => {
  const { session_id: sessionId } = query;

  const session =
    typeof sessionId === "string"
      ? await stripe.checkout.sessions.retrieve(sessionId)
      : null;

  return {
    props: { session },
  };
};

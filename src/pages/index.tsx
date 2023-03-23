import { getAllItems } from "@/lib/products";
import { ProductList } from "@/components/ProductList";
import { InferGetStaticPropsType, NextPage } from "next";

export const getStaticProps = async () => ({
  props: {
    products: getAllItems(),
  },
});

const HomePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  products,
}) => {
  return (
    <main>
      <ProductList products={products.slice(0, 6)} />
    </main>
  );
};

export default HomePage;

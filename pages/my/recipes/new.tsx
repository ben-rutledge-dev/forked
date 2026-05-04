import Layout from "@/components/Layout";
import RecipeForm from "@/components/RecipeForm";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default function NewRecipe() {
  return (
    <Layout title="New Recipe">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-stone-900 mb-8">New recipe</h1>
        <RecipeForm />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session?.user?.id) {
    return { redirect: { destination: "/api/auth/signin", permanent: false } };
  }
  return { props: {} };
};

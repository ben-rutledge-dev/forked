import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = await prisma.recipeBook.findUnique({ where: { id }, select: { title: true } });
  return { title: book?.title ?? "Recipe Book" };
}

export default async function PublicRecipeBookPage({ params }: Props) {
  const { id } = await params;

  const book = await prisma.recipeBook.findUnique({
    where: { id },
    include: {
      members: {
        where: { acceptedAt: { not: null } },
        include: { user: { select: { name: true, username: true, isPublic: true } } },
        orderBy: { createdAt: "asc" },
      },
      entries: {
        include: {
          recipe: {
            select: {
              id: true, title: true, description: true, coverImageUrl: true,
              forkCount: true, isPublic: true,
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!book || !book.isPublic) notFound();

  const publicEntries = book.entries.filter((e) => e.recipe.isPublic);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {book.coverImageUrl && (
        <div className="w-full h-48 rounded-xl overflow-hidden mb-6">
          <img src={book.coverImageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <h1 className="text-2xl font-semibold text-stone-900">{book.title}</h1>
      {book.description && <p className="mt-2 text-stone-500">{book.description}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {book.members.map((m) => (
          <span key={m.id} className="text-xs text-stone-500">
            {m.user.isPublic && m.user.username ? (
              <Link href={`/u/${m.user.username}`} className="hover:underline">
                {m.user.name ?? m.user.username}
              </Link>
            ) : (
              m.user.name ?? "Anonymous"
            )}
            {m.role === "OWNER" && (
              <span className="ml-1 text-stone-300">(owner)</span>
            )}
          </span>
        ))}
      </div>

      <div className="mt-8">
        {publicEntries.length === 0 ? (
          <p className="text-stone-400 text-center py-12">No public recipes in this book.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/recipes/${entry.recipe.id}`}
                className="flex flex-col rounded-xl border border-stone-200 bg-white overflow-hidden hover:border-stone-300 transition-colors"
              >
                {entry.recipe.coverImageUrl && (
                  <img src={entry.recipe.coverImageUrl} alt="" className="w-full h-36 object-cover" />
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-stone-900 line-clamp-2">{entry.recipe.title}</h3>
                  {entry.recipe.description && (
                    <p className="mt-1 text-sm text-stone-500 line-clamp-2">{entry.recipe.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

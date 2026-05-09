# data/

Client-side data layer built on React Query. All client-side data fetching
is abstracted behind hooks in this directory so that components never call
`fetch` directly or import from `@tanstack/react-query`.

---

## Directory structure

```
data/
  shared/
    hooks.ts            ← only file in the codebase that imports from @tanstack/react-query
  queryKeys.ts          ← centralised query key factory
  pool/
    pool.ts / types.ts / index.ts
  recipes/
    recipes.ts / types.ts / index.ts
    [recipeId]/
      recipe.ts / types.ts / index.ts
      fork/
        fork.ts / types.ts / index.ts
      visibility/
        visibility.ts / types.ts / index.ts
  recipe-books/
    recipeBooks.ts / types.ts / index.ts
    [recipeBookId]/
      recipeBook.ts / types.ts / index.ts
      entries/
        entries.ts / types.ts / index.ts
        reorder/
          reorder.ts / types.ts / index.ts
        [entryId]/
          entry.ts / types.ts / index.ts
      members/
        [memberId]/
          member.ts / types.ts / index.ts
      invites/
        invites.ts / types.ts / index.ts
        accept/
          accept.ts / types.ts / index.ts
        decline/
          decline.ts / types.ts / index.ts
  profile/
    profile.ts / types.ts / index.ts
```

Each leaf directory contains exactly three files:
- `hookName.ts` — the hook file
- `types.ts` — all types for this resource
- `index.ts` — barrel that only re-exports the hook file (`export * from './hookName'`)

Types are **never** exported from `index.ts`. Import types directly from `types.ts`.

---

## Rules

### No direct @tanstack/react-query imports
Only `data/shared/hooks.ts` imports from `@tanstack/react-query`.
All hook files import `useApiQuery`, `useApiPost`, `useApiPatch`, `useApiPut`,
`useApiDelete`, and `useQueryClient` from `@/data/shared/hooks`.

### No direct fetch calls
All HTTP requests go through `lib/apiFetch.ts`, which is called only
by the hook factories in `data/shared/hooks.ts`.

### Type imports
Always import types directly from `types.ts`, never via the barrel:

```ts
// Correct
import type { Recipe } from '@/data/recipes/[recipeId]/types'

// Wrong — types are not exported from the barrel
import type { Recipe } from '@/data/recipes/[recipeId]'
```

### No Prisma types in components or hooks
Types in `types.ts` files mirror the shapes returned by the API routes.
Derive them from the Prisma schema and the actual route handler output,
but do not reference Prisma-generated types directly.

---

## Patterns

### GET with initialData (server → client handoff)

The standard pattern for list and detail pages: the server component
fetches via Prisma and passes the result as `initialData` so the page
renders instantly with no loading state.

**Server component:**
```tsx
// app/my/recipes/page.tsx
import { prisma } from '@/lib/prisma'
import type { Recipe } from '@/data/recipes/[recipeId]/types'
import RecipeList from './RecipeList'

export default async function RecipesPage({ searchParams }) {
  const recipes = await prisma.recipe.findMany({
    where: {
      authorId: session.user.id,
      title: searchParams.search
        ? { contains: searchParams.search, mode: 'insensitive' }
        : undefined,
    },
    orderBy: { [searchParams.sort ?? 'createdAt']: 'desc' },
  })

  return <RecipeList initialRecipes={recipes as Recipe[]} />
}
```

**Client component:**
```tsx
'use client'
import { useRecipe } from '@/data/recipes/[recipeId]'
import type { Recipe } from '@/data/recipes/[recipeId]/types'

export default function RecipeList({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const { data: recipe, isLoading, error } = useRecipe({
    recipeId,
    initialData: initialRecipes,
  })

  // isLoading is false on first render when initialData is provided
  if (isLoading) return <Loading />
  if (error) return <GenericError />
  // recipe is guaranteed defined here
}
```

### GET without initialData

```tsx
'use client'
import { useRecipe } from '@/data/recipes/[recipeId]'

const { data: recipe, isLoading, error } = useRecipe({ recipeId })
if (isLoading) return <Loading />
if (error) return <GenericError />
// recipe guaranteed defined here — no further null check needed
```

### Mutations

```tsx
'use client'
import { usePutRecipe } from '@/data/recipes/[recipeId]'
import { useState } from 'react'

const { mutate: updateRecipe, isPending } = usePutRecipe({ recipeId })
// isPending is true while the mutation is in flight

const [isSaving, setIsSaving] = useState(false)

const handleSave = async () => {
  setIsSaving(true)
  updateRecipe(payload, {
    onSuccess: () => { /* navigate or show toast */ },
    onError: () => { /* show error */ },
    onSettled: () => setIsSaving(false),
  })
}
```

### Context pattern (server-fetched data shared across multiple client components)

Only create a context where the data is genuinely used by more than one
client component on the page.

```tsx
// app/recipes/[id]/RecipeContext.tsx
'use client'

import { createContext, useContext } from 'react'
import type { Recipe } from '@/data/recipes/[recipeId]/types'

const RecipeContext = createContext<Recipe | null>(null)

export const RecipeProvider = ({
  recipe,
  children,
}: {
  recipe: Recipe
  children: React.ReactNode
}) => (
  <RecipeContext.Provider value={recipe}>
    {children}
  </RecipeContext.Provider>
)

export const useRecipeContext = () => {
  const ctx = useContext(RecipeContext)
  if (!ctx) throw new Error('useRecipeContext must be used within RecipeProvider')
  return ctx
}
```

In the server component page:
```tsx
import { RecipeProvider } from './RecipeContext'
import type { Recipe } from '@/data/recipes/[recipeId]/types'

export default async function RecipePage({ params }) {
  const raw = await prisma.recipe.findUnique({
    where: { id: params.recipeId },
    include: { ingredients: true, steps: true },
  })
  if (!raw) notFound()

  return (
    <RecipeProvider recipe={raw as Recipe}>
      {children}
    </RecipeProvider>
  )
}
```

In any child client component:
```tsx
const recipe = useRecipeContext()
// No loading or error state — server guaranteed the data exists
```

---

## Filtering, sorting, and URL state

All filter and sort state lives in the URL via `searchParams`.
**Never** use `useState` for filter or sort values.
**Never** pass filter or sort values to a React Query hook — filtering
and sorting always happen server-side.

**Client component updating the URL:**
```tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const router = useRouter()
const searchParams = useSearchParams()

const setSort = (sort: string) => {
  const params = new URLSearchParams(searchParams.toString())
  params.set('sort', sort)
  router.push(`?${params.toString()}`)
}
```

**Debounced search input:**
```tsx
const [inputValue, setInputValue] = useState(
  searchParams.get('search') ?? ''
)

useEffect(() => {
  const timer = setTimeout(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (inputValue) {
      params.set('search', inputValue)
    } else {
      params.delete('search')
    }
    router.push(`?${params.toString()}`)
  }, 300)

  return () => clearTimeout(timer)
}, [inputValue])
```

Always initialise local search input state from the current URL
`searchParam` so the input reflects the current filter on page load.

---

## Query key invalidation reference

| Action | Keys invalidated |
|--------|-----------------|
| Create recipe | `queryKeys.recipes.mine()` |
| Update recipe | `queryKeys.recipes.detail(id)`, `queryKeys.recipes.mine()` |
| Delete recipe | `queryKeys.recipes.all` |
| Toggle recipe visibility | `queryKeys.recipes.detail(id)`, `queryKeys.recipes.mine()`, `queryKeys.pool.all` |
| Fork recipe | `queryKeys.recipes.mine()`, `queryKeys.pool.all` |
| Create recipe book | `queryKeys.recipeBooks.mine()` |
| Update recipe book | `queryKeys.recipeBooks.detail(id)`, `queryKeys.recipeBooks.mine()` |
| Delete recipe book | `queryKeys.recipeBooks.all` |
| Add entry | `queryKeys.recipeBooks.detail(id)`, `queryKeys.recipeBooks.entries(id)` |
| Remove entry | `queryKeys.recipeBooks.detail(id)`, `queryKeys.recipeBooks.entries(id)` |
| Reorder entries | `queryKeys.recipeBooks.detail(id)`, `queryKeys.recipeBooks.entries(id)` |
| Remove member | `queryKeys.recipeBooks.detail(id)`, `queryKeys.recipeBooks.members(id)` |
| Send invite | `queryKeys.recipeBooks.invites(id)`, `queryKeys.recipeBooks.members(id)` |
| Accept invite | `queryKeys.recipeBooks.mine()`, `queryKeys.recipeBooks.pending()` |
| Decline invite | `queryKeys.recipeBooks.pending()`, `queryKeys.recipeBooks.mine()` |
| Update profile | `queryKeys.profile.mine()` |

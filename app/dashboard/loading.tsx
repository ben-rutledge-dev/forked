// Components
import { PageLayout } from '@/components/PageLayout';

const DashboardLoading = () => (
  <PageLayout>
    {/* Tonight spotlight skeleton */}
    <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50 animate-pulse h-72" />

    {/* Grocery card skeleton */}
    <div className="mb-10 rounded-xl border border-stone-200 bg-stone-50 animate-pulse h-48" />

    {/* Meal plan strip skeleton */}
    <div className="mb-3 h-4 bg-stone-100 rounded w-20 animate-pulse" />
    <div className="mb-10 flex gap-3 overflow-hidden">
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="flex-none w-44 rounded-xl bg-stone-100 animate-pulse h-32" />
      ))}
    </div>

    {/* Recipes skeleton */}
    <div className="mb-3 h-4 bg-stone-100 rounded w-24 animate-pulse" />
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex-none w-48 rounded-xl bg-stone-100 animate-pulse h-44" />
      ))}
    </div>
  </PageLayout>
);

export default DashboardLoading;

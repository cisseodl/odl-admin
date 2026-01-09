// app/admin/apprenant/page.tsx
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { ApprenantList } from "@/components/admin/apprenant-list"; // Will create this component soon

export default function ApprenantPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ApprenantList />
    </Suspense>
  );
}
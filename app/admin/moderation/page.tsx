// app/admin/moderation/page.tsx
import { ModerationList } from "@/components/admin/moderation/moderation-list";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/page-loader";

export default function ModerationPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ModerationList />
    </Suspense>
  );
}

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

function LoginFallback() {
  return (
    <div className="login-section">
      <div className="login-card glass-panel">
        <div className="login-header">
          <Skeleton className="mx-auto mb-2 h-6 w-56" />
          <Skeleton className="mx-auto h-4 w-72" />
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <Skeleton className="mb-2 h-4 w-28" />
            <Skeleton className="h-[46px] w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-[46px] w-full rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

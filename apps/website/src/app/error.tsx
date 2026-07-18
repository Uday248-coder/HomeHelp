"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[website:error]", error);
  }, [error]);

  return (
    <main id="main" className="container-page section-padding min-h-[70vh] flex items-center">
      <div className="mx-auto max-w-md text-center fade-in-up">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-pill bg-warm/10 text-warm">
          <AlertCircle className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="heading-lg mb-3">Something went wrong</h1>
        <p className="text-pretty text-foreground-secondary mb-8">
          The page hit an unexpected error. You can try again, or head back home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} variant="primary">Try again</Button>
          <LinkButton href="/" variant="secondary">Go home</LinkButton>
        </div>
      </div>
    </main>
  );
}

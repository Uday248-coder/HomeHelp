import { LinkButton } from "@/components/ui/Button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main id="main" className="container-page section-padding min-h-[80vh] flex items-center">
      <div className="mx-auto max-w-md text-center fade-in-up">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-pill bg-accent/10 text-accent">
          <Compass className="h-7 w-7" aria-hidden />
        </div>
        <p className="eyebrow mb-3 text-accent">404</p>
        <h1 className="heading-lg mb-3">We couldn&apos;t find that page</h1>
        <p className="text-pretty text-foreground-secondary mb-8">
          The page you were looking for moved, expired, or never existed. Let&apos;s get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3">
          <LinkButton href="/" variant="primary">Back home</LinkButton>
          <LinkButton href="/book" variant="secondary">Book a service</LinkButton>
        </div>
      </div>
    </main>
  );
}

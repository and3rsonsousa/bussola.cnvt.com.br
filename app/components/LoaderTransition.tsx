import { cn } from "~/lib/utils";

export default function LoaderTransition({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overlay bg-foreground text-background fixed right-0 bottom-0 left-0 z-50 grid origin-bottom place-content-center overflow-hidden",
        className,
      )}
    >
      <div className="border-background border px-8 py-6 text-xl font-medium tracking-wider">
        BÚSSOLA
      </div>
    </div>
  );
}

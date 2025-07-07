import { cn } from "~/lib/utils";

export default function LoaderTransition({
  className,
  id,
}: {
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id || "overlay"}
      className={cn(
        "bg-foreground text-background fixed inset-0 z-50 grid place-content-center overflow-hidden",
        className,
      )}
    >
      <div className="border border-current px-8 py-6 text-xl font-medium tracking-wider">
        BÚSSOLA
      </div>
    </div>
  );
}

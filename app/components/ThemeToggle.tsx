import clsx from "clsx";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "./ui/button";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { Theme, ThemeColor, useTheme } from "~/lib/theme-provider";
import { cn } from "~/lib/utils";

export const ThemeColorToggle = () => {
  const [, , themeColor, setThemeColor] = useTheme();

  return (
    <div className="flex justify-between gap-2 p-2">
      <button
        className={cn(
          `button-trigger ${themeColor === "lime" ? "bg-primary" : null}`,
        )}
        onClick={() => {
          setThemeColor(ThemeColor.LIME);
        }}
      >
        <div className="size-6 rounded border-2 border-popover bg-lime-300"></div>
      </button>
      <button
        className={cn(
          `button-trigger ${themeColor === "fuchsia" ? "bg-primary" : null}`,
        )}
        onClick={() => {
          setThemeColor(ThemeColor.FUCHSIA);
        }}
      >
        <div className="size-6 rounded border-2 border-popover bg-fuchsia-500"></div>
      </button>
      <button
        className={cn(
          `button-trigger ${themeColor === "indigo" ? "bg-primary" : null}`,
        )}
        onClick={() => {
          setThemeColor(ThemeColor.INDIGO);
        }}
      >
        <div className="size-6 rounded border-2 border-popover bg-indigo-600"></div>
      </button>
      <button
        className={cn(
          `button-trigger ${themeColor === "carmine" ? "bg-primary" : null}`,
        )}
        onClick={() => {
          setThemeColor(ThemeColor.CARMINE);
        }}
      >
        <div className="size-6 rounded border-2 border-popover bg-rose-600"></div>
      </button>
    </div>
  );
};

export const ThemeToggle = ({
  element = "button",
  className,
  iconClassName,
  hasText,
}: {
  element?: "button" | "dropdownmenuitem";
  className?: string;
  iconClassName?: string;
  hasText?: boolean;
}) => {
  // let Component = element === "button" ? Button : DropdownMenuItem;

  const [theme, setTheme] = useTheme();

  function resolveTheme() {
    setTheme((currentTheme) =>
      currentTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT,
    );
  }

  const Content =
    theme === "light" ? (
      <>
        <MoonIcon className={clsx("size-4 opacity-50", iconClassName)} />
        {hasText && <span>Modo escuro</span>}
      </>
    ) : (
      <>
        <SunIcon className={clsx("size-4 opacity-50", iconClassName)} />
        {hasText && <span>Modo claro</span>}
      </>
    );

  return element === "button" ? (
    <Button
      variant={"ghost"}
      className={clsx(className)}
      onClick={() => {
        resolveTheme();
      }}
    >
      {Content}
    </Button>
  ) : (
    <DropdownMenuItem
      className={clsx(className)}
      onSelect={() => {
        resolveTheme();
      }}
    >
      {Content}
    </DropdownMenuItem>
  );
};

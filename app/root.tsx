import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router";

import { Theme, ThemeColor } from "~/lib/theme-provider";

//@ts-ignore
import { useState } from "react";
import type { Route } from "./+types/root";

import stylesheet from "./app.css?url";
import { themeSessionResolver } from "./lib/session.server";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import clsx from "clsx";

export type LoaderData = {
  theme: Theme | null;
  themeColor: ThemeColor | null;
  env: {
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_UPLOAD_PRESET: string;
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);

  return {
    theme: getTheme(),

    env: {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_KEY: process.env.SUPABASE_KEY!,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
      CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET!,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    },
  };
}

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export function App({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="pt-br" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        ></meta>
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <link rel="icon" href="/favicon.ico" />

        <Meta />
        <Links />
      </head>
      <body className="selection:bg-foreground selection:text-background">
        {children}

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/set-theme">
      <App>{children}</App>
    </ThemeProvider>
  );
}

export default function AppWithProviders() {
  const [showFeed, setShowFeed] = useState(false);
  const [isTransitioning, setTransitioning] = useState(false);
  const [stateFilter, setStateFilter] = useState<State>();
  const data = useLoaderData<typeof loader>();

  return (
    <Outlet
      context={{
        showFeed,
        isTransitioning,
        stateFilter,
        setShowFeed,
        setTransitioning,
        setStateFilter,
      }}
    />
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

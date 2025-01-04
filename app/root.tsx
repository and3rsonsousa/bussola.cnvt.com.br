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

import {
	NonFlashOfWrongThemeEls,
	Theme,
	ThemeColor,
	ThemeProvider,
	useTheme,
} from "~/lib/theme-provider";

//@ts-ignore
import type { Route } from "./+types/root";
import { getThemeSession } from "./lib/theme.server";
import { useState } from "react";
import clsx from "clsx";

import stylesheet from "./app.css?url";

export type LoaderData = {
	theme: Theme | null;
	themeColor: ThemeColor | null;
	env: {
		SUPABASE_URL: string,
		SUPABASE_KEY: string,
		CLOUDINARY_CLOUD_NAME: string,
		CLOUDINARY_UPLOAD_PRESET: string,
	}
};

export async function loader({ request }: LoaderFunctionArgs) {
	const themeSession = await getThemeSession(request);

	return {
		theme: themeSession.getTheme(),
		themeColor: themeSession.getThemeColor(),
		env: {
			SUPABASE_URL: process.env.SUPABASE_URL!,
			SUPABASE_KEY: process.env.SUPABASE_KEY!,
			CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
			CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET!,
		},
	};
}

export const links: Route.LinksFunction = () => [
	{ rel: "stylesheet", href: stylesheet },
];

export function LayoutBase({ children }: { children: React.ReactNode }) {
	let [theme, , themeColor] = useTheme();

	const data = useLoaderData<typeof loader>();

	return (
		<html lang="pt-br" className={clsx(theme, themeColor)}>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<link rel="icon" href="/favicon.ico" />
				<Meta />
				<Links />
				<NonFlashOfWrongThemeEls ssrTheme={Boolean(data.theme)} />
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
		<ThemeProvider specifyedTheme={data.theme} specifyedThemeColor={data.themeColor}>
			<LayoutBase>{children}</LayoutBase>
		</ThemeProvider>
	);
}

export default function App() {
	const [showFeed, setShowFeed] = useState(false);
	const [isTransitioning, setTransitioning] = useState(false);
	const [stateFilter, setStateFilter] = useState<State>();
	const [categoryFilter, setCategoryFilter] = useState<Category[]>([]);

	return (
		<Outlet
			context={{
				showFeed,
				isTransitioning,
				stateFilter,
				categoryFilter,
				setShowFeed,
				setTransitioning,
				setStateFilter,
				setCategoryFilter,
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
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}

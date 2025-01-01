import type { ActionFunction } from "react-router";
import { data } from "react-router";

import { isTheme } from "~/lib/theme-provider";
import { getThemeSession } from "~/lib/theme.server";

export const config = { runtime: "edge" };

export const action: ActionFunction = async ({ request }) => {
	const themeSession = await getThemeSession(request);
	const requestText = await request.text();
	const form = new URLSearchParams(requestText);
	const theme = form.get("theme");

	if (!isTheme(theme)) {
		return {
			success: false,
			message: `theme value of ${theme} is not a valid theme`,
		};
	}

	themeSession.setTheme(theme);
	return data(
		{ success: true },
		{ headers: { "Set-Cookie": await themeSession.commit() } }
	);
};

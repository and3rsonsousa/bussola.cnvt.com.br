import type { ActionFunction } from "react-router";
import { data } from "react-router";

import { isTheme, isThemeColor } from "~/lib/theme-provider";
import { getThemeSession } from "~/lib/theme.server";

export const config = { runtime: "edge" };

export const action: ActionFunction = async ({ request }) => {
  const themeSession = await getThemeSession(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get("theme");
  const themeColor = form.get("theme-color");

  if (!isTheme(theme)) {
    return {
      success: false,
      message: `theme value of ${theme} is not a valid theme`,
    };
  }

  if (!isThemeColor(themeColor)) {
    return {
      success: false,
      message: `themeColor value of ${themeColor} is not a valid themeColor`,
    };
  }
  themeSession.setTheme(theme);
  themeSession.setThemeColor(themeColor);

  return data(
    { success: true },
    { headers: { "Set-Cookie": await themeSession.commit() } },
  );
};

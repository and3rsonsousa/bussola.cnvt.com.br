import { createThemeAction } from "remix-themes";
import { themeSessionResolver } from "~/lib/session.server";

export const config = { runtime: "edge" };

export const action = createThemeAction(themeSessionResolver);

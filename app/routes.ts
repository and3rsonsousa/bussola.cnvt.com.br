import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("dashboard", "routes/dashboard.tsx", [
		index("./routes/dashboard.home.tsx"),
		route(":partner", "routes/dashboard.partner.tsx"),
		route("action/:id", "routes/dashboard.action.id.tsx"),
		route("me", "routes/dashboard.me.tsx"),
	]),
	route("login", "routes/login.tsx"),
	route("logout", "routes/logout.tsx"),

	route("handle-openai", "routes/handle-openai.tsx"),
	route("handle-actions", "routes/handle-actions.tsx"),

	route("ui", "routes/ui.tsx"),
	route("set-theme", "routes/set-theme.tsx"),
	route("report/:partner", "routes/report.partner.tsx"),
] satisfies RouteConfig;

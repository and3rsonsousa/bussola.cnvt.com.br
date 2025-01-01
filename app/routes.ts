import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("dashboard", "routes/dashboard.tsx", [
		index("./routes/dashboard._index.tsx"),
	]),
	route("login", "routes/login.tsx"),
	route("logout", "routes/logout.tsx"),
	route("ui", "routes/ui.tsx"),
	route("report/:slug", "routes/report.$slug.tsx"),
] satisfies RouteConfig;

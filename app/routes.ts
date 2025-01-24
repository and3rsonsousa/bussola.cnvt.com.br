import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dashboard", "routes/dashboard.tsx", [
    index("./routes/dashboard.home.tsx"),
    route(":partner", "routes/dashboard.partner.tsx"),
    route(":partner/late", "routes/dashboard.partner.late.tsx"),
    route(":partner/archived", "routes/dashboard.partner.archived.tsx"),
    route("action/:id", "routes/dashboard.action.id.tsx"),

    route("admin/users", "routes/dashboard.admin.users.tsx"),
    route("admin/user/:id/actions", "routes/dashboard.admin.user.actions.tsx"),
    route("admin/user/:id", "routes/dashboard.admin.user.tsx"),

    route("admin/partners", "routes/dashboard.admin.partners.tsx"),
    route("admin/partner/:id", "routes/dashboard.admin.partner.id.tsx"),
    route("admin/partner/new", "routes/dashboard.admin.partner.new.tsx"),

    route("me", "routes/dashboard.me.tsx"),
    route("help", "routes/dashboard.help.tsx"),
  ]),

  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),

  route("handle-openai", "routes/handle-openai.tsx"),
  route("handle-actions", "routes/handle-actions.tsx"),

  route("ui", "routes/ui.tsx"),
  route("set-theme", "routes/set-theme.tsx"),
  route("report/:partner", "routes/report.partner.tsx"),

  route(
    "/object-sans/subset-PPObjectSans-Bold.woff",
    "/public/object-sans/subset-PPObjectSans-Bold.woff",
  ),
] satisfies RouteConfig;

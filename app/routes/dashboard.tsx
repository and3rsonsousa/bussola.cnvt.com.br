import {
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  useOutletContext,
} from "react-router";
import Layout from "~/components/Layout";
import { createClient } from "~/lib/supabase";

export const config = { runtime: "edge" };

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const [
    { data: partners },
    { data: people },
    { data: categories },
    { data: states },
    { data: priorities },
    { data: areas },
    { data: sprints },
    { data: celebrations },
  ] = await Promise.all([
    supabase
      .from("partners")
      .select("*")
      .is("archived", false)
      .contains("users_ids", [user.id])
      .order("title", { ascending: true }),
    supabase.from("people").select("*").order("name", { ascending: true }),
    supabase.from("categories").select("*").order("order", { ascending: true }),
    supabase.from("states").select("*").order("order", { ascending: true }),
    supabase.from("priorities").select("*").order("order", { ascending: true }),
    supabase.from("areas").select("*").order("order", { ascending: true }),
    supabase.from("sprints").select("*").match({ "user_id": user.id }),
    supabase.from("celebrations").select("*"),
  ]);

  const person = people?.find((person) => person.user_id === user.id) as Person;
  const url = new URL(request.url);

  return {
    url,
    partners,
    people,
    categories,
    user,
    states,
    priorities,
    person,
    areas,
    sprints,
    celebrations,
  } as DashboardRootType;
}

export default function Dashboard() {
  const {
    setShowFeed,
    showFeed,
    isTransitioning,
    setTransitioning,
    stateFilter,
    setStateFilter,
  } = useOutletContext() as ContextType;

  return (
    <Layout>
      <Outlet
        context={{
          setShowFeed,
          showFeed,
          isTransitioning,
          setTransitioning,
          stateFilter,
          setStateFilter,
        }}
      />
    </Layout>
  );
}

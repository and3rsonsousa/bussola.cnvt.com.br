import { type LoaderFunctionArgs, redirect } from "react-router";
import { createClient } from "~/lib/supabase";

export const config = { runtime: "edge" };

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const { supabase, headers } = createClient(request);

	await supabase.auth.signOut();

	return redirect("/", { headers });
};

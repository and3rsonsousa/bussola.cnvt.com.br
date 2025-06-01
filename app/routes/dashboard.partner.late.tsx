import { format } from "date-fns";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useLoaderData,
} from "react-router";
import invariant from "tiny-invariant";
import { ListOfActions } from "~/components/Action";
import { Heading } from "~/components/Headings";
import { createClient } from "~/lib/supabase";

export const config = { runtime: "edge" };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);

  const partner_slug = params["partner"];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const [{ data: people }, { data: partners }] = await Promise.all([
    supabase
      .from("people")
      .select("*")
      .match({ user_id: user.id })
      .returns<Person[]>(),
    supabase
      .from("partners")
      .select("slug")
      .match({ slug: partner_slug })
      .match({ archived: false })
      .returns<Partner[]>(),
  ]);

  const person = people?.[0];

  invariant(person);
  invariant(partners);

  const [{ data: actions }, { data: actionsChart }, { data: partner }] =
    await Promise.all([
      supabase
        .from("actions")
        .select("*")
        .is("archived", false)
        .contains("responsibles", person?.admin ? [] : [user.id])
        .containedBy("partners", partners.map((p) => p.slug)!)
        .neq("state", "finished")
        .lte("date", format(new Date(), "yyyy-MM-dd HH:mm:ss"))
        .returns<Action[]>(),

      supabase
        .from("actions")
        .select("state, date")
        .is("archived", false)
        .contains("responsibles", person?.admin ? [] : [user.id])
        .neq("state", "finished")
        .lte("date", format(new Date(), "yyyy-MM-dd HH:mm:ss"))
        .returns<{ state: string; date: string }[]>(),
      supabase.from("partners").select().eq("slug", partner_slug!).single(),
    ]);

  return { actions, actionsChart, partner };
};

export const meta: MetaFunction = () => {
  return [
    { title: "ʙússoʟa - Domine, Crie e Conquiste." },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export default function LatePage() {
  const { actions } = useLoaderData<typeof loader>();
  return (
    <div className="px-4 py-8 md:px-8">
      <Heading>Ações em atraso</Heading>
      <div className="mx-auto pb-32">
        <ListOfActions
          actions={actions}
          date={{ dateFormat: 4, timeFormat: 1 }}
          long
          orderBy="time"
          showCategory
        />
      </div>
    </div>
  );
}

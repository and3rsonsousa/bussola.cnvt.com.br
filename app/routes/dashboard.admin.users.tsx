import { Link, useLoaderData, type MetaFunction } from "react-router";
import { type LoaderFunctionArgs } from "react-router";
import { Edit3Icon, ListIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Avatar } from "~/lib/helpers";
import { createClient } from "~/lib/supabase";
import { Heading } from "~/components/Headings";

export const config = { runtime: "edge" };

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const { supabase } = await createClient(request);

	const { data: people } = await supabase
		.from("people")
		.select("*")
		.order("name", { ascending: true });

	return { people };
};

export const meta: MetaFunction = () => {
	return [
		{ title: "ʙússoʟa - Domine, Crie e Conquiste." },
		{
			name: "description",
			content:
				"Aplicativo de Gestão de Projetos Criado e Mantido pela Agência Canivete. ",
		},
	];
};

export default function AdminPartners() {
	const { people } = useLoaderData<typeof loader>();
	return (
		<div className="py-8 w-full lg:py-24 bg-background min-h-screen">
			<div className="pb-8 px-2 md:px-8 text-center">
				<Heading>Usuários</Heading>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
					{people?.map((person: Person) => (
						<div
							className="flex flex-col gap-1 p-4 bg-card rounded-2xl"
							key={person.id}
						>
							<div className="flex items-center gap-4">
								<Avatar
									item={{
										image: person.image,
										short: person.initials!,
									}}
									size="lg"
								/>
								<div className="text-2xl font-medium tracking-tighter">
									{`${person.name} ${person.surname}`}
								</div>
							</div>

							<div className="flex gap-2 justify-end">
								<Button asChild size={"sm"} variant={"ghost"}>
									<Link
										className="items-center gap-2"
										to={`/dashboard/admin/user/${person.user_id}/actions`}
									>
										Ver Ações
										<ListIcon className="size-4" />
									</Link>
								</Button>
								<Button asChild size={"sm"} variant={"ghost"}>
									<Link
										className="items-center gap-2"
										to={`/dashboard/admin/user/${person.user_id}`}
									>
										Editar
										<Edit3Icon className="size-4" />
									</Link>
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

import { Link } from "react-router";
import { FlickeringGrid } from "~/components/Backgrounds";
import Button from "~/components/Button";
import { Bussola } from "~/lib/helpers";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export function loader({ context }: Route.LoaderArgs) {
	return { message: context.VALUE_FROM_VERCEL };
}

export default function Home() {
	return (
		<div className="relative grid h-dvh w-full place-content-center overflow-hidden bg-black">
			<FlickeringGrid
				className="absolute top-1/2 left-1/2 z-0 size-full -translate-x-1/2 -translate-y-1/2 scale-110"
				squareSize={124}
				gridGap={2}
				color="#333"
				maxOpacity={0.5}
				flickerChance={1}
			/>

			<div className="z-10 flex flex-col items-center p-8 text-center text-white lg:px-24">
				<Bussola size="md" className="text-white" />
				<div className="mt-8 text-xl font-bold">
					Sistema de Gestão de <br /> Processos da Agência CNVT®
				</div>
				<div className="mt-8 text-center">
					<Button
						asChild
						className="ring-offset-black ring-primary focus:ring-2"
					>
						<Link to={"/dashboard"} prefetch="intent">
							Entrar
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

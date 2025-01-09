import { Link, type MetaFunction } from "react-router";
import { FlickeringGrid } from "~/components/Backgrounds";
import Button from "~/components/Button";
import { Bussola } from "~/lib/helpers";
import type { Route } from "./+types/home";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `ʙússoʟa` },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};
export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_VERCEL };
}

export default function Home() {
  return (
    <div className="relative grid h-dvh w-full place-content-center overflow-hidden bg-black">
      <FlickeringGrid
        className="absolute top-1/2 left-1/2 z-0 size-full -translate-x-1/2 -translate-y-1/2 scale-110"
        squareSize={2}
        gridGap={24}
        color="#fff"
        maxOpacity={1}
        flickerChance={0.1}
      />

      <div className="relative z-10 flex flex-col items-center border border-white p-8 text-center text-white lg:p-16 lg:px-24">
        {Array(4)
          .fill(0)
          .map((i, j) => (
            <div
              key={j}
              className={`absolute size-4 border-2 border-white bg-black ${j < 2 ? "-top-2" : "-bottom-2"} ${j % 2 ? "-right-2" : "-left-2"}`}
            ></div>
          ))}
        <Bussola size="md" className="text-white" />
        <div className="mt-8 text-xl font-bold">
          Sistema de Gestão de <br /> Processos da Agência CNVT®
        </div>
        <div className="mt-8 text-center">
          <Button
            asChild
            className="ring-primary ring-offset-black focus:ring-2"
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

import { Link, type MetaFunction } from "react-router";
import { FlickeringGrid } from "~/components/Backgrounds";
import { Bussola } from "~/lib/helpers";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

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
    <div className="relative container mx-auto flex h-dvh flex-col justify-between p-8">
      <div className="text-xl font-medium tracking-tighter">
        Escolha qual app quer acessar
      </div>
      <div className="*:hover:bg-foreground *:hover:text-background flex flex-col divide-y text-[12vw] font-light tracking-tighter *:flex *:items-center *:py-6 *:pr-16 *:hover:justify-between md:text-[10vh]">
        <a className="group" href="/dashboard">
          <span className="ml-8 hidden items-center gap-4 group-hover:flex">
            <ArrowRightIcon className="size-16" />
            <span className="text-xl font-medium tracking-normal">
              App de gestão da <br /> Agência CNVT®
            </span>
          </span>
          BÚSSOLA
        </a>
        <a
          className="group"
          href="https://cnvt.link"
          target="_blank"
          rel="noreferrer"
        >
          <span className="ml-8 hidden items-center gap-4 group-hover:flex">
            <ArrowRightIcon className="size-16" />
            <span className="text-xl font-medium tracking-normal">
              Sistema de Links exclusivo <br /> de quem é parceiro da <br />
              Agência CNVT®
            </span>
          </span>
          CNVT.LINK
        </a>
        <a
          className="group"
          href="https://cnvt.com.br"
          target="_blank"
          rel="noreferrer"
        >
          <span className="ml-8 hidden items-center gap-4 group-hover:flex">
            <ArrowRightIcon className="size-16" />
            <span className="text-xl font-medium tracking-normal">
              Site oficial da <br /> Agência CNVT®
            </span>
          </span>
          CNVT
        </a>
      </div>
      <div className="text-right font-medium">CNVT®</div>
    </div>
  );
}

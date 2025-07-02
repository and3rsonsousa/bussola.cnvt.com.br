import { useGSAP } from "@gsap/react";
import { ArrowRightIcon } from "lucide-react";
import { Link, type MetaFunction } from "react-router";
import type { Route } from "./+types/home";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

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
  function mouseOver(element: HTMLElement, reversed = false) {
    if (reversed) {
      gsap.to(element.querySelector(".home-link__info"), {
        x: -100,
        opacity: 0,
      });
      gsap.to(element.querySelector(".home-link__name"), {
        right: "auto",
      });
      return;
    }
    gsap.to(element.querySelector(".home-link__info"), {
      x: 40,
      opacity: 1,
    });
    gsap.to(element.querySelector(".home-link__name"), {
      right: 0,
    });
  }

  return (
    <div className="relative container mx-auto flex h-dvh flex-col justify-between overflow-hidden p-8">
      <div className="text-xl font-medium tracking-tighter">
        Escolha qual app quer acessar
      </div>
      {/* <div className="*:hover:bg-foreground *:hover:text-background flex flex-col divide-y text-[12vw] font-light tracking-tighter *:flex *:items-center *:py-6 *:pr-16 *:hover:justify-between md:text-[10vh]"> */}
      <div className="flex flex-col divide-y text-[12vw] font-light tracking-tighter *:flex *:items-center *:py-6 md:text-[10vh]">
        {[
          {
            title: "BÚSSOLA",
            description: "App de gestão da Agência CNVT®",
            href: "/dashboard",
          },
          {
            title: "CNVT.LINK",
            description:
              "Sistema de Links exclusivo de quem é parceiro da Agência CNVT®",
            href: "https://cnvt.link",
          },
          {
            title: "CNVT",
            description: "Site oficial da Agência CNVT®",
            href: "https://cnvt.com.br",
          },
        ].map((item, i) => (
          <Link
            key={i}
            className="home-link hover:bg-foreground hover:text-background relative flex h-[20vh] items-center justify-between transition md:h-[20vh]"
            to={item.href}
            onMouseEnter={(e) => mouseOver(e.currentTarget)}
            onMouseLeave={(e) => mouseOver(e.currentTarget, true)}
          >
            <span className="home-link__info flex -translate-x-[100px] items-center gap-4 opacity-0">
              <ArrowRightIcon className="size-16" />
              <span className="hidden w-1/2 text-xl font-medium tracking-normal md:block">
                {item.title}
                <br />
                {item.description}
              </span>
            </span>
            <span className="home-link__name absolute pr-16">{item.title}</span>
          </Link>
        ))}
        {/* <a className="home-link" href="/dashboard">
          <span className="ml-8 flex items-center gap-4">
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
        </a> */}
      </div>
      <div className="text-right font-medium">CNVT®</div>
    </div>
  );
}

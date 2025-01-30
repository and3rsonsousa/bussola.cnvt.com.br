/* eslint-disable jsx-a11y/no-autofocus */
import {
  Form,
  Link,
  redirect,
  useFetcher,
  useLoaderData,
  useMatches,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
// @ts-ignore
import Color from "color";
import { InfoIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import { Textarea } from "~/components/ui/textarea";
import { archetypes } from "~/lib/constants";
import { Avatar } from "~/lib/helpers";
import { createClient } from "~/lib/supabase";

export const config = { runtime: "edge" };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = await createClient(request);

  const slug = params["id"];

  invariant(slug);

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .match({ slug })
    .single();

  if (!partner) throw redirect("/dashboard/admin/partners");

  return { partner };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.partner?.title.concat(" - aᴅᴍɪɴ - ʙússoʟa") },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = createClient(request);

  const formData = await request.formData();

  const id = String(formData.get("id"));

  const entries = Object.fromEntries(formData);

  let voice = Object.keys(entries)
    .map((entry) => (/voice\d*/.test(entry) ? Number(entries[entry]) : null))
    .filter((n) => n !== null);

  const data = {
    title: String(formData.get("title")),
    short: String(formData.get("short")),
    slug: String(formData.get("slug")),
    colors: String(formData.getAll("colors")).split(","),
    context: String(formData.get("context")),
    sow: formData.get("sow") as "marketing" | "socialmedia" | "demand",
    users_ids: String(formData.getAll("users_ids")).split(","),
    voice,
  };

  const { error } = await supabase.from("partners").update(data).eq("id", id);

  if (error) {
    console.log(error);
  } else {
    return redirect(`/dashboard/admin/partners`);
  }

  return { ok: true };
};

export default function AdminPartners() {
  const matches = useMatches();

  const { partner } = useLoaderData<typeof loader>();
  const { people, voices } = matches[1].data as DashboardRootType;

  const [colors, setColors] = useState(partner.colors);
  const [vx, setVX] = useState(
    partner.voice || [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  );

  const [text, setText] = useState("");

  const fetcher = useFetcher();

  useEffect(() => {
    setText("Atualizando...");
    fetcher.submit(
      {
        title: "Apresente a empresa ou profissional.",
        context: `EMPRESA: ${partner.title} - DESCRIÇÃO: ${partner.context}`,
        intent: "caption",
        model: "medium",
        trigger: "Novidade",
        voice: vx,
      },
      {
        action: "/handle-openai",
        method: "post",
      },
    );
  }, [vx]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.formData?.get("intent") === "caption") {
        setText((fetcher.data as { message: string }).message);
      }
    }
  }, [fetcher.data]);

  return (
    <div className="scrollbars-v px-4 md:px-8 lg:px-8">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div
          className="flex items-center gap-2 py-4 font-bold tracking-tighter"
          key={partner.slug}
        >
          <Avatar
            item={{
              short: partner.short,
              bg: partner.colors[0],
              fg: partner.colors[1],
            }}
            size="lg"
          />
          <Link to={`/dashboard/${partner.slug}`} className="text-2xl">
            {partner.title}
          </Link>
        </div>

        <Form className="mx-auto" method="post">
          <input type="hidden" value={partner.id} name="id" />
          <div className="mb-4">
            <Label className="mb-2 block">Nome</Label>
            <Input
              defaultValue={partner.title}
              name="title"
              type="text"
              tabIndex={0}
              autoFocus
            />
          </div>
          <div className="gap-2 md:flex">
            <div className="mb-4 w-full">
              <Label className="mb-2 block">Slug</Label>
              <Input defaultValue={partner.slug} name="slug" />
            </div>
            <div className="mb-4 w-full">
              <Label className="mb-2 block">Short</Label>
              <Input defaultValue={partner.short} name="short" />
            </div>
          </div>
          <div className="mb-4">
            <Label className="mb-2 block">Contexto</Label>
            <Textarea
              name="context"
              defaultValue={partner.context || ""}
              // @ts-ignore
              style={{ fieldSizing: "content" }}
            />
          </div>
          <div className="mb-8">
            <Label className="mb-2 block">Serviço Contratado</Label>
            <RadioGroup name="sow" defaultValue={partner.sow.toString()}>
              {[
                {
                  value: "marketing",
                  title: "Consultoria de Marketing 360",
                },
                {
                  value: "socialmedia",
                  title: "Gestão de Redes Sociais",
                },
                {
                  value: "demand",
                  title: "Serviços avulsos",
                },
              ].map((p) => (
                <div className="flex items-center gap-2" key={p.value}>
                  <RadioGroupItem value={p.value} id={`radio_${p.value}`} />
                  <Label htmlFor={`radio_${p.value}`}>{p.title}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="mb-4">
            <Label className="mb-2 block">Usuários</Label>
            <div className="flex items-center gap-4">
              {people.map((person) => (
                <label
                  key={person.id}
                  className={`relative mb-2 flex items-center`}
                >
                  <input
                    type="checkbox"
                    value={person.user_id}
                    name="users_ids"
                    className={`peer absolute opacity-0`}
                    defaultChecked={
                      partner.users_ids?.find(
                        (user_id) => person.user_id === user_id,
                      )
                        ? true
                        : false
                    }
                  />
                  <div
                    className={`ring-ring ring-offset-background rounded-full ring-offset-2 peer-checked:ring-2`}
                  >
                    <Avatar
                      item={{
                        image: person.image,
                        short: person.initials!,
                      }}
                      size="lg"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="gap-2 md:flex">
            <div className="mb-4 w-full">
              <Label className="mb-2 block">Cores</Label>
              <div className="flex flex-wrap gap-4">
                {colors.map((color, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      className="h-16 w-20"
                      defaultValue={color}
                      name="colors"
                      type="color"
                    />
                    <Button
                      onClick={(event) => {
                        event.preventDefault();
                        setColors(colors.filter((c) => c !== color));
                      }}
                      variant={"ghost"}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant={"secondary"}
                  onClick={(event) => {
                    event.preventDefault();
                    setColors([
                      ...colors,
                      Color(colors[0])
                        .rotate(Math.random() * 220 + 30)
                        .hex(),
                    ]);
                  }}
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>
          <div id="voices">
            <div className="flex items-center justify-between">
              <div className="font-bold">Tom de voz</div>
            </div>
            <div>
              {voices.map((voice, i) => (
                <Voice
                  onChange={(value) => {
                    let _temp = [...vx];
                    _temp[i] = value[0];
                    setVX(_temp);
                  }}
                  key={voice.id}
                  voice={voice}
                  defaultValue={vx[i]}
                />
              ))}
            </div>
          </div>
          <div className="mb-8 border-t border-b py-8">
            <h2 className="mb-4 text-3xl font-medium tracking-tighter">
              Exemplo de texto
            </h2>
            <div
              className="text-xl leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: text === "" ? "Carregando..." : text,
              }}
            ></div>
          </div>

          <div className="pb-8 text-right">
            <Button type="submit">Atualizar</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

function Voice({
  voice,
  defaultValue,
  onChange,
}: {
  voice: Voice;
  defaultValue: number;
  onChange: (value: number[]) => void;
}) {
  const examples = [voice.n3, voice.n2, voice.n1, voice.p1, voice.p2, voice.p3];

  const [value, setValue] = useState([defaultValue]);
  const [viewDescription, setViewDescription] = useState(false);
  const [alert, setAlert] = useState(0);

  useEffect(() => {
    setValue([defaultValue]);
  }, [defaultValue]);

  useEffect(() => {
    if (viewDescription) {
      setTimeout(() => {
        setViewDescription(false);
        setAlert(0);
      }, 15000);
      setTimeout(() => {
        setAlert(1);
      }, 9000);
      setTimeout(() => {
        setAlert(2);
      }, 12000);
    }
  }, [viewDescription]);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-semibold">{voice.name}</h4>
          <button
            className="opacity-50 hover:opacity-100"
            onClick={(event) => {
              event.preventDefault();
              setViewDescription((v) => !v);
            }}
          >
            <InfoIcon className="size-4" />
          </button>
          {viewDescription && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className="-rotate-90"
            >
              <circle
                className={`timer-circle transition-colors duration-500 ${
                  alert === 1
                    ? "stroke-amber-500"
                    : alert === 2
                      ? "stroke-rose-500"
                      : "stroke-secondary"
                }`}
                cx="8"
                cy="8"
                r="7"
                fill="none"
                stroke-width="2"
              />
            </svg>
          )}
        </div>
        <div className="text-sm opacity-50">{voice.priority}/15</div>
      </div>

      {viewDescription && (
        <div className="bg-card my-4 rounded p-4">{voice.description}</div>
      )}
      <div className="flex justify-between py-2 text-center text-sm">
        {[-3, -2, -1, 1, 2, 3].map((value) => (
          <div key={value}>{value}</div>
        ))}
      </div>

      <div>
        <Slider
          className="text-rose-500"
          onValueChange={(value) => {
            setValue(value);
            onChange(value);
          }}
          value={value}
          max={5}
          min={0}
          step={1}
          name={`voice${voice.priority}`}
        />
      </div>
      {/* <div>
        {value} - {defaultValue}
      </div> */}
      <div className="mt-4 rounded py-4 text-2xl">{examples[value[0]]}</div>
    </div>
  );
}

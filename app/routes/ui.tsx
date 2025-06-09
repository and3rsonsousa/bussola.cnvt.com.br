import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import Loader from "~/components/Loader";
import { ThemeToggle } from "~/components/ThemeToggle";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarGroup, Icons } from "~/lib/helpers";
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
  ] = await Promise.all([
    supabase
      .from("partners")
      .select("*")
      .contains("users_ids", [user.id])
      .order("title", { ascending: true }),
    supabase
      .from("people")
      .select("*")
      .match({ visible: true })
      .order("name", { ascending: true }),
    supabase.from("categories").select("*").order("order", { ascending: true }),
    supabase.from("states").select("*").order("order", { ascending: true }),
    supabase.from("priorities").select("*").order("order", { ascending: true }),
  ]);

  const person = people?.find((person) => person.user_id === user.id) as Person;

  return {
    partners,
    people,
    categories,
    user,
    states,
    priorities,
    person,
  } as DashboardRootType;
}

export default function UI() {
  const { categories, states } = useLoaderData<typeof loader>();
  // const faker = new Faker({ locale: pt_BR });

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex justify-between">
        <h1 className="text-5xl font-bold">UI</h1>

        <ThemeToggle iconClassName="size-6" />
      </div>
      <div className="h-2 overflow-hidden rounded-sm">
        <div className="flex w-[110%] -translate-y-8 blur-xl">
          {states.map((state) => (
            <div
              key={state.id}
              className={`h-20 grow -translate-x-8`}
              style={{ backgroundColor: state.color }}
            ></div>
          ))}
        </div>
      </div>
      {/* <div className="flex gap-4 text-white">
        {states.map((item, i) => (
          <div
            className={`flex items-center rounded-sm border border-white/20 p-4 text-sm leading-none tracking-tight`}
            key={i}
            style={{ backgroundColor: item.color }}
          >
            {faker.lorem.sentence(Math.max(3, Math.ceil(Math.random() * 5)))}
          </div>
        ))}
      </div> */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="mb-4 text-3xl font-bold">Loaders</h1>
          <div className="flex justify-between">
            <div>
              <Loader size="sm" />
            </div>
            <div>
              <Loader size="md" />
            </div>
            <div>
              <Loader size="lg" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="mb-4 text-3xl font-bold">Focus Ring</h1>
          <Button>Focus Ring on use</Button>
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold">Buttons</h1>
      </div>
      <div className="flex gap-4 *:w-full">
        <Button variant={"default"}>Default</Button>
        <Button variant={"secondary"}>Secondary</Button>
        <Button variant={"destructive"}>Destructive</Button>
        <Button variant={"ghost"}>Ghost</Button>
        <Button variant={"link"}>Link</Button>
        <Button variant={"outline"}>Outline</Button>
      </div>
      <div>
        <h1 className="text-3xl font-bold">Cores</h1>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-background text-foreground grid place-content-center rounded-lg border p-4">
            <div>.bg-background</div>
            <div>.text-foreground</div>
          </div>
          <div className="bg-card text-card-foreground grid place-content-center rounded-lg border p-4">
            <div>.bg-card</div>
            <div>.text-card-foreground</div>
          </div>
          <div className="bg-popover text-popover-foreground grid place-content-center rounded-lg border p-4">
            <div>.bg-popover</div>
            <div>.text-popover-foreground</div>
          </div>
          <div className="bg-primary text-primary-foreground grid place-content-center rounded-lg p-4">
            <div>.bg-primary</div>
            <div>.text-primary-foreground</div>
          </div>
          <div className="bg-secondary text-secondary-foreground grid place-content-center rounded-lg p-4">
            <div>.bg-secondary</div>
            <div>.text-secondary-foreground</div>
          </div>
          <div className="bg-muted text-muted-foreground grid place-content-center rounded-lg p-4">
            <div>.bg-muted</div>
            <div>.text-muted-foreground</div>
          </div>
          <div className="bg-accent text-accent-foreground grid place-content-center rounded-lg p-4">
            <div>.bg-accent</div>
            <div>.text-accent-foreground</div>
          </div>
          <div className="bg-destructive text-destructive-foreground grid place-content-center rounded-lg p-4">
            <div>.bg-destructive</div>
            <div>.text-destructive-foreground</div>
          </div>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {["upperCase", "lowerCase"].map((c) => {
          return (
            <div key={c}>
              <h1 className="text-3xl font-bold">Avatar {c}</h1>
              <h2 className="mt-4 mb-2 text-xl">Size: xs</h2>
              <div className="flex gap-2">
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "cnvt" }}
                  size="xs"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "brenda" }}
                  size="xs"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "arc" }}
                  size="xs"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "smart" }}
                  size="xs"
                />
                <AvatarGroup
                  isLowerCase={c === "lowerCase"}
                  avatars={[
                    { item: { title: "cnvt", short: "cnvt" } },
                    { item: { title: "brenda", short: "brenda" } },
                    { item: { title: "arc", short: "arc" } },
                    { item: { title: "smart", short: "smart" } },
                  ]}
                  size="xs"
                />
              </div>

              <h2 className="mt-4 mb-2 text-xl">Size: sm</h2>
              <div className="flex gap-2">
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "cnvt" }}
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "brenda" }}
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "arc" }}
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "smart" }}
                />
                <AvatarGroup
                  isLowerCase={c === "lowerCase"}
                  avatars={[
                    { item: { title: "cnvt", short: "cnvt" } },
                    { item: { title: "brenda", short: "brenda" } },
                    { item: { title: "arc", short: "arc" } },
                    { item: { title: "smart", short: "smart" } },
                  ]}
                />
              </div>

              <h2 className="mt-4 mb-2 text-xl">Size: md</h2>
              <div className="flex gap-2">
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "cnvt" }}
                  size="md"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "brenda" }}
                  size="md"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "arc" }}
                  size="md"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "smart" }}
                  size="md"
                />
                <AvatarGroup
                  isLowerCase={c === "lowerCase"}
                  avatars={[
                    { item: { title: "cnvt", short: "cnvt" } },
                    { item: { title: "brenda", short: "brenda" } },
                    { item: { title: "arc", short: "arc" } },
                    { item: { title: "smart", short: "smart" } },
                  ]}
                  size="md"
                />
              </div>

              <h2 className="mt-4 mb-2 text-xl">Size: lg</h2>
              <div className="flex gap-2">
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "cnvt" }}
                  size="lg"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "brenda" }}
                  size="lg"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "arc" }}
                  size="lg"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "smart" }}
                  size="lg"
                />

                <AvatarGroup
                  isLowerCase={c === "lowerCase"}
                  avatars={[
                    { item: { title: "cnvt", short: "cnvt" } },
                    { item: { title: "brenda", short: "brenda" } },
                    { item: { title: "arc", short: "arc" } },
                    { item: { title: "smart", short: "smart" } },
                  ]}
                  size="lg"
                />
              </div>

              <h2 className="mt-4 mb-2 text-xl">Size: xl</h2>
              <div className="flex gap-2">
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "cnvt" }}
                  size="xl"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "brenda" }}
                  size="xl"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "arc" }}
                  size="xl"
                />
                <Avatar
                  isLowerCase={c === "lowerCase"}
                  item={{ short: "smart" }}
                  size="xl"
                />

                <AvatarGroup
                  isLowerCase={c === "lowerCase"}
                  avatars={[
                    { item: { title: "cnvt", short: "cnvt" } },
                    { item: { title: "brenda", short: "brenda" } },
                    { item: { title: "arc", short: "arc" } },
                    { item: { title: "smart", short: "smart" } },
                  ]}
                  size="xl"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h1 className="text-3xl font-bold">Categorias</h1>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.slug}
              className="font-regular flex items-center gap-2 text-lg"
            >
              <Icons className="size-4 opacity-50" id={category.slug} />
              <div>{category.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

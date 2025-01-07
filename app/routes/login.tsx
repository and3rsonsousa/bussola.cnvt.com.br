import { useActionData } from "react-router";
import {
  type MetaFunction,
  redirect,
  type ActionFunctionArgs,
} from "react-router";
import { AlertCircleIcon, LogInIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Bussola } from "~/lib/helpers";
import { createClient } from "~/lib/supabase";

export const config = { runtime: "edge" };

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { supabase, headers } = await createClient(request);

  const {
    data: { user },
  } = await supabase.auth.signInWithPassword({ email, password });

  if (user) {
    return redirect("/dashboard", { headers });
  } else {
    return { errors: { email: "Verifique o email ou a senha usada." } };
  }
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

export default function Login() {
  const actionData = useActionData<typeof action>();
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-black text-white md:justify-end">
      <div className="w-full p-8 md:w-96">
        <div className="mb-8 flex">
          <Bussola />
        </div>
        {actionData && (
          <div className="my-8 flex items-center gap-4 rounded-lg bg-rose-600 p-4 leading-none text-rose-50">
            <AlertCircleIcon className="size-10" />
            <div>{actionData.errors.email}</div>
          </div>
        )}

        <form method="post">
          <Label className="mb-4 block w-full">
            <span className="mb-2 block w-full font-medium">E-mail</span>

            <Input
              name="email"
              className="focus-visible:border-primary h-auto border-2 border-white bg-black px-6 py-3 text-xl font-medium tracking-tight text-white focus-visible:ring-offset-0"
            />
          </Label>
          <Label className="mb-4 block w-full">
            <span className="mb-2 block w-full font-medium">Senha</span>

            <Input
              type="password"
              name="password"
              className="focus-visible:border-primary h-auto border-2 border-white bg-black px-6 py-3 text-xl font-medium tracking-tight text-white focus-visible:ring-offset-0"
            />
          </Label>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-auto px-6 py-4 text-xl font-medium tracking-tight"
            >
              Fazer Login <LogInIcon className="ml-2 h-4 w-4" />{" "}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import {
  ArchiveIcon,
  ChevronsUpDownIcon,
  Grid3x3Icon,
  HandshakeIcon,
  HelpCircle,
  LogOutIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
  Users2Icon,
} from "lucide-react";
import { Fragment, useState } from "react";
import {
  Link,
  useFetchers,
  useMatches,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "react-router";
import { SOW } from "~/lib/constants";
import {
  Avatar,
  Bussola,
  getDelayedActions,
  ReportReview,
} from "~/lib/helpers";
import CreateAction from "./CreateAction";
import Loader from "./Loader";
import { ThemeColorToggle, ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CircularProgress } from "./Progress";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";

import { getMonthsActions } from "~/lib/helpers";

export default function Header({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const matches = useMatches();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const fetchers = useFetchers();
  const [searchParams, setSearchParams] = useSearchParams();

  const showFeed = !!searchParams.get("show_feed");
  const params = new URLSearchParams(searchParams);

  const { person } = matches[1].data as DashboardRootType;
  let { actions, actionsChart, partner } = (
    matches[3] ? matches[3].data : {}
  ) as {
    actions: Action[];
    actionsChart: ActionChart[];
    partner: Partner;
  };

  actionsChart = matches[2].data
    ? (matches[2].data as DashboardIndexType).actionsChart
    : actionsChart;

  actions = matches[2].data
    ? (matches[2].data as DashboardIndexType).actions
    : actions;

  partner =
    matches[2].data && !partner
      ? (matches[2].data as { partner: Partner }).partner
      : partner;

  const lateActions = getDelayedActions({ actions: actionsChart });

  return (
    <header
      className={`bg-card flex items-center justify-between gap-4 border-b px-6 py-2 shadow-xs`}
    >
      {/* Logo */}
      <div className="flex items-center gap-1">
        <Link
          to="/dashboard"
          className="ring-ring ring-offset-background rounded px-4 py-2 outline-hidden focus:ring-2"
        >
          <Bussola className="md:hidden" size="md" short />
          <Bussola className="hidden md:block" size="xs" />
        </Link>
        {/* Atrasados */}
        {lateActions.length > 0 && (
          <Link
            to={`/dashboard/${partner ? partner.slug.concat("/") : ""}late/`}
            className="-ml-4 grid -translate-y-2 place-content-center rounded bg-rose-600 px-1.5 py-0.5 text-xs font-semibold text-white"
          >
            {lateActions.length}
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4 md:gap-4">
        {/* Revisão e Instagram */}
        <div className="flex items-center gap-1">
          {partner ? (
            <>
              <ReportReview partner={partner} />
              <Button
                variant={showFeed ? "default" : "ghost"}
                onClick={() => {
                  if (showFeed) {
                    params.delete("show_feed");
                  } else {
                    params.set("show_feed", "true");
                  }

                  setSearchParams(params);
                }}
                size={"icon"}
              >
                <Grid3x3Icon className="size-6" />
              </Button>
            </>
          ) : null}

          {/* Busca Search */}

          <Button
            variant={"ghost"}
            onClick={() => {
              setOpen((value) => !value);
            }}
            size={"icon"}
          >
            <SearchIcon className="size-6" />
          </Button>

          {person.admin && partner && (
            <Button variant={"ghost"} size={"icon"} asChild>
              <Link to={`/dashboard/admin/partner/${partner.slug}`}>
                <SettingsIcon className="size-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Botão de criar ação */}

        <CreateAction mode="plus" shortcut />

        {/* parceiros         */}
        <div className="flex items-center gap-0">
          <PartnerCombobox partner={partner} actions={actions} />
        </div>

        {/* menu de ações */}
        {person && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="relative rounded-full p-1" variant={"ghost"}>
                <Avatar
                  size="md"
                  item={{
                    image: person.image,
                    short: person.initials!,
                  }}
                />
                {(navigation.state !== "idle" ||
                  fetchers.filter((f) => f.formData).length > 0) && (
                  <div className="absolute top-0 right-0">
                    <Loader size="lgs" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-content">
              <ThemeToggle
                element="dropdownmenuitem"
                className="bg-item"
                hasText
              />

              {/* Cores Colors */}

              <ThemeColorToggle />

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="bg-item"
                id="archived"
                onSelect={() => navigate(`/dashboard/me`)}
              >
                <UserIcon className="size-4 opacity-50" />
                <div>Minha conta</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-item"
                id="archived"
                onSelect={() =>
                  navigate(
                    `/dashboard/${
                      partner ? partner.slug.concat("/") : ""
                    }archived`,
                  )
                }
              >
                <ArchiveIcon className="size-4 opacity-50" />
                <div>Arquivados</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-item"
                id="help"
                onSelect={() => navigate("/dashboard/help")}
              >
                <HelpCircle className="size-4 opacity-50" />
                <div>Ajuda</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-item"
                id="ajuda"
                onSelect={() => navigate("/logout")}
              >
                <LogOutIcon className="size-4 opacity-50" />
                <div>Sair</div>
              </DropdownMenuItem>
              {person.admin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="bg-item"
                    id="partners"
                    onSelect={() => navigate("/dashboard/admin/partners")}
                  >
                    <HandshakeIcon className="size-4 opacity-50" />
                    <div>Parceiros</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="bg-item"
                    id="new-partner"
                    onSelect={() => navigate("/dashboard/admin/partner/new")}
                  >
                    <PlusIcon className="size-4 opacity-50" />
                    <div>Novo parceiro</div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="bg-item"
                    id="users"
                    onSelect={() => navigate("/dashboard/admin/users/")}
                  >
                    <Users2Icon className="size-4 opacity-50" />
                    <div>Usuários</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="bg-item"
                    id="new-user"
                    onSelect={() => navigate("/dashboard/admin/users/new")}
                  >
                    <PlusIcon className="size-4 opacity-50" />
                    <div>Novo usuário</div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

function PartnerCombobox({
  partner,
  actions,
}: {
  partner: Partner;
  actions: Action[];
}) {
  const matches = useMatches();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const { partners } = matches[1].data as DashboardRootType;
  const partnersBySOW = [
    { category: SOW.marketing, title: "Consultoria de Marketing" },
    { category: SOW.socialmedia, title: "Social Media" },
    { category: SOW.demand, title: "Sob demanda" },
  ].map((sow) => ({
    title: sow.title,
    partners: partners.filter((partner) => partner.sow === sow.category),
  }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="outline-none" asChild>
        <div className="flex cursor-pointer items-center gap-2">
          {partner ? (
            <div className="flex gap-4">
              <div className="relative">
                <Avatar
                  size="md"
                  item={{
                    short: partner.short,
                    bg: partner.colors[0],
                    fg: partner.colors[1],
                  }}
                />

                <CircularProgress
                  actions={getMonthsActions(actions)}
                  title={format(new Date(), "MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                  className="absolute -top-1/2 -left-1/2"
                />
              </div>
              <span className="hidden text-2xl font-bold tracking-tight md:block">
                {partner.title}
              </span>
            </div>
          ) : (
            <div className="text-sm font-medium">Parceiros</div>
          )}
          <ChevronsUpDownIcon className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="bg-content mx-8 p-0">
        <Command className="outline-none">
          <CommandInput />
          <CommandList>
            <CommandEmpty>Nenhum Parceiro encontrado</CommandEmpty>
            {partnersBySOW.map((sow, i) => (
              <Fragment key={i}>
                <CommandGroup heading={sow.title} key={i}>
                  {sow.partners.map((partner) => (
                    <CommandItem
                      value={partner.slug}
                      key={partner.id}
                      className="bg-item flex"
                      onSelect={(value) => {
                        navigate(`/dashboard/${value}`);
                        setOpen(false);
                      }}
                    >
                      {partner.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

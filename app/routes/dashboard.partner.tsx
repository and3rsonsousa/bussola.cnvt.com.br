/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  addMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  CircleCheckIcon,
  Grid3x3Icon,
  ImageIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useLoaderData,
  useLocation,
  useMatches,
  useOutletContext,
  useSearchParams,
  useSubmit,
} from "react-router";
import invariant from "tiny-invariant";
import {
  ActionLine,
  GridOfActions,
  getNewDateValues,
} from "~/components/Action";
import CreateAction from "~/components/CreateAction";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SiInstagram } from "@icons-pack/react-simple-icons";
import { INTENTS } from "~/lib/constants";
import {
  Avatar,
  AvatarGroup,
  Icons,
  getCategoriesQueryString,
  getInstagramFeed,
  getResponsibles,
  isInstagramFeed,
  sortActions,
  useIDsToRemove,
  usePendingData,
} from "~/lib/helpers";
import { createClient } from "~/lib/supabase";
import LoaderTransition from "~/components/LoaderTransition";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "motion/react";

export const config = { runtime: "edge" };
gsap.registerPlugin(useGSAP);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  let _date = new URL(request.url).searchParams.get("date");

  let date = _date
    ? _date.split("-").length === 2
      ? _date.concat("-15")
      : _date
    : format(new Date(), "yyyy-MM-dd");

  date = date?.replace(/\-01$/, "-02");

  // let start = startOfWeek(startOfMonth(date));
  // let end = endOfDay(endOfWeek(endOfMonth(date)));

  const { supabase } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  let { data } = await supabase
    .from("people")
    .select("*")
    .match({ user_id: user.id })
    .returns<Person[]>();

  invariant(data);

  let person = data[0];

  const [{ data: actions }, { data: actionsChart }, { data: partners }] =
    await Promise.all([
      supabase
        .from("actions")
        .select("*")
        .is("archived", false)
        .contains("responsibles", person?.admin ? [] : [user.id])
        .contains("partners", [params["partner"]!])
        .returns<Action[]>(),
      supabase
        .from("actions")
        .select("category, state, date")
        .is("archived", false)
        .contains("responsibles", person?.admin ? [] : [user.id])
        .contains("partners", [params["partner"]!])
        .returns<{ category: string; state: string; date: string }[]>(),
      supabase
        .from("partners")
        .select()
        .match({ slug: params["partner"]! })
        .returns<Partner[]>(),
    ]);
  invariant(partners);

  return { actions, actionsChart, partner: partners[0], person, date };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.partner?.title.concat(" - ʙússoʟa") },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export default function Partner() {
  let { actions, partner, date } = useLoaderData<typeof loader>();

  const matches = useMatches();
  const submit = useSubmit();
  const id = useId();
  const [searchParams, setSearchParams] = useSearchParams(useLocation().search);
  const [responsiblesFilter, setResponsiblesFilter] = useState<string[]>(
    partner.users_ids,
  );

  const [categoryFilter, setCategoryFilter] = useState<Category[]>([]);

  const { stateFilter, setStateFilter } = useOutletContext() as ContextType;

  const { categories, states, person, people, celebrations } = matches[1]
    .data as DashboardRootType;

  let params = new URLSearchParams(searchParams);

  for (const [key, value] of searchParams.entries()) {
    params.set(key, value);
  }

  const [isInstagramDate, set_isInstagramDate] = useState(
    !!searchParams.get("instagram_date"),
  );
  const [showContent, set_showContent] = useState(
    !!searchParams.get("show_content"),
  );
  const [showFeed, set_showFeed] = useState(!!searchParams.get("show_feed"));
  const [short, set_short] = useState(!!searchParams.get("short"));
  const [showResponsibles, set_showResponsibles] = useState(
    !!searchParams.get("show_responsibles"),
  );
  const [selectMultiple, set_selectMultiple] = useState(
    !!searchParams.get("select_multiple"),
  );

  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const currentDate = date;
  const pendingActions = usePendingData().actions;
  const deletingIDsActions = useIDsToRemove().actions;

  // Calcs

  const actionsMap = new Map<string, Action>(
    actions?.map((action) => [action.id, action]),
  );

  for (const action of pendingActions) {
    if (action.partners[0] === partner.slug) actionsMap.set(action.id, action);
  }

  for (const id of deletingIDsActions) {
    actionsMap.delete(id);
  }

  actions = sortActions(Array.from(actionsMap, ([, v]) => v));
  const instagramActions = getInstagramFeed({ actions });

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const calendar = days.map((day) => {
    return {
      date: format(day, "yyyy-MM-dd"),
      actions: actions?.filter(
        (action) =>
          isSameDay(
            isInstagramDate && isInstagramFeed(action.category, true)
              ? parseISO(action.instagram_date)
              : parseISO(action.date),
            day,
          ) &&
          (categoryFilter.length > 0
            ? categoryFilter.find(
                (category) => category.slug === action.category,
              )
            : true) &&
          (stateFilter ? action.state === stateFilter?.slug : true) &&
          action.responsibles.find((responsible) =>
            responsiblesFilter.find((user_id) => user_id === responsible),
          ),
      ),
      celebrations: celebrations.filter((celebration) =>
        isSameDay(day, parseISO(celebration.date)),
      ),
    };
  });

  useEffect(() => {
    // Scroll into the day
    let date = params.get("date");
    date = date
      ? date.split("-").length === 3
        ? date
        : date.concat("-01")
      : format(new Date(), "yyyy-MM-dd");
    const day = document.querySelector<HTMLDivElement>(`#day_${date}`)!;
    const calendar = document.querySelector<HTMLDivElement>(`#calendar`)!;
    const calendarFull =
      document.querySelector<HTMLDivElement>(`#calendar-full`)!;

    if (day) {
      calendarFull.scrollTo({
        left: day.offsetLeft - 48,
        behavior: "smooth",
      });
      calendar.scrollTo({ top: day.offsetTop - 160, behavior: "smooth" });
    }

    function keyDown(event: KeyboardEvent) {
      if (event.shiftKey && event.altKey) {
        event.preventDefault();
        event.stopPropagation();

        const code = event.code;

        if (code === "KeyC") {
          if (params.get("show_content")) {
            set_showContent(false);
            params.delete("show_content");
          } else {
            set_showContent(true);
            params.set("show_content", "true");
          }
          setSearchParams(params);
        } else if (code === "KeyR") {
          if (params.get("show_responsibles")) {
            set_showResponsibles(false);
            params.delete("show_responsibles");
          } else {
            set_showResponsibles(true);
            params.set("show_responsibles", "true");
          }
          setSearchParams(params);
        } else if (code === "KeyS") {
          if (params.get("short")) {
            set_short(false);
            params.delete("short");
          } else {
            set_short(true);
            params.set("short", "true");
          }
          setSearchParams(params);
          // setShort((value) => !value);
        } else if (code === "KeyI") {
          if (params.get("show_feed")) {
            set_isInstagramDate(false);
            set_showContent(false);
            set_showFeed(false);

            params.delete("show_feed");
            params.delete("instagram_date");
            params.delete("show_content");
          } else {
            set_isInstagramDate(true);
            set_showContent(true);
            set_showFeed(true);

            params.set("instagram_date", "true");
            params.set("show_content", "true");
            params.set("show_feed", "true");
          }
          setSearchParams(params);
        }
      }
    }

    document.addEventListener("keydown", keyDown);

    setCategoryFilter([]);

    return () => document.removeEventListener("keydown", keyDown);
  }, []);

  useEffect(() => {
    setResponsiblesFilter(partner.users_ids);
  }, [partner]);

  useEffect(() => {
    let _params = params.get("categories")?.split("-");
    let _categories = categories.filter((category) =>
      _params?.find((_p) => _p === category.slug),
    );

    setCategoryFilter(_categories);
  }, [searchParams]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const date = over?.id as string;
    const actionDate = isInstagramDate
      ? (active.data.current?.instagram_date as string)
      : (active.data.current?.date as string);
    const draggedAction = actions?.find((action) => action.id === active.id)!;

    if (date !== format(actionDate, "yyyy-MM-dd")) {
      submit(
        {
          ...draggedAction,
          intent: INTENTS.updateAction,
          [isInstagramDate && isInstagramFeed(active.data.current?.category)
            ? "instagram_date"
            : "date"]: date?.concat(` ${format(actionDate, "HH:mm:ss")}`),
          ...getNewDateValues(
            draggedAction,
            isInstagramDate,
            0,
            false,
            new Date(date?.concat(` ${format(actionDate, "HH:mm:ss")}`)),
          ),
        },
        {
          action: "/handle-actions",
          method: "POST",
          navigate: false,
          fetcherKey: `action:${active.id}:update:move:calendar`,
        },
      );
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  return (
    <div className="flex overflow-hidden">
      <div className={`flex h-full w-full flex-col overflow-hidden`}>
        {/* Calendário Header */}

        <div className="flex items-center justify-between border-b px-4 py-2 md:px-8">
          {/* Mês */}
          <div className="flex items-center gap-1">
            <div className="mr-1">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="capitalize outline-hidden"
                  asChild
                >
                  <Button
                    variant={"ghost"}
                    className="cursor-pointer text-xl font-bold md:w-40"
                  >
                    {format(currentDate, "MMMM", {
                      locale: ptBR,
                    })}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-content">
                  {eachMonthOfInterval({
                    start: startOfYear(new Date()),
                    end: endOfYear(new Date()),
                  }).map((month) => (
                    <DropdownMenuItem
                      className="bg-item capitalize"
                      key={month.getMonth()}
                      onSelect={() => {
                        params.set(
                          "date",
                          format(
                            new Date().setMonth(month.getMonth()),
                            "yyyy-MM-'01'",
                          ),
                        );

                        setSearchParams(params);
                      }}
                    >
                      {format(month, "MMMM", {
                        locale: ptBR,
                      })}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                params.set(
                  "date",
                  format(subMonths(currentDate, 1), "yyyy-MM-dd"),
                );

                setSearchParams(params);
              }}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" asChild>
              <button
                onClick={() => {
                  params.set(
                    "date",
                    format(addMonths(currentDate, 1), "yyyy-MM-dd"),
                  );

                  setSearchParams(params);
                }}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </Button>
          </div>
          <div className="flex items-center gap-1 lg:gap-2">
            {selectedActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={`outline-none`}
                    variant={"ghost"}
                    size={"sm"}
                  >
                    <span>
                      {selectedActions.length} ações{" "}
                      <span className="hidden md:inline">selecionadas</span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-content">
                  {/* Mudar State */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="bg-item">
                      Mudar Status
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-content">
                      {states.map((state) => (
                        <DropdownMenuItem
                          key={state.slug}
                          className="bg-item"
                          onSelect={() => {
                            submit(
                              {
                                intent: INTENTS.updateActions,
                                state: state.slug,
                                ids: selectedActions.join(","),
                              },
                              {
                                action: "/handle-actions",
                                method: "POST",
                                navigate: false,
                                fetcherKey: `action:update:state`,
                              },
                            );
                          }}
                        >
                          <div
                            className={`h-2 w-2 rounded-full`}
                            style={{ backgroundColor: state.color }}
                          ></div>
                          <div>{state.title}</div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  {/* Mudar Categoria */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="bg-item">
                      Mudar Categoria
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="bg-content">
                      {categories.map((category) => (
                        <DropdownMenuItem
                          key={category.slug}
                          className="bg-item"
                          onSelect={() => {
                            submit(
                              {
                                intent: INTENTS.updateActions,
                                category: category.slug,
                                ids: selectedActions.join(","),
                              },
                              {
                                action: "/handle-actions",
                                method: "POST",
                                navigate: false,
                                fetcherKey: `action:update:category`,
                              },
                            );
                          }}
                        >
                          <Icons className="size-3" id={category.slug} />
                          <div>{category.title}</div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="bg-item"
                    onSelect={() => {
                      setSelectedActions([]);
                    }}
                  >
                    Limpar Seleção
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              size={"sm"}
              variant={selectMultiple ? "secondary" : "ghost"}
              onClick={() => {
                if (selectMultiple) {
                  setSelectedActions([]);
                  set_selectMultiple(false);
                  params.delete("select_multiple");
                } else {
                  set_selectMultiple(true);
                  params.set("select_multiple", "true");
                }
                setSearchParams(params);
              }}
              title={"Selecionar múltiplas ações"}
            >
              <CircleCheckIcon className="size-4" />{" "}
            </Button>
            <Button
              size={"sm"}
              variant={isInstagramDate ? "secondary" : "ghost"}
              onClick={() => {
                if (isInstagramDate) {
                  set_isInstagramDate(false);
                  set_showContent(false);

                  params.delete("instagram_date");
                  params.delete("show_content");
                } else {
                  set_isInstagramDate(true);
                  set_showContent(true);

                  params.set("instagram_date", "true");
                  params.set("show_content", "true");
                }
                setSearchParams(params);
              }}
              title={"Organizar ações pelas datas do Instagram ( ⇧ + ⌥ + I )"}
            >
              <SiInstagram className="size-4" />
            </Button>
            <Button
              size={"sm"}
              variant={showContent ? "secondary" : "ghost"}
              onClick={() => {
                if (showContent) {
                  set_showContent(false);
                  params.delete("show_content");
                } else {
                  set_showContent(true);
                  params.set("show_content", "true");
                }
                setSearchParams(params);
              }}
              title={
                showContent
                  ? "Mostrar conteúdo das postagens (⇧ + ⌥ + C)"
                  : "Mostrar apenas os títulos (⇧ + ⌥ + C)"
              }
            >
              <ImageIcon className="size-4" />
            </Button>
            <Button
              size={"sm"}
              variant={showResponsibles ? "secondary" : "ghost"}
              onClick={() => {
                if (showResponsibles) {
                  set_showResponsibles(false);
                  params.delete("show_responsibles");
                } else {
                  set_showResponsibles(true);
                  params.set("show_responsibles", "true");
                }

                setSearchParams(params);
              }}
              title={
                showResponsibles
                  ? "Todos os responsáveis (⇧ + ⌥ + R) "
                  : "'Eu' como responsável (⇧ + ⌥ + R) "
              }
            >
              {showResponsibles ? (
                <UsersIcon className="size-4" />
              ) : (
                <UserIcon className="size-4" />
              )}
            </Button>
            <Button
              variant={short ? "secondary" : "ghost"}
              size={"sm"}
              onClick={() => {
                if (params.get("short")) {
                  set_short(false);
                  params.delete("short");
                } else {
                  set_short(true);
                  params.set("short", "true");
                }
                setSearchParams(params);
              }}
              title={
                short
                  ? "Aumentar o tamanho da ação"
                  : "Diminuir o tamanho da ação"
              }
            >
              {short ? (
                <ChevronsUpDownIcon className="size-4" />
              ) : (
                <ChevronsDownUpIcon className="size-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={
                    partner.users_ids.length !== responsiblesFilter.length
                      ? "secondary"
                      : "ghost"
                  }
                  className={`outline-none`}
                >
                  {
                    <AvatarGroup
                      avatars={getResponsibles(people, responsiblesFilter).map(
                        (person) => ({
                          item: {
                            short: person.short,
                            image: person.image,
                            title: `${person.name} ${person.surname}`,
                          },
                          className:
                            partner.users_ids.length !==
                            responsiblesFilter.length
                              ? "ring-secondary"
                              : "ring-card",
                        }),
                      )}
                    />
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent>
                  {getResponsibles(people, partner.users_ids).map((person) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={person.id}
                        className="bg-select-item flex items-center gap-2"
                        checked={
                          responsiblesFilter?.find(
                            (user_id) => user_id === person.user_id,
                          )
                            ? true
                            : false
                        }
                        onClick={(event) => {
                          const checked = responsiblesFilter.includes(
                            person.user_id,
                          );

                          // Se so tiver um e ele for desmarcado, mostra todos

                          if (checked && responsiblesFilter.length === 1) {
                            setResponsiblesFilter(partner.users_ids);
                          }
                          // Se o shift estiver sendo pressionado, mostra apenas aquele usuário
                          if (event.shiftKey) {
                            setResponsiblesFilter([person.user_id]);
                          } else {
                            const tempResponsibles = checked
                              ? responsiblesFilter.filter(
                                  (id) => id !== person.user_id,
                                )
                              : [...responsiblesFilter, person.user_id];
                            setResponsiblesFilter(tempResponsibles);
                          }
                        }}
                      >
                        <Avatar
                          item={{
                            image: person.image,
                            short: person.initials!,
                          }}
                          size="sm"
                        />
                        {`${person.name} ${person.surname}`}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  className={`border-2 text-xs font-bold`}
                  style={{
                    borderColor: stateFilter
                      ? stateFilter.color
                      : "transparent",
                  }}
                >
                  {stateFilter ? (
                    stateFilter.title
                  ) : (
                    <>
                      <span className="-mr-1 hidden font-normal md:inline">
                        Filtrar pelo
                      </span>
                      Status
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-content">
                <DropdownMenuItem
                  className="bg-item"
                  onSelect={() => {
                    setStateFilter(undefined);
                  }}
                >
                  <div className={`size-2 rounded-full bg-gray-500`}></div>
                  <div>Todos os Status</div>
                </DropdownMenuItem>
                {states.map((state) => (
                  <DropdownMenuItem
                    className="bg-item"
                    key={state.slug}
                    onSelect={() => setStateFilter(state)}
                  >
                    <div
                      className={`h-2 w-2 rounded-full`}
                      style={{
                        backgroundColor: state.color,
                      }}
                    ></div>
                    <div>{state.title}</div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={categoryFilter.length > 0 ? "secondary" : "ghost"}
                  className={`text-xs font-bold`}
                >
                  {categoryFilter.length > 0 ? (
                    <>
                      <div>
                        {categoryFilter
                          .map((category) => category.title)
                          .join(", ")}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="-mr-1 hidden font-normal md:inline">
                        Filtrar pela
                      </span>
                      Categoria
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-content">
                <DropdownMenuCheckboxItem
                  className="bg-select-item flex gap-2"
                  checked={categoryFilter?.length == 0}
                  onCheckedChange={() => {
                    params.delete("categories");
                    setSearchParams(params);
                    setCategoryFilter([]);
                  }}
                >
                  <Icons className="h-3 w-3" id="all" />
                  <div>Todas as Categorias</div>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  className="bg-select-item flex gap-2"
                  checked={
                    categoryFilter
                      ? categoryFilter.filter((cf) => isInstagramFeed(cf.id))
                          .length === 3
                      : false
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      let _categories = categories.filter((category) =>
                        isInstagramFeed(category.slug),
                      );
                      params.set(
                        "categories",
                        _categories.map((_c) => _c.slug).join("-"),
                      );
                      setSearchParams(params);
                      setCategoryFilter(_categories);
                    } else {
                      params.delete("categories");
                      setSearchParams(params);
                    }
                  }}
                >
                  <Grid3x3Icon className="h-3 w-3" />
                  <div>Feed do Instagram</div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator className="border-t" />
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    className="bg-select-item flex gap-2"
                    key={category.slug}
                    checked={
                      categoryFilter
                        ? categoryFilter?.findIndex(
                            (c) => category.slug === c.slug,
                          ) >= 0
                        : false
                    }
                    onCheckedChange={(checked) => {
                      let _categories_slugs = getCategoriesQueryString();
                      let _categories = categories.filter((category) =>
                        _categories_slugs.split("-").includes(category.slug),
                      );

                      if (checked) {
                        params.set(
                          "categories",
                          getCategoriesQueryString().concat(category.slug),
                        );
                      } else {
                        _categories_slugs = _categories_slugs
                          .split("-")
                          .filter((c) => c !== category.slug && c !== "")
                          .join("-");
                        params.set("categories", _categories_slugs);
                      }
                      setSearchParams(params);
                    }}
                  >
                    <Icons id={category.slug} className="h-3 w-3" />
                    <div>{category.title}</div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Calendário */}
        <DndContext onDragEnd={handleDragEnd} sensors={sensors} id={id}>
          <div className="overflow-x-auto overflow-y-hidden">
            <div
              className="main-container flex h-full w-full min-w-[1200px] flex-col"
              id="calendar-full"
            >
              {/* Dias do Calendário */}
              <div
                className={`grid grid-cols-7 border-b px-4 py-2 text-xs font-bold tracking-wider uppercase md:px-8`}
              >
                {eachDayOfInterval({
                  start: startOfWeek(new Date()),
                  end: endOfWeek(new Date()),
                }).map((day, j) => {
                  return (
                    <div
                      key={j}
                      className={
                        day.getDay() === new Date().getDay()
                          ? ""
                          : "text-muted-foreground"
                      }
                    >
                      {format(day, "EEE", {
                        locale: ptBR,
                      })}
                    </div>
                  );
                })}
              </div>
              {/* Calendário Content */}
              <div
                id="calendar"
                className={`grid grid-cols-7 overflow-y-auto pb-32`}
              >
                {calendar.map((day, i) => (
                  <CalendarDay
                    currentDate={currentDate}
                    day={day}
                    person={person}
                    short={short}
                    showResponsibles={showResponsibles}
                    showContent={showContent}
                    key={i}
                    index={i}
                    setSelectedActions={setSelectedActions}
                    selectMultiple={selectMultiple}
                  />
                ))}
              </div>
            </div>
          </div>
        </DndContext>
      </div>

      {/* Instagram Grid */}
      {showFeed && (
        <div
          className="relative flex w-full max-w-[480px] min-w-96 flex-col"
          id="instagram-grid"
        >
          {/* Instagram Grid Header */}
          <div className="flex items-center gap-2 border-b px-4 py-3 leading-none">
            <div>
              <Avatar
                item={{
                  short: partner.short,
                  bg: partner.colors[0],
                  fg: partner.colors[1],
                }}
                size="md"
              />
            </div>
            <div>
              <div className="font-medium">{partner.title}</div>
              <div className="text-xs">@{partner.slug}</div>
            </div>
          </div>

          {/* Instagram Grid Content */}
          <div className="overflow-hidden border-l px-3 py-3">
            <GridOfActions
              partner={partner}
              actions={instagramActions as Action[]}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const CalendarDay = ({
  day,
  currentDate,
  short,
  showResponsibles,
  showContent,
  index,
  setSelectedActions,
  selectMultiple,
}: {
  day: { date: string; actions?: Action[]; celebrations?: Celebration[] };
  currentDate: Date | string;
  person: Person;
  short?: boolean;
  showResponsibles?: boolean;
  showContent?: boolean;
  index?: string | number;
  setSelectedActions: React.Dispatch<React.SetStateAction<string[]>>;
  selectMultiple?: boolean;
}) => {
  const matches = useMatches();
  const { categories } = matches[1].data as DashboardRootType;

  const { setNodeRef, isOver } = useDroppable({
    id: `${format(parseISO(day.date), "yyyy-MM-dd")}`,
  });

  const today = isToday(parseISO(day.date));

  return (
    <div
      ref={setNodeRef}
      id={`day_${format(parseISO(day.date), "yyyy-MM-dd")}`}
      className={`group/day hover:bg-secondary/20 relative flex h-full flex-col border-b py-2 transition ${
        Math.floor(Number(index) / 7) % 2 === 0 ? "item-even" : "item-odd"
      } ${isOver ? "dragover" : ""} ${today && "bg-secondary/50 border-t-foreground border-t"}`}
      data-date={format(parseISO(day.date), "yyyy-MM-dd")}
    >
      {/* Date */}
      <div className="mb-4 flex items-center justify-between px-4">
        <div
          className={`grid place-content-center rounded-full text-xl ${
            today
              ? "text-primary font-medium"
              : `font-light ${
                  !isSameMonth(parseISO(day.date), currentDate)
                    ? "text-muted"
                    : ""
                } `
          }`}
        >
          {parseISO(day.date).getDate()}
        </div>
        <div className="scale-50 opacity-0 group-hover/day:scale-100 group-hover/day:opacity-100 focus-within:scale-100 focus-within:opacity-100">
          <CreateAction mode="day" date={day.date} />
        </div>
      </div>
      {/* Actions and Celebration */}
      <div className="flex h-full flex-col justify-between px-2">
        <div className="relative flex h-full grow flex-col gap-3">
          {showContent ? (
            <div className="flex flex-col gap-3">
              {day.actions?.filter((action) => isInstagramFeed(action.category))
                .length !== 0 && (
                <>
                  {/* <div className="mb-2 flex items-center gap-1 text-lg font-medium">
                    <Grid3x3Icon className="size-3" />
                    <div>Feed</div>
                  </div> */}
                  <div className="mb-4 flex flex-col gap-3">
                    {day.actions
                      ?.sort((a, b) =>
                        isAfter(a.instagram_date, b.instagram_date) ? 1 : -1,
                      )
                      ?.filter((action) => isInstagramFeed(action.category))
                      .map((action) => (
                        <ActionLine
                          selectMultiple={selectMultiple}
                          showContent={showContent}
                          short={short}
                          showResponsibles={showResponsibles}
                          setSelectedActions={setSelectedActions}
                          showDelay
                          action={action}
                          key={action.id}
                          date={{
                            timeFormat: 1,
                          }}
                        />
                      ))}
                  </div>
                </>
              )}
              <div className="flex flex-col gap-3">
                {categories
                  .filter((category) => !isInstagramFeed(category.slug))
                  .map((category) => ({
                    category,
                    actions: day.actions?.filter(
                      (action) => category.slug === action.category,
                    ),
                  }))
                  .map(({ category, actions }) => (
                    <CategoryActions
                      selectMultiple={selectMultiple}
                      showResponsibles={showResponsibles}
                      category={category}
                      actions={actions}
                      short={short}
                      showContent
                      key={category.id}
                      setSelectedActions={setSelectedActions}
                    />
                  ))}
              </div>
            </div>
          ) : (
            categories
              .map((category) => ({
                category,
                actions: day.actions?.filter(
                  (action) => category.slug === action.category,
                ),
              }))
              .map(
                ({ category, actions }, i) =>
                  actions &&
                  actions.length > 0 && (
                    <CategoryActions
                      selectMultiple={selectMultiple}
                      showResponsibles={showResponsibles}
                      category={category}
                      actions={actions}
                      short={short}
                      key={category.id}
                      setSelectedActions={setSelectedActions}
                    />
                  ),
              )
          )}
        </div>

        {day.celebrations && day.celebrations.length > 0 && (
          <div className="mt-4 space-y-2 text-[10px] opacity-50">
            {day.celebrations?.map((celebration) => (
              <div key={celebration.id} className="leading-none">
                {celebration.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function CategoryActions({
  category,
  actions,
  showContent,
  short,
  showResponsibles,
  setSelectedActions,
  selectMultiple = false,
}: {
  category: Category;
  actions?: Action[];
  showContent?: boolean;
  short?: boolean;
  showResponsibles?: boolean;
  selectMultiple?: boolean;
  setSelectedActions: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  actions = actions?.sort((a, b) =>
    isAfter(a.instagram_date, b.instagram_date) ? 1 : -1,
  );

  return actions && actions.length > 0 ? (
    <div key={category.slug} className="flex flex-col gap-3">
      {!(showContent && isInstagramFeed(category.slug)) && (
        <div className="mt-2 flex items-center gap-1 text-[8px] font-bold tracking-widest uppercase">
          {/* <div
            className={`size-1.5 rounded-full`}
            style={{ backgroundColor: category.color }}
          ></div> */}
          <div>{category.title}</div>
        </div>
      )}

      <div className={`flex flex-col gap-1`}>
        {actions?.map((action) => (
          <ActionLine
            selectMultiple={selectMultiple}
            showContent={showContent}
            short={short}
            showResponsibles={showResponsibles}
            showDelay
            action={action}
            key={action.id}
            date={{
              timeFormat: 1,
            }}
            setSelectedActions={setSelectedActions}
          />
        ))}
      </div>
    </div>
  ) : null;
}

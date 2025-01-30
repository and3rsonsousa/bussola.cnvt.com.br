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
  AlignJustifyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
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
  getCategoriesSortedByContent,
  getInstagramFeed,
  getResponsibles,
  isInstagramFeed,
  sortActions,
  useIDsToRemove,
  usePendingData,
} from "~/lib/helpers";
import { createClient } from "~/lib/supabase";

export const config = { runtime: "edge" };

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

  const { data: person } = await supabase
    .from("people")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const [{ data: actions }, { data: actionsChart }, { data: partner }] =
    await Promise.all([
      supabase
        .from("actions")
        .select("*")
        .is("archived", false)
        .contains("responsibles", person?.admin ? [] : [user.id])
        .contains("partners", [params["partner"]!])
        // .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
        // .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
        .returns<Action[]>(),
      supabase
        .from("actions")

        .select("category, date, state")
        .is("archived", false)
        .eq("partner", params["partner"]!)
        .contains("responsibles", person?.admin ? [] : [user.id]),
      supabase
        .from("partners")
        .select()
        .eq("slug", params["partner"]!)
        .single(),
    ]);

  invariant(partner);

  return { actions, actionsChart, partner, person, date };
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

  const isInstagramDate = !!searchParams.get("instagram_date");
  const showContent = !!searchParams.get("show_content");
  const showFeed = !!searchParams.get("show_feed");
  const short = !!searchParams.get("short");
  const showResponsibles = !!searchParams.get("show_responsibles");

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

    calendarFull.scrollTo({
      left: day.offsetLeft - 48,
      behavior: "smooth",
    });
    calendar.scrollTo({ top: day.offsetTop - 120, behavior: "smooth" });

    function keyDown(event: KeyboardEvent) {
      if (event.shiftKey && event.altKey) {
        event.preventDefault();
        event.stopPropagation();

        const code = event.code;

        if (code === "KeyC") {
          if (params.get("show_content")) {
            params.delete("show_content");
          } else {
            params.set("show_content", "true");
          }
          setSearchParams(params);
        } else if (code === "KeyR") {
          if (params.get("show_responsibles")) {
            params.delete("show_responsibles");
          } else {
            params.set("show_responsibles", "true");
          }
          setSearchParams(params);
        } else if (code === "KeyS") {
          if (params.get("short")) {
            params.delete("short");
          } else {
            params.set("short", "true");
          }
          setSearchParams(params);
          // setShort((value) => !value);
        } else if (code === "KeyI") {
          if (params.get("show_feed")) {
            params.delete("show_feed");
            params.delete("instagram_date");
            params.delete("show_content");
          } else {
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
    <div className="flex overflow-hidden" id="partner-page">
      <div className={`flex h-full w-full flex-col overflow-hidden`}>
        {/* Calendário Header */}

        <div className="bg-card flex items-center justify-between border-b px-4 py-2 md:px-8">
          <div className="flex items-center gap-1">
            <div className="mr-1">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="capitalize outline-hidden"
                  asChild
                >
                  <Button
                    variant={"ghost"}
                    className="cursor-pointer text-xl font-bold"
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
            <Button
              size={"sm"}
              variant={isInstagramDate ? "secondary" : "ghost"}
              onClick={() => {
                if (isInstagramDate) {
                  params.delete("instagram_date");
                  params.delete("show_content");
                } else {
                  params.set("instagram_date", "true");
                  params.set("show_content", "true");
                }
                setSearchParams(params);
              }}
              title={"Organizar ações pelas datas do Instagram"}
            >
              <SiInstagram className="size4" />
            </Button>
            <Button
              size={"sm"}
              variant={showContent ? "secondary" : "ghost"}
              onClick={() => {
                if (showContent) {
                  params.delete("show_content");
                } else {
                  params.set("show_content", "true");
                }
                setSearchParams(params);
              }}
              title={
                showContent
                  ? "Mostrar conteúdo das postagens"
                  : "Mostrar apenas os títulos"
              }
            >
              {showContent ? (
                <ImageIcon className="size-4" />
              ) : (
                <AlignJustifyIcon className="size-4" />
              )}
            </Button>
            <Button
              size={"sm"}
              variant={showResponsibles ? "secondary" : "ghost"}
              onClick={() => {
                if (showResponsibles) {
                  params.delete("show_responsibles");
                } else {
                  params.set("show_responsibles", "true");
                }

                setSearchParams(params);
              }}
              title={
                showResponsibles
                  ? "Todos os responsáveis"
                  : "'Eu' como responsável"
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
                  params.delete("short");
                } else {
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
                className={`grid grid-cols-7 overflow-y-auto px-4 pb-32 md:px-8`}
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
          className="relative flex w-full max-w-[600px] min-w-96 flex-col"
          id="instagram-grid"
        >
          {/* Instagram Grid Header */}
          <div className="bg-card flex items-center gap-2 border-b px-4 py-3 leading-none">
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
}: {
  day: { date: string; actions?: Action[]; celebrations?: Celebration[] };
  currentDate: Date | string;
  person: Person;
  short?: boolean;
  showResponsibles?: boolean;
  showContent?: boolean;
  index?: string | number;
}) => {
  const matches = useMatches();
  const { categories } = matches[1].data as DashboardRootType;

  const { setNodeRef, isOver } = useDroppable({
    id: `${format(parseISO(day.date), "yyyy-MM-dd")}`,
  });

  return (
    <div className="py-2">
      <div
        ref={setNodeRef}
        id={`day_${format(parseISO(day.date), "yyyy-MM-dd")}`}
        className={`group/day hover:bg-accent/50 relative flex h-full flex-col rounded border-2 border-transparent px-2 pb-4 transition ${
          Math.floor(Number(index) / 7) % 2 === 0 ? "item-even" : "item-odd"
        } ${isOver ? "dragover" : ""}`}
        data-date={format(parseISO(day.date), "yyyy-MM-dd")}
      >
        {/* Date */}
        <div className="mb-2 flex items-center justify-between">
          <div
            className={`grid size-8 place-content-center rounded-full text-xl ${
              isToday(parseISO(day.date))
                ? "bg-primary text-primary-foreground font-medium"
                : `${
                    !isSameMonth(parseISO(day.date), currentDate)
                      ? "text-muted"
                      : ""
                  } -ml-2 font-light`
            }`}
          >
            {parseISO(day.date).getDate()}
          </div>
          <div className="scale-50 opacity-0 group-hover/day:scale-100 group-hover/day:opacity-100 focus-within:scale-100 focus-within:opacity-100">
            <CreateAction mode="day" date={day.date} />
          </div>
        </div>
        {/* Actions and Celebration */}
        <div className="flex h-full flex-col justify-between">
          <div className="relative flex h-full grow flex-col gap-3">
            {showContent
              ? getCategoriesSortedByContent(categories).map((section, i) => (
                  <div key={i} className={i === 0 ? "flex flex-col gap-3" : ""}>
                    {i === 0 &&
                      day.actions?.filter((action) =>
                        isInstagramFeed(action.category),
                      ).length !== 0 && (
                        <div className="mb-2 flex items-center gap-1 text-[12px] font-medium">
                          <Grid3x3Icon className="size-4" />
                          <div>Feed</div>
                        </div>
                      )}
                    {section
                      .map((category) => ({
                        category,
                        actions: day.actions?.filter(
                          (action) => action.category === category.slug,
                        ),
                      }))
                      .map(({ actions, category }) => (
                        <CategoryActions
                          showResponsibles={showResponsibles}
                          category={category}
                          actions={actions}
                          short={short}
                          showContent
                          key={category.id}
                        />
                      ))}
                  </div>
                ))
              : categories
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
                          showResponsibles={showResponsibles}
                          category={category}
                          actions={actions}
                          short={short}
                          key={category.id}
                        />
                      ),
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
    </div>
  );
};

function CategoryActions({
  category,
  actions,
  showContent,
  short,
  showResponsibles,
}: {
  category: Category;
  actions?: Action[];
  showContent?: boolean;
  short?: boolean;
  showResponsibles?: boolean;
}) {
  actions = actions?.sort((a, b) =>
    isAfter(b.instagram_date, a.instagram_date) ? 1 : -1,
  );
  return actions && actions.length > 0 ? (
    <div key={category.slug} className="flex flex-col gap-3">
      {!(showContent && isInstagramFeed(category.slug)) && (
        <div className="mt-2 flex items-center gap-1 text-[8px] font-bold tracking-widest uppercase">
          <div
            className={`size-1.5 rounded-full`}
            style={{ backgroundColor: category.color }}
          ></div>
          <div>{category.title}</div>
        </div>
      )}
      <div className={`flex flex-col gap-1`}>
        {actions?.map((action) => (
          <ActionLine
            showContent={showContent}
            short={short}
            showResponsibles={showResponsibles}
            showDelay
            action={action}
            key={action.id}
            date={{
              timeFormat: 1,
            }}
          />
        ))}
      </div>
    </div>
  ) : null;
}

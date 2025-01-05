import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
	ArchiveIcon,
	Grid3x3Icon,
	HandshakeIcon,
	HelpCircle,
	LogOutIcon,
	PlusIcon,
	SearchIcon,
	UserIcon,
	Users2Icon,
} from "lucide-react";
import { useState } from "react";
import {
	Link,
	useFetchers,
	useMatches,
	useNavigate,
	useNavigation,
	useSearchParams
} from "react-router";
import { SOW } from "~/lib/constants";
import {
	Avatar,
	Bussola,
	getDelayedActions,
	getMonthsActions,
	getThisWeekActions,
	getTodayActions,
	ReportReview,
} from "~/lib/helpers";
import CreateAction from "./CreateAction";
import Loader from "./Loader";
import { CircularProgress } from "./Progress";
import { ThemeColorToggle, ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

	const [progressView, setProgressView] = useState<
		"today" | "week" | "month"
	>("today");

	const showFeed = !!searchParams.get("show_feed");
	const params = new URLSearchParams(searchParams);

	const { partners, person } = matches[1].data as DashboardRootType;
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

	const lateActions = getDelayedActions({ actions });
	

	return (
		<header
			className={`flex items-center bg-card justify-between gap-4 shadow-xs px-6 py-2`}
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
						to={`/dashboard/${
							partner ? partner.slug.concat("/") : ""
						}late/`}
						className="-ml-4 grid -translate-y-2 place-content-center rounded bg-rose-600 px-1.5 py-0.5 text-xs font-semibold text-white"
					>
						{lateActions.length}
					</Link>
				)}
			</div>
			<div className="flex items-center gap-1 md:gap-4">
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
				</div>

				{/* Botão de criar ação */}

				<CreateAction mode="plus" shortcut />

				{/* parceiros         */}
				<div className="flex items-center gap-0">
					{partner && (
						<div
							className="relative flex cursor-pointer items-center gap-1"
							role="button"
							onClick={() =>
								setProgressView((p) => {
									if (p === "today") return "week";
									if (p === "week") return "month";
									return "today";
								})
							}
						>
							{progressView === "today" && (
								<CircularProgress
									actions={getTodayActions(actions)}
									title="Hoje"
								/>
							)}
							{progressView === "week" && (
								<CircularProgress
									actions={getThisWeekActions(actions)}
									title="Semana"
								/>
							)}
							{progressView === "month" && (
								<CircularProgress
									actions={getMonthsActions(actions)}
									title={format(new Date(), "MMM")}
								/>
							)}
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-[10px] font-semibold uppercase">
								{
									{
										today: "Hoje",
										week: "Sem",
										month: format(new Date(), "MMM", {
											locale: ptBR,
										}),
									}[progressView]
								}
							</div>
						</div>
					)}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant={"ghost"}
								className={
									partner
										? "rounded-full px-4 py-2"
										: `text-ellipsis whitespace-nowrap`
								}
							>
								{partner ? (
									<>
										<span className="hidden text-2xl font-bold tracking-tight md:block">
											{partner.title}
										</span>
										<span className="text-lg font-bold tracking-wide uppercase md:hidden">
											{partner.short}
										</span>
									</>
								) : (
									"Parceiros"
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="bg-content mr-8">
							<DropdownMenuLabel className="bg-label">
								Consultoria de Marketing
							</DropdownMenuLabel>
							{partners.map(
								(partner) =>
									partner.sow === SOW.marketing && (
										<DropdownMenuItem
											className="bg-item"
											onSelect={() =>
												navigate(
													`/dashboard/${partner.slug}`
												)
											}
											key={partner.slug}
											id={partner.slug}
										>
											{partner.title}
										</DropdownMenuItem>
									)
							)}
							<DropdownMenuSeparator />
							<DropdownMenuLabel className="bg-label">
								Social Media
							</DropdownMenuLabel>
							{partners.map(
								(partner) =>
									partner.sow === SOW.socialmedia && (
										<DropdownMenuItem
											className="bg-item"
											onSelect={() =>
												navigate(
													`/dashboard/${partner.slug}`
												)
											}
											key={partner.slug}
											id={partner.slug}
										>
											{partner.title}
										</DropdownMenuItem>
									)
							)}
							<DropdownMenuSeparator />
							<DropdownMenuLabel className="bg-label">
								Demanda
							</DropdownMenuLabel>
							{partners.map(
								(partner) =>
									partner.sow === SOW.demand && (
										<DropdownMenuItem
											className="bg-item"
											onSelect={() =>
												navigate(
													`/dashboard/${partner.slug}`
												)
											}
											key={partner.slug}
											id={partner.slug}
										>
											{partner.title}
										</DropdownMenuItem>
									)
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* menu de ações */}
				{person && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="relative rounded-full p-1"
								variant={"ghost"}
							>
								<Avatar
									size="md"
									item={{
										image: person.image,
										short: person.initials!,
									}}
								/>
								{(navigation.state !== "idle" ||
									fetchers.filter((f) => f.formData).length >
										0) && (
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
											partner
												? partner.slug.concat("/")
												: ""
										}archived`
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
										onSelect={() =>
											navigate(
												"/dashboard/admin/partners"
											)
										}
									>
										<HandshakeIcon className="size-4 opacity-50" />
										<div>Parceiros</div>
									</DropdownMenuItem>
									<DropdownMenuItem
										className="bg-item"
										id="new-partner"
										onSelect={() =>
											navigate(
												"/dashboard/admin/partners/new"
											)
										}
									>
										<PlusIcon className="size-4 opacity-50" />
										<div>Novo parceiro</div>
									</DropdownMenuItem>

									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="bg-item"
										id="users"
										onSelect={() =>
											navigate("/dashboard/admin/users/")
										}
									>
										<Users2Icon className="size-4 opacity-50" />
										<div>Usuários</div>
									</DropdownMenuItem>
									<DropdownMenuItem
										className="bg-item"
										id="new-user"
										onSelect={() =>
											navigate(
												"/dashboard/admin/users/new"
											)
										}
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

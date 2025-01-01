import React from "react";
import { cn } from "~/lib/utils";

const Button = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		asChild?: boolean;
		rounded?: boolean;
	}
>(({ className, asChild = false, rounded = false, ...props }, ref) => {
	return (
		<button
			className={cn(
				`group relative inline-flex items-center gap-2 ${
					rounded
						? "aspect-square rounded-full p-3"
						: "rounded px-6 py-4"
				} bg-primary text-primary-foreground ring-foreground ring-offset-background leading-none font-bold ring-offset-2 outline-hidden focus:ring-2`,
				className
			)}
			ref={ref}
			{...props}
		>
			{props.children}
		</button>
		// <button
		//   className={cn(
		//     `group relative inline-flex items-center gap-2 ${rounded ? "aspect-square rounded-full p-3" : "rounded px-6 py-4"} border border-black/50 bg-linear-to-b from-white/80 via-black to-[#444] leading-none text-white outline-hidden ring-primary ring-offset-4 ring-offset-background focus:ring-2`,
		//     className,
		//   )}
		//   ref={ref}
		//   {...props}
		// >
		//   <div
		//     className={`absolute inset-[1px] z-0 ${rounded ? "rounded-full" : "rounded-[10px]"} bg-linear-to-b from-[#444] via-black to-black group-hover:from-[#777879] group-hover:via-black group-hover:to-black group-active:from-[#222] group-active:to-black`}
		//   ></div>
		//   <span className="z-10">{props.children}</span>
		// </button>
	);
});

export default Button;

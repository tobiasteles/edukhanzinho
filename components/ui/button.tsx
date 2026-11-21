import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const PRESS =
  "border-b-[6px] active:border-b-2 active:translate-y-[4px] active:mb-[4px]";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-ui rounded-2xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive uppercase tracking-wide",
  {
    variants: {
      variant: {
        locked: `bg-neutral-200 text-neutral-500 hover:bg-neutral-200/90 border-neutral-400 ${PRESS}`,
        default: `bg-white text-slate-500 border-slate-200 border-2 hover:bg-slate-100 ${PRESS}`,
        primary: `bg-edu-blue text-white hover:bg-edu-blue/90 border-edu-blue-edge ${PRESS}`,
        primaryOutline: `bg-white text-edu-blue border-2 border-slate-200 hover:bg-slate-100 ${PRESS}`,
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: `bg-edu-green text-white hover:bg-edu-green/90 border-edu-green-edge ${PRESS}`,
        secondaryOutline: `bg-white text-edu-green border-2 border-slate-200 hover:bg-slate-100 ${PRESS}`,
        danger: `bg-edu-coral text-white hover:bg-edu-coral/90 border-edu-coral-edge ${PRESS}`,
        dangerOutline: `bg-white text-edu-coral border-2 border-slate-200 hover:bg-slate-100 ${PRESS}`,
        super: `bg-edu-grape text-white hover:bg-edu-grape/90 border-edu-grape-edge ${PRESS}`,
        superOutline: `bg-white text-edu-grape border-2 border-slate-200 hover:bg-slate-100 ${PRESS}`,
        sun: `bg-edu-sun text-edu-sun-ink hover:bg-edu-sun/90 border-edu-sun-edge ${PRESS}`,
        ghost:
          "bg-transparent text-slate-500 border-transparent border-0 hover:bg-slate-100",
        link: "text-primary underline-offset-4 hover:underline",
        sidebar:
          "bg-transparent text-slate-500 border-2 border-transparent hover:bg-slate-100 transition-none",
        sidebarOutline:
          "bg-edu-blue/10 text-edu-blue border-2 border-edu-blue hover:bg-edu-blue/15 transition-none",
      },
      size: {
        default: "h-12 px-5 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
        rounded:"rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

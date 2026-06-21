import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cn } from '@config/lib'

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex flex-col w-full",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex items-center justify-start rounded-xl p-1 text-muted-foreground h-fit",
  {
    variants: {
      variant: {
        default: "bg-muted/60 backdrop-blur-sm gap-1",
        line: "gap-3 bg-transparent border-b border-border pb-0 rounded-none",
        pills: "bg-muted/40 backdrop-blur-sm gap-2 px-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        tabsListVariants({ variant }),
        "overflow-x-auto scrollbar-thin",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        `
        relative inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-lg
        px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap
        text-muted-foreground transition-all duration-200
        hover:text-foreground hover:bg-background/50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background
        disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3 sm:[&_svg:not([class*='size-'])]:size-4
        `,
        // Active state styles
        `data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm
        data-[state=active]:hover:bg-background
        dark:data-[state=active]:bg-card dark:data-[state=active]:text-foreground
        `,
        // Underline indicator for line variant
        `group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:bottom-0
        group-data-[variant=line]/tabs-list:after:left-0 group-data-[variant=line]/tabs-list:after:right-0
        group-data-[variant=line]/tabs-list:after:h-0.5 group-data-[variant=line]/tabs-list:after:bg-primary
        group-data-[variant=line]/tabs-list:after:scale-x-0 group-data-[variant=line]/tabs-list:data-[state=active]:after:scale-x-100
        group-data-[variant=line]/tabs-list:after:transition-transform group-data-[variant=line]/tabs-list:after:duration-200
        `,
        // Pills variant
        `group-data-[variant=pills]/tabs-list:data-[state=active]:bg-primary group-data-[variant=pills]/tabs-list:data-[state=active]:text-primary-foreground
        group-data-[variant=pills]/tabs-list:data-[state=active]:hover:bg-primary/90
        `,
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 text-sm outline-none animate-in slide-up",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }

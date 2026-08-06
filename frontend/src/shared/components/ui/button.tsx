import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@config';

const buttonVariants = cva(
	`cursor-pointer group/button relative inline-flex shrink-0 items-center justify-center gap-1.5
	 rounded-lg font-medium whitespace-nowrap transition-all duration-200
	 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background
	 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
	 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20
	 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
	{
		variants: {
			variant: {
				default: `
					bg-primary text-primary-foreground
					hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5
					active:translate-y-0 active:shadow-md
					[a]:hover:bg-primary/90
				`,
				accent: `
					bg-accent text-accent-foreground
					hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5
					active:translate-y-0 active:shadow-md
					[a]:hover:bg-accent/90
				`,
				outline: `
					border-2 border-border bg-transparent text-foreground
					hover:border-primary hover:bg-primary/5 hover:text-primary
					active:bg-primary/10
					dark:border-border-strong dark:hover:border-primary
				`,
				secondary: `
					bg-secondary text-secondary-foreground
					hover:bg-secondary/80 active:bg-secondary/60
					dark:bg-secondary/80 dark:hover:bg-secondary/70
				`,
				ghost: `
					bg-transparent text-foreground
					hover:bg-muted active:bg-muted/80
					dark:hover:bg-muted/50
				`,
				unstyled: `
					bg-transparent text-inherit hover:bg-transparent
					focus-visible:border-transparent focus-visible:ring-0
				`,
				destructive: `
					bg-destructive/10 text-destructive
					hover:bg-destructive/20 active:bg-destructive/30
					focus-visible:border-destructive/40 focus-visible:ring-destructive/20
					dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40
				`,
				link: `
					text-primary underline-offset-4 hover:underline
					[&:hover]:decoration-2
				`,
			},

			size: {
				xs: `
					h-7 px-2 text-xs rounded-md
					has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5
					[&_svg:not([class*='size-'])]:size-3
				`,
				sm: `
					h-8 px-3 text-sm rounded-lg
					has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2
					[&_svg:not([class*='size-'])]:size-3.5
				`,
				default: `
					h-10 px-4 text-sm rounded-lg md:h-11 md:px-5
					has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5
				`,
				lg: `
					h-12 px-5 text-base rounded-xl md:h-14 md:px-6
					has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3
				`,
				xl: `
					h-14 px-6 text-base rounded-xl md:h-16 md:text-lg md:px-8
					has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4
				`,
				icon: 'size-10 rounded-lg md:size-12',
				'icon-xs':
					"size-7 rounded-md md:size-8 [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-8 rounded-lg md:size-10',
				'icon-lg': 'size-12 rounded-xl md:size-14',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

function Button({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : 'button';

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button };

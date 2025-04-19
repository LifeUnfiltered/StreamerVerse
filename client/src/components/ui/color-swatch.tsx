import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const colorSwatchVariants = cva(
  "inline-block rounded-full cursor-pointer hover:scale-110 transition-transform duration-200",
  {
    variants: {
      size: {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-10 w-10",
        xl: "h-12 w-12"
      },
      selected: {
        true: "ring-2 ring-primary ring-offset-2",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      selected: false
    },
  }
)

export interface ColorSwatchProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof colorSwatchVariants> {
  color: string
  title?: string
  onSelect?: () => void
}

const ColorSwatch = React.forwardRef<HTMLDivElement, ColorSwatchProps>(
  ({ className, color, size, selected, title, onSelect, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(colorSwatchVariants({ size, selected, className }))}
        style={{ backgroundColor: color }}
        title={title || color}
        onClick={onSelect}
        {...props}
      />
    )
  }
)

ColorSwatch.displayName = "ColorSwatch"

export { ColorSwatch, colorSwatchVariants }
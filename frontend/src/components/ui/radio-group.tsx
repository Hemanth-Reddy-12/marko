import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
    name: string | undefined
    value: string
    disabled: boolean
    onChange: (val: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

const RadioGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value?: string
        onValueChange?: (val: string) => void
        name?: string
        disabled?: boolean
    }
>(({ className, value, onValueChange, name, disabled = false, ...props }, ref) => {
    const ctx = React.useMemo<RadioGroupContextValue>(
        () => ({
            name,
            value: value ?? "",
            disabled,
            onChange: (v: string) => onValueChange?.(v),
        }),
        [name, value, disabled, onValueChange],
    )

    return (
        <RadioGroupContext.Provider value={ctx}>
            <div ref={ref} className={cn("grid gap-2", className)} {...props} />
        </RadioGroupContext.Provider>
    )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, value, checked, defaultChecked, onChange: onChangeProp, name: nameProp, disabled: disabledProp, ...props }, ref) => {
        const ctx = React.useContext(RadioGroupContext)
        const isChecked = ctx ? ctx.value === String(value) : checked
        const groupName = ctx?.name ?? nameProp
        const isDisabled = ctx?.disabled || disabledProp

        return (
            <input
                ref={ref}
                type="radio"
                value={value}
                checked={isChecked}
                disabled={isDisabled}
                name={groupName}
                onChange={(e) => {
                    onChangeProp?.(e)
                    if (e.target.checked && ctx) {
                        ctx.onChange(String(value))
                    }
                }}
                className={cn(
                    "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        )
    },
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }

"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-white p-2 shadow-lg rounded-lg border border-gray-200 w-auto inline-block",
        className
      )}
      classNames={{
        root: "w-fit",
        months: "flex flex-col space-y-2 relative",
        month: "space-y-2",
        month_caption: "flex justify-center pt-0 relative items-center mb-1",
        caption_label: "text-xs font-bold text-gray-800",
        nav: "flex items-center justify-between absolute w-full top-0 left-0 right-0 px-1",
        button_previous: "h-6 w-6 bg-transparent hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer text-gray-600 transition-colors z-10",
        button_next: "h-6 w-6 bg-transparent hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer text-gray-600 transition-colors z-10",
        table: "w-full border-collapse space-y-1 mt-1",
        weekdays: "flex w-full mb-1",
        weekday: "text-gray-500 font-semibold text-[0.7rem] w-7 text-center flex-1",
        week: "flex w-full mt-1 justify-between",
        day: "relative h-7 w-7 p-0 flex items-center justify-center text-center focus-within:relative focus-within:z-20",
        today: "border-2 border-blue-600 text-blue-600 font-bold rounded-full",
        outside: "text-gray-300 hover:bg-transparent cursor-default",
        disabled: "text-gray-300 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex h-7 w-7 items-center justify-center font-medium text-xs text-gray-700 transition-colors",
        "rounded-full hover:bg-gray-100 cursor-pointer",
        "data-[selected-single=true]:bg-blue-600 data-[selected-single=true]:text-white data-[selected-single=true]:hover:bg-blue-700 data-[selected-single=true]:hover:text-white data-[selected-single=true]:shadow-sm data-[selected-single=true]:font-bold",
        "group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-blue-400 group-data-[focused=true]/day:ring-offset-1",
        "data-[range-start=true]:bg-blue-600 data-[range-start=true]:text-white data-[range-end=true]:bg-blue-600 data-[range-end=true]:text-white",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }

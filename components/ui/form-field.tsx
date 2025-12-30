"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import {
  UseFormRegister,
  FieldValues,
  Path,
  Control,
  Controller,
} from "react-hook-form"

type BaseFormFieldProps = {
  label: string
  error?: string
  className?: string
  icon?: ReactNode
}

type InputFieldProps<T extends FieldValues> = BaseFormFieldProps & {
  type: "input"
  name: Path<T>
  register: UseFormRegister<T>
  placeholder?: string
  inputType?: "text" | "email" | "password" | "number"
}

type TextareaFieldProps<T extends FieldValues> = BaseFormFieldProps & {
  type: "textarea"
  name: Path<T>
  register: UseFormRegister<T>
  placeholder?: string
  rows?: number
}

type SelectFieldProps<T extends FieldValues> = BaseFormFieldProps & {
  type: "select"
  name: Path<T>
  control: Control<T>
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

// New type for custom render fields
type CustomFieldProps<T extends FieldValues> = BaseFormFieldProps & {
  type: "custom";
  name: Path<T>;
  control: Control<T>;
  render: (props: { field: ControllerRenderProps<T, Path<T>> }) => ReactNode;
}

type FormFieldProps<T extends FieldValues> =
  | InputFieldProps<T>
  | TextareaFieldProps<T>
  | SelectFieldProps<T>
  | CustomFieldProps<T> // Add CustomFieldProps to the union

export function FormField<T extends FieldValues>(props: FormFieldProps<T>) {
  const { label, error, className, icon } = props

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={props.name}>{label}</Label>
      {props.type === "input" && (
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <Input
            id={props.name}
            type={props.inputType || "text"}
            placeholder={props.placeholder}
            className={cn(
              error && "border-destructive",
              icon && "pl-10",
            )}
            {...props.register(props.name)}
          />
        </div>
      )}
      {props.type === "textarea" && (
        <Textarea
          id={props.name}
          placeholder={props.placeholder}
          rows={props.rows || 3}
          className={cn(error && "border-destructive")}
          {...props.register(props.name)}
        />
      )}
      {props.type === "select" && (
        <Controller
          name={props.name}
          control={props.control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={cn(error && "border-destructive")}>
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {props.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}
      {props.type === "custom" && ( // New rendering block for custom type
        <Controller
          name={props.name}
          control={props.control}
          render={props.render} // Render the custom component provided
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}


import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "auth-input flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

export const FormField = ({ label = "", containerClassName = "", ...rest }) => {
  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {label ? <Label className="text-lg">{label}</Label> : null}
      <Input type="text" name="firstname" {...rest} />
    </div>
  );
};

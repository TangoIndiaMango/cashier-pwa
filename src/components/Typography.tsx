import { cn } from "@/lib/utils";
import React from "react";

const Typography = ({ children, className = "", ...rest }) => {
  return (
    <p className={cn("", className)} {...rest}>
      {children}
    </p>
  );
};

export default Typography;

const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(CheckboxPrimitive.Root, {
    ref: ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className,
    ),
    ...props,
 children: 
    _jsxDEV(CheckboxPrimitive.Indicator, { className: cn("grid place-content-center text-current"), children: 
      _jsxDEV(Check, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 20}, this )
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 19}, this)
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 11}, this)
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };

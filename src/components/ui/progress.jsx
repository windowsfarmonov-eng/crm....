const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef


(({ className, value, ...props }, ref) => (
  _jsxDEV(ProgressPrimitive.Root, {
    ref: ref,
    className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
    ...props,
 children: 
    _jsxDEV(ProgressPrimitive.Indicator, {
      className: "h-full w-full flex-1 bg-primary transition-all"    ,
      style: { transform: `translateX(-${100 - (value || 0)}%)` },}, void 0, false, {fileName: _jsxFileName, lineNumber: 17}, this
    )
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 12}, this)
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

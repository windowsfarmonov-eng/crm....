const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef


(({ className, ...props }, ref) => {
  return _jsxDEV(RadioGroupPrimitive.Root, { className: cn("grid gap-2", className), ...props, ref: ref,}, void 0, false, {fileName: _jsxFileName, lineNumber: 11}, this );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef


(({ className, ...props }, ref) => {
  return (
    _jsxDEV(RadioGroupPrimitive.Item, {
      ref: ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ),
      ...props,
 children: 
      _jsxDEV(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center"  , children: 
        _jsxDEV(Circle, { className: "h-3.5 w-3.5 fill-primary"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 29}, this )
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 28}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 20}, this)
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

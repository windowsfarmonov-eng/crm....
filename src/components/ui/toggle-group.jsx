const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";


import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
});

const ToggleGroup = React.forwardRef



(({ className, variant, size, children, ...props }, ref) => (
  _jsxDEV(ToggleGroupPrimitive.Root, {
    ref: ref,
    className: cn("flex items-center justify-center gap-1", className),
    ...props,
 children: 
    _jsxDEV(ToggleGroupContext.Provider, { value: { variant, size }, children: children}, void 0, false, {fileName: _jsxFileName, lineNumber: 25}, this)
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 20}, this)
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef



(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    _jsxDEV(ToggleGroupPrimitive.Item, {
      ref: ref,
      className: cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      ),
      ...props,
 children: 
      children
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 39}, this)
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };

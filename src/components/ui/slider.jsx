const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(SliderPrimitive.Root, {
    ref: ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
 children: [
    _jsxDEV(SliderPrimitive.Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20"      , children: 
      _jsxDEV(SliderPrimitive.Range, { className: "absolute h-full bg-primary"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 16}, this )
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 15}, this)
    , _jsxDEV(SliderPrimitive.Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"             ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 18}, this )
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 10}, this)
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

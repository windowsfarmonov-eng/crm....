const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('div', {
      ref: ref,
      className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 7}, this
    )
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('div', { ref: ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 18}, this )
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('div', {
      ref: ref,
      className: cn("font-semibold leading-none tracking-tight", className),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 25}, this
    )
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('div', { ref: ref, className: cn("text-sm text-muted-foreground", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 36}, this )
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('div', { ref: ref, className: cn("p-6 pt-0", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 43}, this )
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('div', { ref: ref, className: cn("flex items-center p-6 pt-0", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 50}, this )
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

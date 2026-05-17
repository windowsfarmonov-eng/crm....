const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(SheetPrimitive.Overlay, {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    ),
    ...props,
    ref: ref,}, void 0, false, {fileName: _jsxFileName, lineNumber: 22}, this
  )
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);






const SheetContent = React.forwardRef


(({ side = "right", className, children, ...props }, ref) => (
  _jsxDEV(SheetPortal, { children: [
    _jsxDEV(SheetOverlay, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 62}, this )
    , _jsxDEV(SheetPrimitive.Content, { ref: ref, className: cn(sheetVariants({ side }), className), ...props, children: [
      _jsxDEV(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"             , children: [
        _jsxDEV(X, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 65}, this )
        , _jsxDEV('span', { className: "sr-only", children: "Close"}, void 0, false, {fileName: _jsxFileName, lineNumber: 66}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 64}, this)
      , children
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 63}, this)
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 61}, this)
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }) => (
  _jsxDEV('div', { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 75}, this )
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }) => (
  _jsxDEV('div', {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 80}, this
  )
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(SheetPrimitive.Title, {
    ref: ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 91}, this
  )
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(SheetPrimitive.Description, {
    ref: ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 103}, this
  )
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

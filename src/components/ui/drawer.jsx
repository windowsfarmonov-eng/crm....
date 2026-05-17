const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}) => (
  _jsxDEV(DrawerPrimitive.Root, { shouldScaleBackground: shouldScaleBackground, ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 10}, this )
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(DrawerPrimitive.Overlay, {
    ref: ref,
    className: cn("fixed inset-0 z-50 bg-black/80", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 24}, this
  )
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef


(({ className, children, ...props }, ref) => (
  _jsxDEV(DrawerPortal, { children: [
    _jsxDEV(DrawerOverlay, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 37}, this )
    , _jsxDEV(DrawerPrimitive.Content, {
      ref: ref,
      className: cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className,
      ),
      ...props,
 children: [
      _jsxDEV('div', { className: "mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted"     ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 46}, this )
      , children
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 38}, this)
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 36}, this)
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }) => (
  _jsxDEV('div', { className: cn("grid gap-1.5 p-4 text-center sm:text-left", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 54}, this )
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }) => (
  _jsxDEV('div', { className: cn("mt-auto flex flex-col gap-2 p-4", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 59}, this )
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(DrawerPrimitive.Title, {
    ref: ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 67}, this
  )
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(DrawerPrimitive.Description, {
    ref: ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 79}, this
  )
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef




(({ className, inset, children, ...props }, ref) => (
  _jsxDEV(DropdownMenuPrimitive.SubTrigger, {
    ref: ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className,
    ),
    ...props,
 children: [
    children
    , _jsxDEV(ChevronRight, { className: "ml-auto",}, void 0, false, {fileName: _jsxFileName, lineNumber: 37}, this )
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 27}, this)
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(DropdownMenuPrimitive.SubContent, {
    ref: ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className,
    ),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 46}, this
  )
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef


(({ className, sideOffset = 4, ...props }, ref) => (
  _jsxDEV(DropdownMenuPrimitive.Portal, { children: 
    _jsxDEV(DropdownMenuPrimitive.Content, {
      ref: ref,
      sideOffset: sideOffset,
      className: cn(
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
        className,
      ),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 62}, this
    )
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 61}, this)
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef




(({ className, inset, ...props }, ref) => (
  _jsxDEV(DropdownMenuPrimitive.Item, {
    ref: ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className,
    ),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 82}, this
  )
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef


(({ className, children, checked, ...props }, ref) => (
  _jsxDEV(DropdownMenuPrimitive.CheckboxItem, {
    ref: ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    ),
    checked: checked,
    ...props,
 children: [
    _jsxDEV('span', { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"      , children: 
      _jsxDEV(DropdownMenuPrimitive.ItemIndicator, { children: 
        _jsxDEV(Check, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 109}, this )
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 108}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 107}, this)
    , children
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 98}, this)
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef


(({ className, children, ...props }, ref) => (
  _jsxDEV(DropdownMenuPrimitive.RadioItem, {
    ref: ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    ),
    ...props,
 children: [
    _jsxDEV('span', { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"      , children: 
      _jsxDEV(DropdownMenuPrimitive.ItemIndicator, { children: 
        _jsxDEV(Circle, { className: "h-2 w-2 fill-current"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 131}, this )
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 130}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 129}, this)
    , children
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 121}, this)
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef




(({ className, inset, ...props }, ref) => (
  _jsxDEV(DropdownMenuPrimitive.Label, {
    ref: ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 145}, this
  )
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(DropdownMenuPrimitive.Separator, {
    ref: ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 157}, this
  )
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }) => {
  return (
    _jsxDEV('span', { className: cn("ml-auto text-xs tracking-widest opacity-60", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 167}, this )
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};

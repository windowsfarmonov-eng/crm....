const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef




(({ className, inset, children, ...props }, ref) => (
  _jsxDEV(ContextMenuPrimitive.SubTrigger, {
    ref: ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className,
    ),
    ...props,
 children: [
    children
    , _jsxDEV(ChevronRight, { className: "ml-auto h-4 w-4"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 35}, this )
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 25}, this)
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(ContextMenuPrimitive.SubContent, {
    ref: ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin)",
      className,
    ),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 44}, this
  )
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(ContextMenuPrimitive.Portal, { children: 
    _jsxDEV(ContextMenuPrimitive.Content, {
      ref: ref,
      className: cn(
        "z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-context-menu-content-transform-origin)",
        className,
      ),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 60}, this
    )
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 59}, this)
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef




(({ className, inset, ...props }, ref) => (
  _jsxDEV(ContextMenuPrimitive.Item, {
    ref: ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    ),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 78}, this
  )
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef


(({ className, children, checked, ...props }, ref) => (
  _jsxDEV(ContextMenuPrimitive.CheckboxItem, {
    ref: ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    ),
    checked: checked,
    ...props,
 children: [
    _jsxDEV('span', { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"      , children: 
      _jsxDEV(ContextMenuPrimitive.ItemIndicator, { children: 
        _jsxDEV(Check, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 105}, this )
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 104}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 103}, this)
    , children
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 94}, this)
));
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef


(({ className, children, ...props }, ref) => (
  _jsxDEV(ContextMenuPrimitive.RadioItem, {
    ref: ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    ),
    ...props,
 children: [
    _jsxDEV('span', { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center"      , children: 
      _jsxDEV(ContextMenuPrimitive.ItemIndicator, { children: 
        _jsxDEV(Circle, { className: "h-4 w-4 fill-current"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 127}, this )
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 126}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 125}, this)
    , children
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 117}, this)
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef




(({ className, inset, ...props }, ref) => (
  _jsxDEV(ContextMenuPrimitive.Label, {
    ref: ref,
    className: cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 141}, this
  )
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(ContextMenuPrimitive.Separator, {
    ref: ref,
    className: cn("-mx-1 my-1 h-px bg-border", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 153}, this
  )
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({ className, ...props }) => {
  return (
    _jsxDEV('span', {
      className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 163}, this
    )
  );
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

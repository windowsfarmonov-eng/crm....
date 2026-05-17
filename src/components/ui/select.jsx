const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef


(({ className, children, ...props }, ref) => (
  _jsxDEV(SelectPrimitive.Trigger, {
    ref: ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    ),
    ...props,
 children: [
    children
    , _jsxDEV(SelectPrimitive.Icon, { asChild: true, children: 
      _jsxDEV(ChevronDown, { className: "h-4 w-4 opacity-50"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 29}, this )
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 28}, this)
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 19}, this)
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(SelectPrimitive.ScrollUpButton, {
    ref: ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
 children: 
    _jsxDEV(ChevronUp, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 44}, this )
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 39}, this)
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(SelectPrimitive.ScrollDownButton, {
    ref: ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
 children: 
    _jsxDEV(ChevronDown, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 58}, this )
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 53}, this)
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef


(({ className, children, position = "popper", ...props }, ref) => (
  _jsxDEV(SelectPrimitive.Portal, { children: 
    _jsxDEV(SelectPrimitive.Content, {
      ref: ref,
      className: cn(
        "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      ),
      position: position,
      ...props,
 children: [
      _jsxDEV(SelectScrollUpButton, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 79}, this )
      , _jsxDEV(SelectPrimitive.Viewport, {
        className: cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        ),
 children: 
        children
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 80}, this)
      , _jsxDEV(SelectScrollDownButton, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 89}, this )
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 68}, this)
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 67}, this)
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(SelectPrimitive.Label, {
    ref: ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 99}, this
  )
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef


(({ className, children, ...props }, ref) => (
  _jsxDEV(SelectPrimitive.Item, {
    ref: ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    ),
    ...props,
 children: [
    _jsxDEV('span', { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center"      , children: 
      _jsxDEV(SelectPrimitive.ItemIndicator, { children: 
        _jsxDEV(Check, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 121}, this )
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 120}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 119}, this)
    , _jsxDEV(SelectPrimitive.ItemText, { children: children}, void 0, false, {fileName: _jsxFileName, lineNumber: 124}, this)
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 111}, this)
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(SelectPrimitive.Separator, {
    ref: ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 133}, this
  )
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

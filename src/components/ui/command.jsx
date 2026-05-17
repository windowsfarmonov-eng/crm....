const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";"use client";

import * as React from "react";

import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(CommandPrimitive, {
    ref: ref,
    className: cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className,
    ),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 15}, this
  )
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }) => {
  return (
    _jsxDEV(Dialog, { ...props, children: 
      _jsxDEV(DialogContent, { className: "overflow-hidden p-0" , children: 
        _jsxDEV(Command, { className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"           , children: 
          children
        }, void 0, false, {fileName: _jsxFileName, lineNumber: 30}, this)
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 29}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 28}, this)
  );
};

const CommandInput = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV('div', { className: "flex items-center border-b px-3"   , 'cmdk-input-wrapper': "", children: [
    _jsxDEV(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50"    ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 43}, this )
    , _jsxDEV(CommandPrimitive.Input, {
      ref: ref,
      className: cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 44}, this
    )
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 42}, this)
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(CommandPrimitive.List, {
    ref: ref,
    className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 61}, this
  )
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef


((props, ref) => (
  _jsxDEV(CommandPrimitive.Empty, { ref: ref, className: "py-6 text-center text-sm"  , ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 74}, this )
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(CommandPrimitive.Group, {
    ref: ref,
    className: cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className,
    ),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 83}, this
  )
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(CommandPrimitive.Separator, {
    ref: ref,
    className: cn("-mx-1 h-px bg-border", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 99}, this
  )
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(CommandPrimitive.Item, {
    ref: ref,
    className: cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className,
    ),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 111}, this
  )
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }) => {
  return (
    _jsxDEV('span', {
      className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 125}, this
    )
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

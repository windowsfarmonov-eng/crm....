const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV(AccordionPrimitive.Item, { ref: ref, className: cn("border-b", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 13}, this )
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef


(({ className, children, ...props }, ref) => (
  _jsxDEV(AccordionPrimitive.Header, { className: "flex", children: 
    _jsxDEV(AccordionPrimitive.Trigger, {
      ref: ref,
      className: cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className,
      ),
      ...props,
 children: [
      children
      , _jsxDEV(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"     ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 31}, this )
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 22}, this)
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 21}, this)
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef


(({ className, children, ...props }, ref) => (
  _jsxDEV(AccordionPrimitive.Content, {
    ref: ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"   ,
    ...props,
 children: 
    _jsxDEV('div', { className: cn("pb-4 pt-0", className), children: children}, void 0, false, {fileName: _jsxFileName, lineNumber: 46}, this)
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 41}, this)
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }) => (
  _jsxDEV('nav', {
    role: "navigation",
    'aria-label': "pagination",
    className: cn("mx-auto flex w-full justify-center", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 8}, this
  )
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('ul', { ref: ref, className: cn("flex flex-row items-center gap-1", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 19}, this )
  ),
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef(
  ({ className, ...props }, ref) => _jsxDEV('li', { ref: ref, className: cn("", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 25}, this ),
);
PaginationItem.displayName = "PaginationItem";






const PaginationLink = ({ className, isActive, size = "icon", ...props }) => (
  _jsxDEV('a', {
    'aria-current': isActive ? "page" : undefined,
    className: cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    ),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 35}, this
  )
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}) => (
  _jsxDEV(PaginationLink, {
    'aria-label': "Go to previous page"   ,
    size: "default",
    className: cn("gap-1 pl-2.5", className),
    ...props,
 children: [
    _jsxDEV(ChevronLeft, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 59}, this )
    , _jsxDEV('span', { children: "Previous"}, void 0, false, {fileName: _jsxFileName, lineNumber: 60}, this)
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 53}, this)
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, ...props }) => (
  _jsxDEV(PaginationLink, {
    'aria-label': "Go to next page"   ,
    size: "default",
    className: cn("gap-1 pr-2.5", className),
    ...props,
 children: [
    _jsxDEV('span', { children: "Next"}, void 0, false, {fileName: _jsxFileName, lineNumber: 72}, this)
    , _jsxDEV(ChevronRight, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 73}, this )
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 66}, this)
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }) => (
  _jsxDEV('span', {
    'aria-hidden': true,
    className: cn("flex h-9 w-9 items-center justify-center", className),
    ...props,
 children: [
    _jsxDEV(MoreHorizontal, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 84}, this )
    , _jsxDEV('span', { className: "sr-only", children: "More pages" }, void 0, false, {fileName: _jsxFileName, lineNumber: 85}, this)
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 79}, this)
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

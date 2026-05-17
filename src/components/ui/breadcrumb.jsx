const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime"; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef




(({ ...props }, ref) => _jsxDEV('nav', { ref: ref, 'aria-label': "breadcrumb", ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 12}, this ));
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('ol', {
      ref: ref,
      className: cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
        className,
      ),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 17}, this
    )
  ),
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('li', { ref: ref, className: cn("inline-flex items-center gap-1.5", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 31}, this )
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef




(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    _jsxDEV(Comp, {
      ref: ref,
      className: cn("transition-colors hover:text-foreground", className),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 45}, this
    )
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('span', {
      ref: ref,
      role: "link",
      'aria-disabled': "true",
      'aria-current': "page",
      className: cn("font-normal text-foreground", className),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 56}, this
    )
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }) => (
  _jsxDEV('li', {
    role: "presentation",
    'aria-hidden': "true",
    className: cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className),
    ...props,
 children: 
    _nullishCoalesce(children, () => ( _jsxDEV(ChevronRight, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 75}, this )))
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 69}, this)
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({ className, ...props }) => (
  _jsxDEV('span', {
    role: "presentation",
    'aria-hidden': "true",
    className: cn("flex h-9 w-9 items-center justify-center", className),
    ...props,
 children: [
    _jsxDEV(MoreHorizontal, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 87}, this )
    , _jsxDEV('span', { className: "sr-only", children: "More"}, void 0, false, {fileName: _jsxFileName, lineNumber: 88}, this)
  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 81}, this)
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

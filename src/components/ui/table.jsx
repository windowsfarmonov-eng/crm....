const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('div', { className: "relative w-full overflow-auto"  , children: 
      _jsxDEV('table', { ref: ref, className: cn("w-full caption-bottom text-sm", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 8}, this )
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 7}, this)
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV('thead', { ref: ref, className: cn("[&_tr]:border-b", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 18}, this )
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV('tbody', { ref: ref, className: cn("[&_tr:last-child]:border-0", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 26}, this )
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV('tfoot', {
    ref: ref,
    className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 34}, this
  )
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef(
  ({ className, ...props }, ref) => (
    _jsxDEV('tr', {
      ref: ref,
      className: cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      ),
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 44}, this
    )
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV('th', {
    ref: ref,
    className: cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    ),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 60}, this
  )
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV('td', {
    ref: ref,
    className: cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    ),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 75}, this
  )
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef


(({ className, ...props }, ref) => (
  _jsxDEV('caption', { ref: ref, className: cn("mt-4 text-sm text-muted-foreground", className), ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 90}, this )
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      _jsxDEV('textarea', {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        ),
        ref: ref,
        ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 8}, this
      )
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

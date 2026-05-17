const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }) => (
  _jsxDEV(Group, {
    className: cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className),
    ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 7}, this
  )
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}

) => (
  _jsxDEV(Separator, {
    className: cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    ),
    ...props,
 children: 
    withHandle && (
      _jsxDEV('div', { className: "z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border"        , children: 
        _jsxDEV(GripVertical, { className: "h-2.5 w-2.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 31}, this )
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 30}, this)
    )
  }, void 0, false, {fileName: _jsxFileName, lineNumber: 22}, this)
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

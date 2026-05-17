const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import { Toaster as Sonner } from "sonner";



const Toaster = ({ ...props }) => {
  return (
    _jsxDEV(Sonner, {
      className: "toaster group" ,
      toastOptions: {
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      },
      ...props,}, void 0, false, {fileName: _jsxFileName, lineNumber: 7}, this
    )
  );
};

export { Toaster };

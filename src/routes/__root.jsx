const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "react/jsx-dev-runtime";import { QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    _jsxDEV('div', { className: "flex min-h-screen items-center justify-center bg-background px-4"     , children: 
      _jsxDEV('div', { className: "max-w-md text-center" , children: [
        _jsxDEV('h1', { className: "text-7xl font-bold text-foreground"  , children: "404"}, void 0, false, {fileName: _jsxFileName, lineNumber: 17}, this)
        , _jsxDEV('h2', { className: "mt-4 text-xl font-semibold text-foreground"   , children: "Page not found"  }, void 0, false, {fileName: _jsxFileName, lineNumber: 18}, this)
        , _jsxDEV('p', { className: "mt-2 text-sm text-muted-foreground"  , children: "The page you're looking for doesn't exist or has been moved."

        }, void 0, false, {fileName: _jsxFileName, lineNumber: 19}, this)
        , _jsxDEV('div', { className: "mt-6", children: 
          _jsxDEV(Link, {
            to: "/",
            className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"           ,
 children: "Go home"

          }, void 0, false, {fileName: _jsxFileName, lineNumber: 23}, this)
        }, void 0, false, {fileName: _jsxFileName, lineNumber: 22}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 16}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 15}, this)
  );
}

function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();

  return (
    _jsxDEV('div', { className: "flex min-h-screen items-center justify-center bg-background px-4"     , children: 
      _jsxDEV('div', { className: "max-w-md text-center" , children: [
        _jsxDEV('h1', { className: "text-xl font-semibold tracking-tight text-foreground"   , children: "This page didn't load"

        }, void 0, false, {fileName: _jsxFileName, lineNumber: 42}, this)
        , _jsxDEV('p', { className: "mt-2 text-sm text-muted-foreground"  , children: "Something went wrong on our end. You can try refreshing or head back home."

        }, void 0, false, {fileName: _jsxFileName, lineNumber: 45}, this)
        , _jsxDEV('div', { className: "mt-6 flex flex-wrap justify-center gap-2"    , children: [
          _jsxDEV('button', {
            onClick: () => {
              router.invalidate();
              reset();
            },
            className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"           ,
 children: "Try again"

          }, void 0, false, {fileName: _jsxFileName, lineNumber: 49}, this)
          , _jsxDEV('a', {
            href: "/",
            className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"             ,
 children: "Go home"

          }, void 0, false, {fileName: _jsxFileName, lineNumber: 58}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 48}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 41}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 40}, this)
  );
}

export const Route = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }) {
  return (
    _jsxDEV('html', { lang: "en", children: [
      _jsxDEV('head', { children: 
        _jsxDEV(HeadContent, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 101}, this )
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 100}, this)
      , _jsxDEV('body', { children: [
        children
        , _jsxDEV(Scripts, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 105}, this )
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 103}, this)
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 99}, this)
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    _jsxDEV(QueryClientProvider, { client: queryClient, children: 
      _jsxDEV(Outlet, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 116}, this )
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 115}, this)
  );
}

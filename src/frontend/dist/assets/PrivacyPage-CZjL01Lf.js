import { w as createLucideIcon, r as reactExports, l as jsxRuntimeExports, Z as cn, e as useAuth, u as useNavigate, az as getUserCases, aA as getUserKycSubmissions, aB as getUserDeposits, p as ue, aC as deleteUserAccount } from "./main-Cdc0HMQw.js";
import { L as Layout } from "./Layout-DA0EcIPU.js";
import { c as createContextScope } from "./index-B_8kvyaA.js";
import { u as useComposedRefs, b as buttonVariants, B as Button } from "./button-M4vBmj7v.js";
import { e as DialogPortal, f as DialogOverlay, g as createDialogScope, D as Dialog, h as DialogTrigger, a as DialogContent, c as DialogTitle, d as DialogDescription, b as DialogClose } from "./index-BNq8usRL.js";
import { c as composeEventHandlers } from "./index-YZdZHzDf.js";
import { I as Input } from "./input-DWT-VTa6.js";
import { b as Lock } from "./message-circle-_f6w5SHu.js";
import { D as Download } from "./download-Kd0HD0rR.js";
import { T as Trash2 } from "./trash-2-CcpdV9Db.js";
import "./users-DNTUunjV.js";
import "./x-DexM1Xlt.js";
import "./heart-Bgucrxac.js";
import "./Combination-auFtYQN_.js";
import "./index-CY-UUOos.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Database = createLucideIcon("Database", [
  ["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }],
  ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }],
  ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]
]);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var ROOT_NAME = "AlertDialog";
var [createAlertDialogContext, createAlertDialogScope] = createContextScope(ROOT_NAME, [
  createDialogScope
]);
var useDialogScope = createDialogScope();
var AlertDialog$1 = /* @__PURE__ */ __name((props) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { ...dialogScope, ...alertDialogProps, modal: true });
}, "AlertDialog");
var AlertDialogTrigger$1 = reactExports.forwardRef(
  /* @__PURE__ */ __name(function AlertDialogTrigger2(props, forwardedRef) {
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { ...dialogScope, ...triggerProps, ref: forwardedRef });
  }, "AlertDialogTrigger")
);
var AlertDialogPortal$1 = /* @__PURE__ */ __name((props) => {
  const { __scopeAlertDialog, ...portalProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogPortal, { ...dialogScope, ...portalProps });
}, "AlertDialogPortal");
var AlertDialogOverlay$1 = reactExports.forwardRef(
  /* @__PURE__ */ __name(function AlertDialogOverlay2(props, forwardedRef) {
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, { ...dialogScope, ...overlayProps, ref: forwardedRef });
  }, "AlertDialogOverlay")
);
var CONTENT_NAME = "AlertDialogContent";
var [AlertDialogContentProvider, useAlertDialogContentContext] = createAlertDialogContext(CONTENT_NAME);
var AlertDialogContent$1 = reactExports.forwardRef(
  /* @__PURE__ */ __name(function AlertDialogContent2(props, forwardedRef) {
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const cancelRef = reactExports.useRef(null);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogContentProvider, { scope: __scopeAlertDialog, cancelRef, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContent,
      {
        role: "alertdialog",
        ...dialogScope,
        ...contentProps,
        ref: composedRefs,
        onOpenAutoFocus: composeEventHandlers(contentProps.onOpenAutoFocus, (event) => {
          var _a;
          event.preventDefault();
          (_a = cancelRef.current) == null ? void 0 : _a.focus({ preventScroll: true });
        }),
        onPointerDownOutside: (event) => event.preventDefault(),
        onInteractOutside: (event) => event.preventDefault(),
        children
      }
    ) });
  }, "AlertDialogContent")
);
var AlertDialogTitle$1 = reactExports.forwardRef(
  /* @__PURE__ */ __name(function AlertDialogTitle2(props, forwardedRef) {
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { ...dialogScope, ...titleProps, ref: forwardedRef });
  }, "AlertDialogTitle")
);
var AlertDialogDescription$1 = reactExports.forwardRef(/* @__PURE__ */ __name(function AlertDialogDescription2(props, forwardedRef) {
  const { __scopeAlertDialog, ...descriptionProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { ...dialogScope, ...descriptionProps, ref: forwardedRef });
}, "AlertDialogDescription"));
var AlertDialogAction$1 = reactExports.forwardRef(
  /* @__PURE__ */ __name(function AlertDialogAction2(props, forwardedRef) {
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogClose, { ...dialogScope, ...actionProps, ref: forwardedRef });
  }, "AlertDialogAction")
);
var CANCEL_NAME = "AlertDialogCancel";
var AlertDialogCancel$1 = reactExports.forwardRef(
  /* @__PURE__ */ __name(function AlertDialogCancel2(props, forwardedRef) {
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogClose, { ...dialogScope, ...cancelProps, ref });
  }, "AlertDialogCancel")
);
var Root2 = AlertDialog$1;
var Trigger2 = AlertDialogTrigger$1;
var Portal2 = AlertDialogPortal$1;
var Overlay2 = AlertDialogOverlay$1;
var Content2 = AlertDialogContent$1;
var Action = AlertDialogAction$1;
var Cancel = AlertDialogCancel$1;
var Title2 = AlertDialogTitle$1;
var Description2 = AlertDialogDescription$1;
function AlertDialog({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { "data-slot": "alert-dialog", ...props });
}
function AlertDialogTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger2, { "data-slot": "alert-dialog-trigger", ...props });
}
function AlertDialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { "data-slot": "alert-dialog-portal", ...props });
}
function AlertDialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Overlay2,
    {
      "data-slot": "alert-dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function AlertDialogContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Content2,
      {
        "data-slot": "alert-dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props
      }
    )
  ] });
}
function AlertDialogHeader({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert-dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function AlertDialogFooter({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "alert-dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function AlertDialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Title2,
    {
      "data-slot": "alert-dialog-title",
      className: cn("text-lg font-semibold", className),
      ...props
    }
  );
}
function AlertDialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Description2,
    {
      "data-slot": "alert-dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function AlertDialogAction({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Action,
    {
      className: cn(buttonVariants(), className),
      ...props
    }
  );
}
function AlertDialogCancel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Cancel,
    {
      className: cn(buttonVariants({ variant: "outline" }), className),
      ...props
    }
  );
}
function PrivacyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteConfirmText, setDeleteConfirmText] = reactExports.useState("");
  const [deleting, setDeleting] = reactExports.useState(false);
  async function handleDataDownload() {
    if (!user) return;
    try {
      const [cases, kyc, deposits] = await Promise.all([
        getUserCases(user.id),
        getUserKycSubmissions(user.id),
        getUserDeposits(user.id)
      ]);
      const myData = {
        account: { id: user.id, email: user.email, name: user.fullName },
        kyc_submissions: kyc,
        cases,
        deposits,
        exported_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const blob = new Blob([JSON.stringify(myData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `givethra-my-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      ue.success("Your data has been downloaded.");
    } catch {
      ue.error("Failed to download data.");
    }
  }
  async function handleAccountDeletion() {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUserAccount(user.id);
      ue.success("Your account data has been deleted. Signing out...");
      setTimeout(async () => {
        await logout();
        navigate({ to: "/" });
      }, 2e3);
    } catch {
      ue.error("Failed to delete account. Please contact support.");
    } finally {
      setDeleting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl mx-auto px-4 pt-6 pb-28", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Privacy & Account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Your Data" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-muted/40 border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mb-1", children: "Download Your Data" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "Download a copy of all your account data (cases, KYC, deposits)." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              onClick: handleDataDownload,
              className: "gap-2 border-primary text-primary hover:bg-primary/10",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
                " Download My Data"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-5 w-5 text-red-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Delete Account" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mb-1", children: "Delete Your Account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "This permanently deletes your account and all your data. This cannot be undone." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
              " Delete Account"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete your account?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                  "This permanently deletes your account and all data. Type ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "DELETE" }),
                  " to confirm."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "text",
                  value: deleteConfirmText,
                  onChange: (e) => setDeleteConfirmText(e.target.value),
                  placeholder: "Type DELETE to confirm"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { onClick: () => setDeleteConfirmText(""), children: "Cancel" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  AlertDialogAction,
                  {
                    disabled: deleteConfirmText !== "DELETE" || deleting,
                    onClick: handleAccountDeletion,
                    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50",
                    children: deleting ? "Deleting..." : "Delete My Account"
                  }
                )
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground text-center border-t border-border pt-4", children: "⚠️ Password change is not available because you sign in with Google." })
    ] })
  ] }) });
}
export {
  PrivacyPage as default
};

import { w as createLucideIcon, l as jsxRuntimeExports, Z as cn, r as reactExports, e as useAuth, f as useRole, u as useNavigate, K as useLocation, D as getKycSubmission, a as getProfile, _ as getProfileStats, p as ue, H as HeartHandshake, q as unfollowUser, t as followUser, $ as getFollowList, a0 as removeRequester, W as Wallet } from "./main-EspZtMZv.js";
import { L as Layout, K as KeyRound, S as Settings } from "./Layout-wYZkEQhc.js";
import { u as useComposedRefs, c as createSlottable, B as Button } from "./button-BrpTixLc.js";
import { D as Dialog$1, a as DialogContent$1, b as DialogClose, c as DialogTitle$1, d as DialogDescription$1, e as DialogPortal$1, f as DialogOverlay$1 } from "./index-dOB7DDcz.js";
import { X } from "./x-Br49mtL5.js";
import { u as useId, a as useControllableState, c as composeEventHandlers, P as Presence } from "./index-D1NJSY4H.js";
import { c as createContextScope, u as useLayoutEffect2 } from "./index-BjBsYUTf.js";
import { P as Portal$1, D as DismissableLayer } from "./Combination-BHE4JWne.js";
import { c as createPopperScope, R as Root2, A as Anchor, C as Content, a as Root, b as Arrow } from "./index-C_XxiJMd.js";
import { P as Primitive } from "./index-o8esZfzI.js";
import { a as isTrulyCompletedHelp, i as isContributionResolution } from "./resolutionStatus-DHDdhFyW.js";
import { a as Mail, M as MessageCircle, B as Bell, b as Lock } from "./message-circle-CqePZOv0.js";
import { P as Phone } from "./phone-CT9V1oKs.js";
import { S as ShieldCheck } from "./shield-check-CZNKdetk.js";
import { B as Building2 } from "./building-2-BVCM5BrX.js";
import { C as CircleAlert } from "./circle-alert-CI1fNXYv.js";
import { I as Info } from "./info-fWeUAJ7J.js";
import { M as MapPin } from "./map-pin-C91oi1yI.js";
import { C as Calendar } from "./calendar-BlVo-Q3F.js";
import { C as CircleCheck } from "./circle-check-BPQn3gNr.js";
import { U as Users } from "./users-_6SD4cVf.js";
import { G as Gift } from "./gift-DyaKI6CV.js";
import { H as HandCoins } from "./hand-coins-Dd8RmQaF.js";
import { L as LockOpen } from "./lock-open-CgD6KL-6.js";
import { B as Briefcase } from "./briefcase-DIMctxKh.js";
import { C as CircleX } from "./circle-x-B0-Jayhr.js";
import { C as ChevronRight } from "./chevron-right-DE7rAWWI.js";
import { L as LogOut } from "./log-out-Dk8IJhut.js";
import { T as Trophy } from "./trophy-DYwusUEv.js";
import { A as Award } from "./award-CvDb9yK1.js";
import { S as Sparkles } from "./sparkles-ByTMfb-G.js";
import "./heart-CaEhMUxo.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Circle = createLucideIcon("Circle", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ellipsis = createLucideIcon("Ellipsis", [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
  ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pencil = createLucideIcon("Pencil", [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pin = createLucideIcon("Pin", [
  ["path", { d: "M12 17v5", key: "bb1du9" }],
  [
    "path",
    {
      d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
      key: "1nkz8b"
    }
  ]
]);
function Dialog({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog$1, { "data-slot": "dialog", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogPortal$1, { "data-slot": "dialog-portal", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogOverlay$1,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogContent$1,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props,
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DialogClose,
            {
              "data-slot": "dialog-close",
              className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogTitle$1,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-semibold", className),
      ...props
    }
  );
}
function DialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogDescription$1,
    {
      "data-slot": "dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var [createTooltipContext, createTooltipScope] = createContextScope("Tooltip", [
  createPopperScope
]);
var usePopperScope = createPopperScope();
var PROVIDER_NAME = "TooltipProvider";
var DEFAULT_DELAY_DURATION = 700;
var TOOLTIP_OPEN = "tooltip.open";
var [TooltipProviderContextProvider, useTooltipProviderContext] = createTooltipContext(PROVIDER_NAME);
var TooltipProvider$1 = /* @__PURE__ */ __name((props) => {
  const {
    __scopeTooltip,
    delayDuration = DEFAULT_DELAY_DURATION,
    skipDelayDuration = 300,
    disableHoverableContent = false,
    children
  } = props;
  const isOpenDelayedRef = reactExports.useRef(true);
  const isPointerInTransitRef = reactExports.useRef(false);
  const skipDelayTimerRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    const skipDelayTimer = skipDelayTimerRef.current;
    return () => window.clearTimeout(skipDelayTimer);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TooltipProviderContextProvider,
    {
      scope: __scopeTooltip,
      isOpenDelayedRef,
      delayDuration,
      onOpen: reactExports.useCallback(() => {
        if (skipDelayDuration <= 0) return;
        window.clearTimeout(skipDelayTimerRef.current);
        isOpenDelayedRef.current = false;
      }, [skipDelayDuration]),
      onClose: reactExports.useCallback(() => {
        if (skipDelayDuration <= 0) return;
        window.clearTimeout(skipDelayTimerRef.current);
        skipDelayTimerRef.current = window.setTimeout(
          () => isOpenDelayedRef.current = true,
          skipDelayDuration
        );
      }, [skipDelayDuration]),
      isPointerInTransitRef,
      onPointerInTransitChange: reactExports.useCallback((inTransit) => {
        isPointerInTransitRef.current = inTransit;
      }, []),
      disableHoverableContent,
      children
    }
  );
}, "TooltipProvider");
var TOOLTIP_NAME = "Tooltip";
var [TooltipContextProvider, useTooltipContext] = createTooltipContext(TOOLTIP_NAME);
var Tooltip$1 = /* @__PURE__ */ __name((props) => {
  const {
    __scopeTooltip,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    disableHoverableContent: disableHoverableContentProp,
    delayDuration: delayDurationProp
  } = props;
  const providerContext = useTooltipProviderContext(TOOLTIP_NAME, props.__scopeTooltip);
  const popperScope = usePopperScope(__scopeTooltip);
  const [trigger, setTrigger] = reactExports.useState(null);
  const [contentIdState, setContentId] = reactExports.useState(void 0);
  const generatedContentId = useId();
  const openTimerRef = reactExports.useRef(0);
  const disableHoverableContent = disableHoverableContentProp ?? providerContext.disableHoverableContent;
  const delayDuration = delayDurationProp ?? providerContext.delayDuration;
  const wasOpenDelayedRef = reactExports.useRef(false);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: /* @__PURE__ */ __name((open2) => {
      if (open2) {
        providerContext.onOpen();
        document.dispatchEvent(new CustomEvent(TOOLTIP_OPEN));
      } else {
        providerContext.onClose();
      }
      onOpenChange == null ? void 0 : onOpenChange(open2);
    }, "onChange"),
    caller: TOOLTIP_NAME
  });
  const stateAttribute = reactExports.useMemo(() => {
    return open ? wasOpenDelayedRef.current ? "delayed-open" : "instant-open" : "closed";
  }, [open]);
  const handleOpen = reactExports.useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = 0;
    wasOpenDelayedRef.current = false;
    setOpen(true);
  }, [setOpen]);
  const handleClose = reactExports.useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = 0;
    setOpen(false);
  }, [setOpen]);
  const handleDelayedOpen = reactExports.useCallback(() => {
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = window.setTimeout(() => {
      wasOpenDelayedRef.current = true;
      setOpen(true);
      openTimerRef.current = 0;
    }, delayDuration);
  }, [delayDuration, setOpen]);
  reactExports.useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        window.clearTimeout(openTimerRef.current);
        openTimerRef.current = 0;
      }
    };
  }, []);
  const contentId = contentIdState ?? generatedContentId;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    TooltipContextProvider,
    {
      scope: __scopeTooltip,
      contentId,
      setContentId,
      open,
      stateAttribute,
      trigger,
      onTriggerChange: setTrigger,
      onTriggerEnter: reactExports.useCallback(() => {
        if (providerContext.isOpenDelayedRef.current) handleDelayedOpen();
        else handleOpen();
      }, [providerContext.isOpenDelayedRef, handleDelayedOpen, handleOpen]),
      onTriggerLeave: reactExports.useCallback(() => {
        if (disableHoverableContent) {
          handleClose();
        } else {
          window.clearTimeout(openTimerRef.current);
          openTimerRef.current = 0;
        }
      }, [handleClose, disableHoverableContent]),
      onOpen: handleOpen,
      onClose: handleClose,
      disableHoverableContent,
      children
    }
  ) });
}, "Tooltip");
var TRIGGER_NAME = "TooltipTrigger";
var TooltipTrigger$1 = /* @__PURE__ */ reactExports.forwardRef(
  /* @__PURE__ */ __name(function TooltipTrigger2(props, forwardedRef) {
    const { __scopeTooltip, ...triggerProps } = props;
    const context = useTooltipContext(TRIGGER_NAME, __scopeTooltip);
    const providerContext = useTooltipProviderContext(TRIGGER_NAME, __scopeTooltip);
    const popperScope = usePopperScope(__scopeTooltip);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref, context.onTriggerChange);
    const isPointerDownRef = reactExports.useRef(false);
    const hasPointerMoveOpenedRef = reactExports.useRef(false);
    const handlePointerUp = reactExports.useCallback(() => isPointerDownRef.current = false, []);
    reactExports.useEffect(() => {
      return () => document.removeEventListener("pointerup", handlePointerUp);
    }, [handlePointerUp]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { asChild: true, ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        "aria-describedby": context.open ? context.contentId : void 0,
        "data-state": context.stateAttribute,
        ...triggerProps,
        ref: composedRefs,
        onPointerMove: composeEventHandlers(props.onPointerMove, (event) => {
          if (event.pointerType === "touch") return;
          if (!hasPointerMoveOpenedRef.current && !providerContext.isPointerInTransitRef.current) {
            context.onTriggerEnter();
            hasPointerMoveOpenedRef.current = true;
          }
        }),
        onPointerLeave: composeEventHandlers(props.onPointerLeave, () => {
          context.onTriggerLeave();
          hasPointerMoveOpenedRef.current = false;
        }),
        onPointerDown: composeEventHandlers(props.onPointerDown, () => {
          if (context.open) {
            context.onClose();
          }
          isPointerDownRef.current = true;
          document.addEventListener("pointerup", handlePointerUp, { once: true });
        }),
        onFocus: composeEventHandlers(props.onFocus, () => {
          if (!isPointerDownRef.current) context.onOpen();
        }),
        onBlur: composeEventHandlers(props.onBlur, context.onClose),
        onClick: composeEventHandlers(props.onClick, context.onClose)
      }
    ) });
  }, "TooltipTrigger")
);
var PORTAL_NAME = "TooltipPortal";
var [PortalProvider, usePortalContext] = createTooltipContext(PORTAL_NAME, {
  forceMount: void 0
});
var TooltipPortal = /* @__PURE__ */ __name((props) => {
  const { __scopeTooltip, forceMount, children, container } = props;
  const context = useTooltipContext(PORTAL_NAME, __scopeTooltip);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: __scopeTooltip, forceMount, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { asChild: true, container, children }) }) });
}, "TooltipPortal");
var CONTENT_NAME = "TooltipContent";
var TooltipContent$1 = /* @__PURE__ */ reactExports.forwardRef(
  /* @__PURE__ */ __name(function TooltipContent2(props, forwardedRef) {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeTooltip);
    const { forceMount = portalContext.forceMount, side = "top", ...contentProps } = props;
    const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: context.disableHoverableContent ? /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentImpl, { side, ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentHoverable, { side, ...contentProps, ref: forwardedRef }) });
  }, "TooltipContent")
);
var TooltipContentHoverable = /* @__PURE__ */ reactExports.forwardRef(/* @__PURE__ */ __name(function TooltipContentHoverable2(props, forwardedRef) {
  const context = useTooltipContext(CONTENT_NAME, props.__scopeTooltip);
  const providerContext = useTooltipProviderContext(CONTENT_NAME, props.__scopeTooltip);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const [pointerGraceArea, setPointerGraceArea] = reactExports.useState(null);
  const { trigger, onClose } = context;
  const content = ref.current;
  const { onPointerInTransitChange } = providerContext;
  const handleRemoveGraceArea = reactExports.useCallback(() => {
    setPointerGraceArea(null);
    onPointerInTransitChange(false);
  }, [onPointerInTransitChange]);
  const handleCreateGraceArea = reactExports.useCallback(
    (event, hoverTarget) => {
      const currentTarget = event.currentTarget;
      const exitPoint = { x: event.clientX, y: event.clientY };
      const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
      const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide);
      const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect());
      const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
      setPointerGraceArea(graceArea);
      onPointerInTransitChange(true);
    },
    [onPointerInTransitChange]
  );
  reactExports.useEffect(() => {
    return () => handleRemoveGraceArea();
  }, [handleRemoveGraceArea]);
  reactExports.useEffect(() => {
    if (trigger && content) {
      const handleTriggerLeave = /* @__PURE__ */ __name((event) => handleCreateGraceArea(event, content), "handleTriggerLeave");
      const handleContentLeave = /* @__PURE__ */ __name((event) => handleCreateGraceArea(event, trigger), "handleContentLeave");
      trigger.addEventListener("pointerleave", handleTriggerLeave);
      content.addEventListener("pointerleave", handleContentLeave);
      return () => {
        trigger.removeEventListener("pointerleave", handleTriggerLeave);
        content.removeEventListener("pointerleave", handleContentLeave);
      };
    }
  }, [trigger, content, handleCreateGraceArea, handleRemoveGraceArea]);
  reactExports.useEffect(() => {
    if (pointerGraceArea) {
      const handleTrackPointerGrace = /* @__PURE__ */ __name((event) => {
        const target = event.target;
        const pointerPosition = { x: event.clientX, y: event.clientY };
        const hasEnteredTarget = (trigger == null ? void 0 : trigger.contains(target)) || (content == null ? void 0 : content.contains(target));
        const isPointerOutsideGraceArea = !isPointInPolygon(pointerPosition, pointerGraceArea);
        if (hasEnteredTarget) {
          handleRemoveGraceArea();
        } else if (isPointerOutsideGraceArea) {
          handleRemoveGraceArea();
          onClose();
        }
      }, "handleTrackPointerGrace");
      document.addEventListener("pointermove", handleTrackPointerGrace);
      return () => document.removeEventListener("pointermove", handleTrackPointerGrace);
    }
  }, [trigger, content, pointerGraceArea, onClose, handleRemoveGraceArea]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContentImpl, { ...props, ref: composedRefs });
}, "TooltipContentHoverable"));
var Slottable = createSlottable("TooltipContent");
var TooltipContentImpl = /* @__PURE__ */ reactExports.forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name(function TooltipContentImpl2(props, forwardedRef) {
    const {
      __scopeTooltip,
      children,
      "aria-label": ariaLabel,
      id: idProp,
      onEscapeKeyDown,
      onPointerDownOutside,
      ...contentProps
    } = props;
    const context = useTooltipContext(CONTENT_NAME, __scopeTooltip);
    const popperScope = usePopperScope(__scopeTooltip);
    const { onClose } = context;
    reactExports.useEffect(() => {
      document.addEventListener(TOOLTIP_OPEN, onClose);
      return () => document.removeEventListener(TOOLTIP_OPEN, onClose);
    }, [onClose]);
    reactExports.useEffect(() => {
      if (context.trigger) {
        const handleScroll = /* @__PURE__ */ __name((event) => {
          if (event.target instanceof Node && event.target.contains(context.trigger)) {
            onClose();
          }
        }, "handleScroll");
        window.addEventListener("scroll", handleScroll, { capture: true });
        return () => window.removeEventListener("scroll", handleScroll, { capture: true });
      }
    }, [context.trigger, onClose]);
    const { setContentId } = context;
    useLayoutEffect2(() => {
      setContentId(idProp);
      return () => {
        setContentId(void 0);
      };
    }, [idProp, setContentId]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DismissableLayer,
      {
        asChild: true,
        disableOutsidePointerEvents: false,
        onEscapeKeyDown,
        onPointerDownOutside,
        onFocusOutside: (event) => event.preventDefault(),
        onDismiss: onClose,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Content,
          {
            "data-state": context.stateAttribute,
            role: ariaLabel ? void 0 : "tooltip",
            id: ariaLabel ? void 0 : context.contentId,
            ...popperScope,
            ...contentProps,
            ref: forwardedRef,
            style: {
              ...contentProps.style,
              // re-namespace exposed content custom properties
              ...{
                "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
                "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
                "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
                "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
                "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Slottable, { children }),
              ariaLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { id: context.contentId, role: "tooltip", children: ariaLabel }) : null
            ]
          }
        )
      }
    );
  }, "TooltipContentImpl")
);
var TooltipArrow = /* @__PURE__ */ reactExports.forwardRef(
  /* @__PURE__ */ __name(function TooltipArrow2(props, forwardedRef) {
    const { __scopeTooltip, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeTooltip);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }, "TooltipArrow")
);
function getExitSideFromRect(point, rect) {
  const top = Math.abs(rect.top - point.y);
  const bottom = Math.abs(rect.bottom - point.y);
  const right = Math.abs(rect.right - point.x);
  const left = Math.abs(rect.left - point.x);
  switch (Math.min(top, bottom, right, left)) {
    case left:
      return "left";
    case right:
      return "right";
    case top:
      return "top";
    case bottom:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
__name(getExitSideFromRect, "getExitSideFromRect");
function getPaddedExitPoints(exitPoint, exitSide, padding = 5) {
  const paddedExitPoints = [];
  switch (exitSide) {
    case "top":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y + padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding }
      );
      break;
    case "bottom":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y - padding }
      );
      break;
    case "left":
      paddedExitPoints.push(
        { x: exitPoint.x + padding, y: exitPoint.y - padding },
        { x: exitPoint.x + padding, y: exitPoint.y + padding }
      );
      break;
    case "right":
      paddedExitPoints.push(
        { x: exitPoint.x - padding, y: exitPoint.y - padding },
        { x: exitPoint.x - padding, y: exitPoint.y + padding }
      );
      break;
  }
  return paddedExitPoints;
}
__name(getPaddedExitPoints, "getPaddedExitPoints");
function getPointsFromRect(rect) {
  const { top, right, bottom, left } = rect;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
}
__name(getPointsFromRect, "getPointsFromRect");
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const ii = polygon[i];
    const jj = polygon[j];
    const xi = ii.x;
    const yi = ii.y;
    const xj = jj.x;
    const yj = jj.y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
__name(isPointInPolygon, "isPointInPolygon");
function getHull(points) {
  const newPoints = points.slice();
  newPoints.sort((a, b) => {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return 1;
    else if (a.y < b.y) return -1;
    else if (a.y > b.y) return 1;
    else return 0;
  });
  return getHullPresorted(newPoints);
}
__name(getHull, "getHull");
function getHullPresorted(points) {
  if (points.length <= 1) return points.slice();
  const upperHull = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    while (upperHull.length >= 2) {
      const q = upperHull[upperHull.length - 1];
      const r = upperHull[upperHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upperHull.pop();
      else break;
    }
    upperHull.push(p);
  }
  upperHull.pop();
  const lowerHull = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (lowerHull.length >= 2) {
      const q = lowerHull[lowerHull.length - 1];
      const r = lowerHull[lowerHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lowerHull.pop();
      else break;
    }
    lowerHull.push(p);
  }
  lowerHull.pop();
  if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y) {
    return upperHull;
  } else {
    return upperHull.concat(lowerHull);
  }
}
__name(getHullPresorted, "getHullPresorted");
var Provider = TooltipProvider$1;
var Root3 = Tooltip$1;
var Trigger = TooltipTrigger$1;
var Portal = TooltipPortal;
var Content2 = TooltipContent$1;
var Arrow2 = TooltipArrow;
function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Provider,
    {
      "data-slot": "tooltip-provider",
      delayDuration,
      ...props
    }
  );
}
function Tooltip({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root3, { "data-slot": "tooltip", ...props }) });
}
function TooltipTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { "data-slot": "tooltip-trigger", ...props });
}
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content2,
    {
      "data-slot": "tooltip-content",
      sideOffset,
      className: cn(
        "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow2, { className: "bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
      ]
    }
  ) });
}
function firstPositiveAmount(...values) {
  for (const value of values) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }
  return 0;
}
function computeHeroStats(unlocks = [], resolutions = []) {
  const safeUnlocks = Array.isArray(unlocks) ? unlocks : [];
  const safeResolutions = Array.isArray(resolutions) ? resolutions : [];
  const completed = safeResolutions.filter(isTrulyCompletedHelp);
  const contributions = completed.filter(isContributionResolution).length;
  const directHelps = completed.length - contributions;
  const totalAmountHelped = completed.reduce(
    (sum, resolution) => sum + Number(
      (resolution == null ? void 0 : resolution.seeker_confirmed_amount) ?? (resolution == null ? void 0 : resolution.verified_amount) ?? (resolution == null ? void 0 : resolution.amount_paid) ?? (resolution == null ? void 0 : resolution.amount) ?? 0
    ),
    0
  );
  return { totalUnlocks: safeUnlocks.length, directHelps, contributions, totalAmountHelped };
}
function computeRequesterStats(cases = []) {
  const safeCases = Array.isArray(cases) ? cases : [];
  const norm = (item) => String((item == null ? void 0 : item.effective_status) || (item == null ? void 0 : item.status) || "pending").trim().toLowerCase();
  const completedCases = safeCases.filter((item) => norm(item) === "completed");
  return {
    totalSubmitted: safeCases.length,
    totalApproved: safeCases.filter((item) => norm(item) === "approved").length,
    totalRejected: safeCases.filter((item) => norm(item) === "rejected").length,
    totalCompleted: completedCases.length,
    totalExpired: safeCases.filter((item) => norm(item) === "expired").length,
    totalHelpReceived: completedCases.reduce(
      (sum, item) => sum + firstPositiveAmount(item == null ? void 0 : item.amount_collected, item == null ? void 0 : item.verified_amount, item == null ? void 0 : item.amount_needed),
      0
    )
  };
}
const SUPPORTS_PER_DOLLAR = 1e4;
function getBadge(unlockCount, contributionCount, directHelpCount) {
  if (contributionCount >= 3 && directHelpCount >= 3 || contributionCount + directHelpCount >= 10) {
    return {
      title: "Super Hero",
      emoji: "🌟",
      description: "You have unlocked cases, contributed, and provided direct help. You are the ultimate Hero!",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4 text-yellow-500" }),
      color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
    };
  }
  if (directHelpCount > 0 || contributionCount > 0) {
    return {
      title: "Hero",
      emoji: "🦸",
      description: "You paid directly for someone's need. You are a true Hero!",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-4 w-4 text-blue-500" }),
      color: "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
    };
  }
  if (unlockCount > 0) {
    return {
      title: "Young Hero",
      emoji: "⭐",
      description: "You unlocked a case. Complete a contribution or direct help to become a full Hero.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-green-500" }),
      color: "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
    };
  }
  return {
    title: "Newborn Hero",
    emoji: "🆕",
    description: "Your Hero journey is ready to begin.",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-purple-500" }),
    color: "bg-gradient-to-r from-purple-400 to-pink-500 text-white"
  };
}
function getTrustLevel(rejected, approved, expired) {
  let trust = 100;
  trust -= rejected * 10;
  trust += approved * 5;
  trust -= expired * 5;
  return Math.max(0, Math.min(100, trust));
}
function getCaseStatusStyle(status) {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "active" || s === "approved" || s === "live") return "bg-teal-50 text-teal-700 border-teal-200";
  if (s === "rejected") return "bg-red-50 text-red-700 border-red-200";
  if (s === "expired") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground border-border";
}
function ProfilePage() {
  var _a;
  const { isAuthenticated, user, logout } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const rawParam = (_a = location.pathname.match(/^\/profile\/([^/]+)/)) == null ? void 0 : _a[1];
  const profileUserId = !rawParam || rawParam === "me" ? (user == null ? void 0 : user.id) || "" : rawParam;
  const isOwnProfile = Boolean((user == null ? void 0 : user.id) && profileUserId === user.id);
  const [kycData, setKycData] = reactExports.useState(null);
  const [profile, setProfile] = reactExports.useState(null);
  const [profileError, setProfileError] = reactExports.useState(null);
  const [cases, setCases] = reactExports.useState([]);
  const [showLogout, setShowLogout] = reactExports.useState(false);
  const [showMenu, setShowMenu] = reactExports.useState(false);
  const [profileLoading, setProfileLoading] = reactExports.useState(true);
  const [isMyHero, setIsMyHero] = reactExports.useState(false);
  const [heroUpdating, setHeroUpdating] = reactExports.useState(false);
  const [badgeInfoOpen, setBadgeInfoOpen] = reactExports.useState(false);
  const [heroesCount, setHeroesCount] = reactExports.useState(0);
  const [followingCount, setFollowingCount] = reactExports.useState(0);
  const [supportsCount, setSupportsCount] = reactExports.useState(0);
  const [supportEarningsUsd, setSupportEarningsUsd] = reactExports.useState(0);
  const [relationshipType, setRelationshipType] = reactExports.useState(null);
  const [relationshipUsers, setRelationshipUsers] = reactExports.useState([]);
  const [relationshipLoading, setRelationshipLoading] = reactExports.useState(false);
  const [requesterStats, setRequesterStats] = reactExports.useState({
    totalSubmitted: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalCompleted: 0,
    totalExpired: 0,
    totalHelpReceived: 0
  });
  const [heroStats, setHeroStats] = reactExports.useState({
    totalUnlocks: 0,
    directHelps: 0,
    contributions: 0,
    totalAmountHelped: 0
  });
  const [helpedCases, setHelpedCases] = reactExports.useState([]);
  const [trustLevel, setTrustLevel] = reactExports.useState(100);
  const [badge, setBadge] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setProfile(null);
    setProfileError(null);
    setKycData(null);
    setProfileLoading(true);
    if (!profileUserId) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadData();
  }, [isAuthenticated, location.pathname, profileUserId]);
  async function loadData() {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const results = await Promise.allSettled([
        getKycSubmission(profileUserId),
        getProfile(profileUserId, role),
        getProfileStats(profileUserId)
      ]);
      const [kycResult, profResult, statsResult] = results;
      const kyc = kycResult.status === "fulfilled" ? kycResult.value : null;
      const prof = profResult.status === "fulfilled" ? profResult.value : null;
      const stats = statsResult.status === "fulfilled" ? statsResult.value : {};
      const caseList = Array.isArray(stats.cases) ? stats.cases : [];
      const resolutions = Array.isArray(stats.resolutions) ? stats.resolutions : [];
      const unlocks = Array.isArray(stats.unlocks) ? stats.unlocks : [];
      if (kycResult.status === "rejected") {
        console.warn("KYC submission fetch failed (may be permissions):", kycResult.reason);
      }
      if (profResult.status === "rejected") {
        console.error("Profile fetch failed:", profResult.reason);
        setProfileError("Could not load profile details. Please try again later.");
        ue.error("Could not load profile details.");
      } else {
        setProfileError(null);
      }
      if (statsResult.status === "rejected") {
        console.warn("Profile stats fetch failed:", statsResult.reason);
      }
      setKycData(kyc);
      setProfile(prof);
      setHeroesCount(Number((prof == null ? void 0 : prof.heroes_count) || (prof == null ? void 0 : prof.followers_count) || 0));
      setFollowingCount(Number((prof == null ? void 0 : prof.following_count) || 0));
      setSupportsCount(Number((prof == null ? void 0 : prof.supports_count) || 0));
      setSupportEarningsUsd(Number((prof == null ? void 0 : prof.support_earnings_usd) || 0));
      setIsMyHero(Boolean(prof == null ? void 0 : prof.is_following));
      const list = Array.isArray(caseList) ? caseList : [];
      const resolutionList = Array.isArray(resolutions) ? resolutions : [];
      const unlockList = Array.isArray(unlocks) ? unlocks : [];
      const nextRequesterStats = stats.requester || computeRequesterStats(list);
      const nextHeroStats = stats.hero || computeHeroStats(unlockList, resolutionList);
      setCases(list);
      setRequesterStats(nextRequesterStats);
      setHeroStats(nextHeroStats);
      setTrustLevel(getTrustLevel(nextRequesterStats.totalRejected, nextRequesterStats.totalCompleted, nextRequesterStats.totalExpired));
      const validResolutions = resolutionList.filter(isTrulyCompletedHelp);
      setHelpedCases(validResolutions.slice(0, 5));
      setBadge(getBadge(nextHeroStats.totalUnlocks, nextHeroStats.contributions, nextHeroStats.directHelps));
    } catch (err) {
      console.error("Unexpected error in loadData:", err);
      setProfileError("An unexpected error occurred while loading the profile.");
      ue.error("An unexpected error occurred while loading the profile.");
    } finally {
      setProfileLoading(false);
    }
  }
  async function toggleHero() {
    if (!isAuthenticated || !(user == null ? void 0 : user.id)) {
      navigate({ to: "/sign-in" });
      return;
    }
    if (isOwnProfile || heroUpdating) return;
    setHeroUpdating(true);
    try {
      if (isMyHero) {
        await unfollowUser(profileUserId);
        setIsMyHero(false);
        setHeroesCount((count) => Math.max(0, count - 1));
        ue.success("Removed from My Heroes");
      } else {
        await followUser(profileUserId);
        setIsMyHero(true);
        setHeroesCount((count) => count + 1);
        ue.success("Added to My Heroes");
      }
    } catch (error) {
      ue.error(error instanceof Error ? error.message : "Could not update Hero status");
    } finally {
      setHeroUpdating(false);
    }
  }
  async function openRelationshipList(type) {
    setRelationshipType(type);
    setRelationshipLoading(true);
    try {
      setRelationshipUsers(await getFollowList(profileUserId, type));
    } catch (error) {
      console.error("Failed to load relationship list", error);
      setRelationshipUsers([]);
    } finally {
      setRelationshipLoading(false);
    }
  }
  async function removeRelationship(targetId) {
    if (!isOwnProfile) return;
    try {
      if (relationshipType === "heroes") await unfollowUser(targetId);
      if (relationshipType === "requesters") await removeRequester(targetId);
      setRelationshipUsers((items) => items.filter((item) => String(item.user_id) !== String(targetId)));
      if (relationshipType === "heroes") setFollowingCount((count) => Math.max(0, count - 1));
      if (relationshipType === "requesters") setHeroesCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error("Failed to remove relationship", error);
    }
  }
  const kycApproved = (kycData == null ? void 0 : kycData.status) === "approved";
  const displayName = (profile == null ? void 0 : profile.full_name) || (user == null ? void 0 : user.fullName) || "My Profile";
  const avatarUrl = (profile == null ? void 0 : profile.avatar_url) || null;
  const coverUrl = (profile == null ? void 0 : profile.cover_url) || null;
  const verificationBadges = [
    { label: "Email Verified", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }), active: isOwnProfile ? !!(user == null ? void 0 : user.email) : !!(profile == null ? void 0 : profile.email_verified) },
    { label: "Mobile Verified", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }), active: !!(profile == null ? void 0 : profile.phone_number) },
    { label: "Identity Verified", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }), active: kycApproved },
    { label: "Institution Verified", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }), active: false }
  ];
  const menuItems = [
    { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-5 w-5" }), label: "Edit Profile", to: "/edit-profile" },
    { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" }), label: "Community", to: "/community" },
    { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-5 w-5" }), label: role === "hero" ? "My Help Dashboard" : "My Cases Dashboard", to: role === "hero" ? "/my-help" : "/my-cases" },
    { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" }), label: "Notifications", to: "/notifications" },
    { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-5 w-5" }), label: "Wallet", to: "/wallet" },
    { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5" }), label: "Security", to: "/security" },
    { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-5 w-5" }), label: "Google Account Security", to: "/security" },
    { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-5 w-5" }), label: "Privacy", to: "/account-privacy" },
    { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-5 w-5" }), label: "Settings", to: "/settings" }
  ];
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "G";
  const profileReady = !profileLoading;
  if (!profileReady) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-xl mx-auto px-4 pt-8 pb-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border bg-card p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 h-16 w-16 rounded-full bg-muted animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-5 w-40 rounded bg-muted animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "Loading profile..." })
    ] }) }) });
  }
  if (!profile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-xl mx-auto px-4 pt-8 pb-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-8 w-8 text-red-500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-red-700 dark:text-red-300", children: "Profile Not Available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600 dark:text-red-400", children: profileError || "We could not load this profile. Please try again later." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-4", onClick: () => loadData(), children: "Retry" })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Layout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl mx-auto px-4 pt-0 pb-24 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-b-3xl bg-card border border-border shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-32 relative bg-gradient-to-br from-primary via-primary/80 to-primary/40", children: [
          coverUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: coverUrl, alt: "Cover", className: "absolute inset-0 w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-4 h-16 w-16 rounded-full bg-white/10 blur-xl" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-8 h-12 w-12 rounded-full bg-white/10 blur-lg" })
          ] }),
          isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              "aria-label": "Profile menu",
              className: "absolute top-3 right-3 h-9 w-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center hover:bg-black/35 transition-colors",
              onClick: () => setShowMenu(true),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4 text-white" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between -mt-12 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 w-24 rounded-3xl border-4 border-card ring-1 ring-border flex items-center justify-center shadow-xl overflow-hidden bg-primary", children: avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarUrl, alt: displayName, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white font-bold text-2xl", children: initials }) }),
              isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => navigate({ to: "/edit-profile" }),
                  title: "Edit Profile",
                  "aria-label": "Edit Profile",
                  className: "absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" })
                }
              )
            ] }),
            !isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                onClick: toggleHero,
                disabled: heroUpdating,
                className: `rounded-full px-4 h-9 font-semibold shadow-sm shrink-0 ${isMyHero ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15" : "bg-primary text-primary-foreground hover:bg-primary/90"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "h-4 w-4 mr-1.5" }),
                  heroUpdating ? "Updating..." : isMyHero ? "My Hero" : "Hero"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground break-words", children: displayName }),
            badge && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`, children: [
                badge.icon,
                badge.title
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setBadgeInfoOpen(true),
                    className: "text-muted-foreground hover:text-primary transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-xs text-xs", children: badge.description }) })
              ] }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 mt-1", children: [
            ((profile == null ? void 0 : profile.city) || (profile == null ? void 0 : profile.country)) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
              [profile == null ? void 0 : profile.city, profile == null ? void 0 : profile.country].filter(Boolean).join(", ")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
                " Member since ",
                (profile == null ? void 0 : profile.member_since) || 2026
              ] }),
              kycApproved && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-teal-600 font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
                " KYC Verified"
              ] })
            ] }),
            (profile == null ? void 0 : profile.bio) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic pt-1", children: profile.bio })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 mt-4 rounded-2xl border border-border/70 bg-background/70 px-2 py-3 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => openRelationshipList("requesters"),
                className: "flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity",
                "aria-label": "View Requesters",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5 text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-primary leading-tight", children: heroesCount }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "Requesters" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => openRelationshipList("heroes"),
                className: "flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity border-x border-border/60",
                "aria-label": "View Heroes",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "h-3.5 w-3.5 text-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-foreground leading-tight", children: followingCount }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "Heroes" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-3.5 w-3.5 text-amber-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-amber-600 leading-tight", children: supportsCount.toLocaleString() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: "Supports" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: verificationBadges.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${b.active ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800" : "bg-muted text-muted-foreground border-border"}`,
              children: [
                b.active ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3 w-3" }),
                b.label
              ]
            },
            b.label
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Trust Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-primary", children: [
            trustLevel,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-3 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `h-3 rounded-full transition-all ${trustLevel >= 70 ? "bg-green-500" : trustLevel >= 40 ? "bg-amber-500" : "bg-red-500"}`,
            style: { width: `${trustLevel}%` }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Based on case history" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "+",
            requesterStats.totalCompleted * 5,
            " approvals · -",
            requesterStats.totalRejected * 10,
            " rejections · -",
            requesterStats.totalExpired * 5,
            " expired"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-4 w-4 text-amber-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Support earnings" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-bold text-amber-600", children: [
            "$",
            supportEarningsUsd.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
          supportsCount.toLocaleString(),
          " Supports received · ",
          SUPPORTS_PER_DOLLAR.toLocaleString(),
          " Supports = $1.00"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-300", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Withdrawal eligibility will be announced soon." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold whitespace-nowrap", children: "Coming soon" })
        ] })
      ] }),
      role === "hero" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: heroStats.totalUnlocks }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "h-3 w-3" }),
            " Total Unlocks"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: heroStats.directHelps }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }),
            " Direct Helps"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: heroStats.contributions }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-3 w-3" }),
            " Contributions"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: heroStats.totalAmountHelped }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-3 w-3" }),
            " Total Amount Helped"
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: requesterStats.totalSubmitted }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-3 w-3" }),
            " Submitted"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: requesterStats.totalApproved }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-teal-600" }),
            " Approved"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: requesterStats.totalCompleted }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-blue-600" }),
            " Completed"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: requesterStats.totalRejected }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 text-red-600" }),
            " Rejected"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: requesterStats.totalExpired }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3 text-amber-600" }),
            " Expired"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-green-600", children: requesterStats.totalHelpReceived }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "h-3 w-3" }),
            " Total Help Received"
          ] })
        ] })
      ] }),
      cases.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-4 w-4 text-primary" }),
            " Cases"
          ] }),
          isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => navigate({ to: "/my-cases" }),
              className: "text-xs text-primary font-medium flex items-center hover:underline",
              children: [
                "View all ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: cases.slice(0, 5).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between gap-2 rounded-xl border border-border p-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium truncate", children: c.title || `Case #${c.id}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${getCaseStatusStyle(c.status)}`,
                  children: c.status || "pending"
                }
              )
            ]
          },
          c.id
        )) })
      ] }),
      role === "hero" && helpedCases.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "h-4 w-4 text-primary" }),
          " Cases You Helped"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: helpedCases.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium truncate", children: r.case_title || `Case #${r.case_id ?? r.id}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs font-semibold text-green-600", children: r.seeker_confirmed_amount ?? r.amount_paid ? Number(r.seeker_confirmed_amount ?? r.amount_paid).toFixed(2) : "" })
        ] }, r.id)) })
      ] }),
      Array.isArray(profile == null ? void 0 : profile.posts) && profile.posts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 text-primary" }),
            " Community Posts"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            profile.posts.length,
            " posts"
          ] })
        ] }),
        profile.posts.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            post.is_pinned ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-3 w-3 text-primary" }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: post.is_pinned ? "Pinned" : "Community post" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm whitespace-pre-wrap", children: post.message })
        ] }, post.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showMenu, onOpenChange: setShowMenu, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Account Menu" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Manage your profile and account settings." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border overflow-hidden", children: menuItems.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setShowMenu(false);
              navigate({ to: item.to });
            },
            className: `w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors ${idx < menuItems.length - 1 ? "border-b border-border" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: item.icon }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-left", children: item.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
            ]
          },
          item.label
        )) })
      ] }) }),
      isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setShowLogout(true),
          className: "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20 font-medium text-sm transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
            " Logout"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground pb-2", children: "Givethra v2.0 · Built with ❤️" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showLogout, onOpenChange: setShowLogout, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-5 w-5 text-red-500" }),
          " Logout"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Are you sure you want to logout?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-row gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "flex-1", onClick: () => setShowLogout(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "destructive",
            className: "flex-1",
            onClick: () => {
              logout();
              setShowLogout(false);
              navigate({ to: "/" });
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4 mr-1.5" }),
              " Logout"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: badgeInfoOpen, onOpenChange: setBadgeInfoOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-5 w-5 text-primary" }),
          " Hero Badges"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Understand what each badge means and how you earn them." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-2 rounded-lg bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xl", children: "🆕" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "Newborn Hero" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You unlocked a case but did not complete a payment. Take the next step!" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-2 rounded-lg bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xl", children: "⭐" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "Young Hero" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You contributed to a fundraising pool. Every contribution counts!" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-2 rounded-lg bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xl", children: "🦸" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "Hero" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You paid directly for someone's need. You are a true Hero!" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-2 rounded-lg bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xl", children: "🌟" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "Super Hero" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You have unlocked, contributed, and provided direct help. The ultimate Hero!" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setBadgeInfoOpen(false), children: "Got it" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: relationshipType !== null, onOpenChange: (open) => !open && setRelationshipType(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: relationshipType === "heroes" ? "Your Heroes" : "Your Requesters" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          relationshipType === "heroes" ? "People you have chosen as Heroes." : "People who have chosen you as their Hero.",
          !relationshipLoading && relationshipUsers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block mt-0.5 text-xs font-medium text-foreground", children: [
            relationshipUsers.length,
            " total"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[55vh] overflow-y-auto space-y-2 pr-1", children: relationshipLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-6 text-center", children: "Loading..." }) : relationshipUsers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground py-6 text-center", children: [
        "No ",
        relationshipType,
        " yet."
      ] }) : relationshipUsers.map((item, idx) => {
        const userId = item.user_id ?? item.id ?? item.hero_id ?? item.requester_id ?? "";
        const name = item.full_name ?? item.name ?? item.user_name ?? "Givethra User";
        const initials2 = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setRelationshipType(null);
                if (userId) navigate({ to: "/profile/$id", params: { id: String(userId) } });
              },
              className: "h-10 w-10 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-semibold shrink-0",
              children: item.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.avatar_url, alt: name, className: "h-full w-full object-cover" }) : initials2
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setRelationshipType(null);
                if (userId) navigate({ to: "/profile/$id", params: { id: String(userId) } });
              },
              className: "flex-1 text-left min-w-0",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium truncate block", children: [
                name,
                item.is_verified ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-teal-600", children: "✓" }) : null
              ] })
            }
          ),
          isOwnProfile && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => removeRelationship(String(userId)), children: relationshipType === "heroes" ? "Unhero" : "Remove" })
        ] }, String(userId || idx));
      }) })
    ] }) })
  ] });
}
export {
  ProfilePage as default
};

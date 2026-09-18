import { r as reactExports, j as jsxRuntimeExports, u as useAuth, h as useRole, f as useNavigate, g as getKycStatus, aZ as getOnboardingStatus, a_ as setOnboardingStatus } from "./main-g9K_ERoM.js";
import { B as Button } from "./button-B16x4Aev.js";
import { M as MotionConfigContext, i as isHTMLElement, u as useConstant, a as useIsomorphicLayoutEffect, P as PresenceContext, b as usePresence, L as LayoutGroupContext, m as motion } from "./react-CTv_UkQm.js";
import { C as ChevronLeft } from "./chevron-left-D78lBsei.js";
import { A as ArrowRight } from "./arrow-right-DLWp947J.js";
import { C as ChevronRight } from "./chevron-right-B-OcRTF5.js";
import { H as Heart } from "./heart-jbpX9LjB.js";
import { U as Users } from "./users-UB6fXOVr.js";
import { L as LockOpen } from "./lock-open-D0yGZ99s.js";
import { H as HandCoins } from "./hand-coins-BEzfiVWn.js";
import { C as CircleCheck } from "./circle-check-g9UYGXUf.js";
import { F as FileText } from "./file-text-BX7_gWdF.js";
import { A as Award } from "./award-4unxMs4j.js";
import { S as Sparkles } from "./sparkles-CzhePmI_.js";
import { H as HandHelping } from "./hand-helping-DWAMKD-6.js";
import { S as ShieldCheck } from "./shield-check-C1k_SF_t.js";
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
class PopChildMeasure extends reactExports.Component {
  getSnapshotBeforeUpdate(prevProps) {
    const element = this.props.childRef.current;
    if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
      const parent = element.offsetParent;
      const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
      const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
      const computedStyle = getComputedStyle(element);
      const size = this.props.sizeRef.current;
      size.height = parseFloat(computedStyle.height);
      size.width = parseFloat(computedStyle.width);
      size.top = element.offsetTop;
      size.left = element.offsetLeft;
      size.right = parentWidth - size.width - size.left;
      size.bottom = parentHeight - size.height - size.top;
      size.direction = computedStyle.direction;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function PopChild({ children, isPresent, anchorX, anchorY, root, pop }) {
  var _a;
  const id = reactExports.useId();
  const ref = reactExports.useRef(null);
  const size = reactExports.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  });
  const { nonce } = reactExports.useContext(MotionConfigContext);
  const childRef = pop !== false ? ((_a = children.props) == null ? void 0 : _a.ref) ?? (children == null ? void 0 : children.ref) : void 0;
  const composedRef = useComposedRefs(ref, childRef);
  reactExports.useInsertionEffect(() => {
    const { width, height, top, left, right, bottom, direction } = size.current;
    if (isPresent || pop === false || !ref.current || !width || !height)
      return;
    const isRTL = direction === "rtl";
    const x = anchorX === "left" ? isRTL ? `right: ${right}` : `left: ${left}` : isRTL ? `left: ${left}` : `right: ${right}`;
    const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
    ref.current.dataset.motionPopId = id;
    const style = document.createElement("style");
    if (nonce)
      style.nonce = nonce;
    const parent = root ?? document.head;
    parent.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
    }
    return () => {
      var _a2;
      (_a2 = ref.current) == null ? void 0 : _a2.removeAttribute("data-motion-pop-id");
      if (parent.contains(style)) {
        parent.removeChild(style);
      }
    };
  }, [isPresent]);
  return jsxRuntimeExports.jsx(PopChildMeasure, { isPresent, childRef: ref, sizeRef: size, pop, children: pop === false ? children : reactExports.cloneElement(children, { ref: composedRef }) });
}
const PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
  const presenceChildren = useConstant(newChildrenMap);
  const id = reactExports.useId();
  const isPresentRef = reactExports.useRef(isPresent);
  const onExitCompleteRef = reactExports.useRef(onExitComplete);
  useIsomorphicLayoutEffect(() => {
    isPresentRef.current = isPresent;
    onExitCompleteRef.current = onExitComplete;
  });
  let isReusedContext = true;
  let context = reactExports.useMemo(() => {
    isReusedContext = false;
    return {
      id,
      initial,
      isPresent,
      custom,
      onExitComplete: (childId) => {
        presenceChildren.set(childId, true);
        for (const isComplete of presenceChildren.values()) {
          if (!isComplete)
            return;
        }
        onExitComplete && onExitComplete();
      },
      register: (childId) => {
        presenceChildren.set(childId, false);
        return () => {
          var _a;
          presenceChildren.delete(childId);
          !isPresentRef.current && !presenceChildren.size && ((_a = onExitCompleteRef.current) == null ? void 0 : _a.call(onExitCompleteRef));
        };
      }
    };
  }, [isPresent, presenceChildren, onExitComplete]);
  if (presenceAffectsLayout && isReusedContext) {
    context = { ...context };
  }
  reactExports.useMemo(() => {
    presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
  }, [isPresent]);
  reactExports.useEffect(() => {
    !isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
  }, [isPresent]);
  children = jsxRuntimeExports.jsx(PopChild, { pop: mode === "popLayout", isPresent, anchorX, anchorY, root, children });
  return jsxRuntimeExports.jsx(PresenceContext.Provider, { value: context, children });
};
function newChildrenMap() {
  return /* @__PURE__ */ new Map();
}
const getChildKey = (child) => child.key || "";
function onlyElements(children) {
  const filtered = [];
  reactExports.Children.forEach(children, (child) => {
    if (reactExports.isValidElement(child))
      filtered.push(child);
  });
  return filtered;
}
const AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
  const [isParentPresent, safeToRemove] = usePresence(propagate);
  const presentChildren = reactExports.useMemo(() => onlyElements(children), [children]);
  const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
  const isInitialRender = reactExports.useRef(true);
  const pendingPresentChildren = reactExports.useRef(presentChildren);
  const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
  const exitingComponents = reactExports.useRef(/* @__PURE__ */ new Set());
  const [diffedChildren, setDiffedChildren] = reactExports.useState(presentChildren);
  const [renderedChildren, setRenderedChildren] = reactExports.useState(presentChildren);
  useIsomorphicLayoutEffect(() => {
    isInitialRender.current = false;
    pendingPresentChildren.current = presentChildren;
    for (let i = 0; i < renderedChildren.length; i++) {
      const key = getChildKey(renderedChildren[i]);
      if (!presentKeys.includes(key)) {
        if (exitComplete.get(key) !== true) {
          exitComplete.set(key, false);
        }
      } else {
        exitComplete.delete(key);
        exitingComponents.current.delete(key);
      }
    }
  }, [renderedChildren, presentKeys.length, presentKeys.join("-")]);
  const exitingChildren = [];
  if (presentChildren !== diffedChildren) {
    let nextChildren = [...presentChildren];
    for (let i = 0; i < renderedChildren.length; i++) {
      const child = renderedChildren[i];
      const key = getChildKey(child);
      if (!presentKeys.includes(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child);
      }
    }
    if (mode === "wait" && exitingChildren.length) {
      nextChildren = exitingChildren;
    }
    setRenderedChildren(onlyElements(nextChildren));
    setDiffedChildren(presentChildren);
    return null;
  }
  const { forceRender } = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: renderedChildren.map((child) => {
    const key = getChildKey(child);
    const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
    const onExit = () => {
      if (exitingComponents.current.has(key)) {
        return;
      }
      if (exitComplete.has(key)) {
        exitingComponents.current.add(key);
        exitComplete.set(key, true);
      } else {
        return;
      }
      let isEveryExitComplete = true;
      exitComplete.forEach((isExitComplete) => {
        if (!isExitComplete)
          isEveryExitComplete = false;
      });
      if (isEveryExitComplete) {
        forceRender == null ? void 0 : forceRender();
        setRenderedChildren(pendingPresentChildren.current);
        propagate && (safeToRemove == null ? void 0 : safeToRemove());
        onExitComplete && onExitComplete();
      }
    };
    return jsxRuntimeExports.jsx(PresenceChild, { isPresent, initial: !isInitialRender.current || initial ? void 0 : false, custom, presenceAffectsLayout, mode, root, onExitComplete: isPresent ? void 0 : onExit, anchorX, anchorY, children: child }, key);
  }) });
};
function OnboardingPage() {
  const { user } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = reactExports.useState(0);
  const containerRef = reactExports.useRef(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const checkStatus = async () => {
      if (!(user == null ? void 0 : user.id)) {
        navigate({ to: "/" });
        return;
      }
      try {
        const kyc = await getKycStatus(user.id);
        if ((kyc == null ? void 0 : kyc.status) !== "approved") {
          navigate({ to: "/kyc" });
          return;
        }
        const onboardingDone = await getOnboardingStatus(user.id);
        if (onboardingDone) {
          navigate({ to: "/home" });
          return;
        }
      } catch (err) {
        console.error("Error checking onboarding status:", err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [user, navigate]);
  const heroSlides = [
    {
      title: "Welcome, Hero! 🦸",
      description: "You've chosen to be a Hero. Your kindness can change lives. Let's show you how Givethra works.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-12 w-12 text-primary" }),
      color: "from-primary/20 to-primary/5"
    },
    {
      title: "Browse Verified Cases",
      description: "Every case on Givethra is verified by our team. You can browse real people with real needs.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-12 w-12 text-primary" }),
      color: "from-blue-200 to-blue-50"
    },
    {
      title: "Unlock a Case",
      description: "When you find a case you want to support, tap Unlock. Your first 3 unlocks are completely FREE!",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "h-12 w-12 text-primary" }),
      color: "from-purple-200 to-purple-50"
    },
    {
      title: "Choose Your Help Type",
      description: "You can either pay the institute directly (Direct Help) or contribute to a fundraising pool (Contribution).",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-12 w-12 text-primary" }),
      color: "from-amber-200 to-amber-50"
    },
    {
      title: "Submit Proof",
      description: "After helping, submit your payment proof and TXN number. Givethra will verify and complete the case.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-12 w-12 text-primary" }),
      color: "from-green-200 to-green-50"
    },
    {
      title: "Track Your Impact",
      description: "All your help is tracked in 'My Help'. You can see your contributions, direct helps, and unlock history.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 text-primary" }),
      color: "from-indigo-200 to-indigo-50"
    },
    {
      title: "Earn Hero Badges",
      description: "Unlock cases to become a Newborn Hero. Contribute to become a Young Hero. Direct Help makes you a Hero. Do all three to become a Super Hero!",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-12 w-12 text-primary" }),
      color: "from-yellow-200 to-yellow-50"
    },
    {
      title: "You're Ready! 🚀",
      description: "Now you know how to help. Browse cases and start changing lives today. Remember: even a small help can make a big difference.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-12 w-12 text-primary" }),
      color: "from-green-200 to-green-50"
    }
  ];
  const requesterSlides = [
    {
      title: "Welcome! 🤲",
      description: "You've chosen to seek help. You are not alone. Givethra connects you with verified Heroes who care.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HandHelping, { className: "h-12 w-12 text-primary" }),
      color: "from-primary/20 to-primary/5"
    },
    {
      title: "Complete Your KYC",
      description: "Before you can submit a case, you need to complete KYC. This helps us verify that you are a real person.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-12 w-12 text-primary" }),
      color: "from-blue-200 to-blue-50"
    },
    {
      title: "Submit Your Case",
      description: "Fill in all details about your need. Upload your bill, take a selfie, and record a video explaining your situation.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 text-primary" }),
      color: "from-purple-200 to-purple-50"
    },
    {
      title: "Your First Case is FREE",
      description: "Your first case is completely FREE. After that, a 1 credit listing fee applies.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-12 w-12 text-primary" }),
      color: "from-amber-200 to-amber-50"
    },
    {
      title: "Wait for Review",
      description: "Our team reviews your case. If everything is verified, your case will be approved and shown to Heroes.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-12 w-12 text-primary" }),
      color: "from-green-200 to-green-50"
    },
    {
      title: "Heroes Will Help",
      description: "When Heroes unlock and help your case, you'll receive direct support. You'll get an affidavit as proof.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-12 w-12 text-primary" }),
      color: "from-rose-200 to-rose-50"
    },
    {
      title: "Share Your Feedback",
      description: "After your case is completed, you must share a feedback video (60 seconds) within 24 hours. This builds trust for future Heroes.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-12 w-12 text-primary" }),
      color: "from-indigo-200 to-indigo-50"
    },
    {
      title: "You're Ready! 🚀",
      description: "Now you know how to seek help. Submit your case and wait for Heroes to support you. Remember: you are not alone.",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-12 w-12 text-primary" }),
      color: "from-green-200 to-green-50"
    }
  ];
  const slides = role === "hero" ? heroSlides : requesterSlides;
  const totalSlides = slides.length;
  const isLastSlide = currentSlide === totalSlides - 1;
  const goToNext = async () => {
    if (isLastSlide) {
      try {
        if (user == null ? void 0 : user.id) {
          await setOnboardingStatus(user.id, true);
        }
      } catch (err) {
        console.error("Failed to update onboarding status:", err);
      }
      navigate({ to: "/home" });
    } else {
      setCurrentSlide(currentSlide + 1);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  };
  const goToPrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  };
  reactExports.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, isLastSlide]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading..." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted h-1 fixed top-0 left-0 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "h-full bg-primary transition-all duration-500 ease-out",
        style: { width: `${(currentSlide + 1) / totalSlides * 100}%` }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: containerRef,
        className: "flex-1 overflow-y-auto pb-24 pt-8 px-4 max-w-2xl mx-auto w-full",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -20 },
            transition: { duration: 0.4 },
            className: "space-y-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-sm text-muted-foreground", children: [
                currentSlide + 1,
                " / ",
                totalSlides
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-24 w-24 rounded-2xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center`,
                  children: slides[currentSlide].icon
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold text-center text-foreground", children: slides[currentSlide].title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-muted-foreground text-center max-w-md mx-auto leading-relaxed", children: slides[currentSlide].description }),
              currentSlide === 2 && role === "hero" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-center", children: [
                "💡 ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Free tip:" }),
                " Your first 3 unlocks are FREE. After that, 1 credit per unlock."
              ] }),
              currentSlide === 3 && role === "hero" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-primary/10 border border-primary/20 p-4 text-sm text-center", children: [
                "💡 ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Direct Help:" }),
                " Pay the institute directly (1 credit). ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Contribution:" }),
                " Contribute any amount to a fundraising pool (1 credit)."
              ] }),
              currentSlide === 6 && role === "requester" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 text-center", children: [
                "⚠️ ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Important:" }),
                " You must submit a feedback video within 24 hours after your case is completed. Failure to do so will suspend your account."
              ] }),
              currentSlide === 3 && role === "requester" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800 text-center", children: [
                "🎉 ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Good news:" }),
                " Your first case is FREE! After that, it's 1 credit per case."
              ] })
            ]
          },
          currentSlide
        ) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 max-w-2xl mx-auto w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: goToPrevious,
            disabled: currentSlide === 0,
            className: "shrink-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 mr-1" }),
              " Back"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex justify-center gap-1.5", children: slides.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setCurrentSlide(index),
            className: `h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-primary" : index < currentSlide ? "w-2 bg-primary/40" : "w-2 bg-muted-foreground/30"}`,
            "aria-label": `Go to slide ${index + 1}`
          },
          index
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            onClick: goToNext,
            className: "shrink-0 gap-1 bg-primary hover:bg-primary/90",
            children: isLastSlide ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Get Started ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Next ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 ml-1" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-center text-muted-foreground mt-2", children: isLastSlide ? "Tap 'Get Started' to begin your journey!" : "Use arrow keys or tap Next/Back to navigate" })
    ] })
  ] });
}
export {
  OnboardingPage as default
};

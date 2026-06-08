import { a as useAuth, u as useNavigate, r as reactExports, j as jsxRuntimeExports, L as Link, f as ue } from "./index-BoYH-a4m.js";
import { C as Category } from "./backend-B2Q1poOu.js";
import { E as ErrorBanner } from "./ErrorBanner-Da8eSBd7.js";
import { L as Layout } from "./Layout-DyTGbA2S.js";
import { B as Button } from "./button-DXj5HeE2.js";
import { I as Input } from "./input-BGHi7jlu.js";
import { L as Label } from "./label-CBLHrnIN.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-5t566Auo.js";
import { T as Textarea } from "./textarea-WpvBG7qF.js";
import { u as useBackendActor, a as useGetCallerProfile } from "./useBackend-FSH8Ysa0.js";
import "./circle-alert-CarhqOsL.js";
import "./x-Yn9x35TY.js";
import "./heart-qvi-jSMZ.js";
import "./bell-DSWTbU_S.js";
import "./shield-BJahHKMQ.js";
import "./index-BGoXbzZj.js";
import "./index-BjTlUSa6.js";
import "./index-NruUtonI.js";
import "./Combination-DxUapp4-.js";
import "./index-sQmzYE_i.js";
import "./index-kbCWIHe_.js";
const STEP_LABELS = ["Details", "Documents", "Payment"];
const CATEGORIES = [
  { label: "Education", value: Category.Education },
  { label: "School Fees", value: Category.SchoolFees },
  { label: "University Fees", value: Category.UniversityFees },
  { label: "Books", value: Category.Books },
  { label: "Uniform", value: Category.Uniform },
  { label: "Medical", value: Category.Medical },
  { label: "Surgery", value: Category.Surgery },
  { label: "Medicines", value: Category.Medicines },
  { label: "Utilities", value: Category.Utilities },
  { label: "Housing", value: Category.Housing },
  { label: "Food", value: Category.Food },
  { label: "Employment", value: Category.Employment },
  { label: "Transportation", value: Category.Transportation },
  { label: "Disability Support", value: Category.DisabilitySupport },
  { label: "Orphans", value: Category.Orphans },
  { label: "Widows", value: Category.Widows },
  { label: "Debt Relief", value: Category.DebtRelief },
  { label: "Emergency Needs", value: Category.EmergencyNeeds },
  { label: "Other", value: Category.Other }
];
function SubmitRequestPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const { data: profile, isLoading: profileLoading } = useGetCallerProfile();
  const [step, setStep] = reactExports.useState(1);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [createdCaseId, setCreatedCaseId] = reactExports.useState(null);
  const [category, setCategory] = reactExports.useState(null);
  const [title, setTitle] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [country, setCountry] = reactExports.useState("");
  const [city, setCity] = reactExports.useState("");
  const [amount, setAmount] = reactExports.useState("");
  const [deadline, setDeadline] = reactExports.useState("");
  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }
  const kycStatus = profile == null ? void 0 : profile.kycStatus;
  const isKycApproved = kycStatus === "approved";
  if (!profileLoading && !isKycApproved) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-xl mx-auto px-4 py-16 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "KYC Verification Required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Please complete your identity verification to submit a request." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 justify-center pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/profile/$id", params: { id: "me" }, children: "Go to Profile" }) }) })
    ] }) }) });
  }
  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!actor || isFetching || category === null) return;
    setSubmitting(true);
    setError("");
    try {
      const deadlineTs = BigInt(new Date(deadline).getTime()) * BigInt(1e6);
      const amountCents = BigInt(Math.round(Number(amount) * 100));
      const id = await actor.createCase(
        title,
        description,
        category,
        country,
        city,
        amountCents,
        deadlineTs
      );
      setCreatedCaseId(id);
      setStep(2);
    } catch (_err) {
      setError("Failed to create case. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleStep2 = () => setStep(3);
  const handleStep3Pay = async () => {
    if (!actor || !createdCaseId) return;
    setSubmitting(true);
    try {
      const successUrl = `${window.location.origin}/my-requests?paid=1`;
      const cancelUrl = `${window.location.origin}/submit-request`;
      const sessionUrl = await actor.createListingFeeSession(
        successUrl,
        cancelUrl
      );
      window.location.href = sessionUrl;
    } catch {
      ue.error("Failed to start payment. Please try again.");
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold text-foreground", children: "Submit a Help Request" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "A $1 listing fee is required before your case goes live." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex items-center gap-0 mb-8",
        "data-ocid": "submit_request.steps",
        children: STEP_LABELS.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `flex items-center gap-2 ${i + 1 <= step ? "text-primary" : "text-muted-foreground"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i + 1 < step ? "bg-primary border-primary text-primary-foreground" : i + 1 === step ? "border-primary text-primary" : "border-border text-muted-foreground"}`,
                    children: i + 1
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium hidden sm:inline", children: label })
              ]
            }
          ),
          i < STEP_LABELS.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `flex-1 h-px mx-2 ${i + 1 < step ? "bg-primary" : "bg-border"}`
            }
          )
        ] }, label))
      }
    ),
    step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: handleStep1,
        className: "rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6",
        children: [
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBanner, { message: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "category", children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Select the category that best describes your need." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: category ?? "",
                  onValueChange: (v) => setCategory(v),
                  required: true,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      SelectTrigger,
                      {
                        "data-ocid": "submit_request.category_select",
                        id: "category",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a category" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.value, children: c.label }, c.value)) })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Example: Education" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Case Title" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Describe your request in one sentence." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "title",
                  "data-ocid": "submit_request.title_input",
                  placeholder: "Enter your case title",
                  value: title,
                  onChange: (e) => setTitle(e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Example: University tuition support for final semester." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "description", children: "Case Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Explain your situation clearly." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "description",
                  "data-ocid": "submit_request.description_textarea",
                  placeholder: "Write your full situation here.",
                  rows: 5,
                  value: description,
                  onChange: (e) => setDescription(e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Example: I am a final-year engineering student and cannot afford my remaining tuition fee." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "country", children: "Country" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Select your country of residence." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "country",
                    "data-ocid": "submit_request.country_input",
                    placeholder: "Select your country",
                    value: country,
                    onChange: (e) => setCountry(e.target.value),
                    required: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Example: Pakistan" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "city", children: "City" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enter your city name." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "city",
                    "data-ocid": "submit_request.city_input",
                    placeholder: "Enter your city",
                    value: city,
                    onChange: (e) => setCity(e.target.value),
                    required: true
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Example: Karachi" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: "Amount Needed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enter the total amount you need in your local currency." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "amount",
                  type: "number",
                  min: "1",
                  "data-ocid": "submit_request.amount_input",
                  placeholder: "Enter required amount",
                  value: amount,
                  onChange: (e) => setAmount(e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Example: 50000 PKR" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "deadline", children: "Deadline" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "When do you need this support by?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "deadline",
                  type: "date",
                  "data-ocid": "submit_request.deadline_input",
                  placeholder: "Select a deadline",
                  value: deadline,
                  onChange: (e) => setDeadline(e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Example: 2025-12-31" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "submit",
              "data-ocid": "submit_request.next_button",
              disabled: submitting || category === null,
              className: "w-full h-11 font-semibold",
              children: submitting ? "Saving..." : "Continue to Documents"
            }
          )
        ]
      }
    ),
    step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-foreground", children: "Upload Supporting Documents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Upload documents that verify your request. You can add more later." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "documents", children: "Supporting Documents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Upload documents that verify your request (fee voucher, medical report, utility bill, etc.)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "documents",
            type: "file",
            "data-ocid": "submit_request.upload_button",
            accept: ".pdf,.jpg,.jpeg,.png",
            multiple: true,
            className: "cursor-pointer"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Example: Fee voucher, medical report, utility bill." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Accepted: PDF, JPG, PNG" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "video", children: "Video Appeal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Record a short video explaining your situation. Maximum 60 seconds." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "video",
            type: "file",
            "data-ocid": "submit_request.video_upload",
            accept: "video/mp4,video/quicktime,video/webm",
            className: "cursor-pointer"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Example: Introduce yourself and explain why you need support." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Accepted: MP4, MOV, WEBM. Max 60 seconds." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            type: "button",
            "data-ocid": "submit_request.back_button",
            onClick: () => setStep(1),
            className: "flex-1",
            children: "Back"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": "submit_request.skip_button",
            onClick: handleStep2,
            className: "flex-1",
            children: "Continue to Payment"
          }
        )
      ] })
    ] }),
    step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-semibold text-foreground", children: "Listing Fee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Pay $1 USD to publish your case and make it visible to Heroes." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-muted/50 p-4 space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Listing fee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "$1.00 USD" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Case" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate max-w-[180px]", children: title })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": "submit_request.payment_section",
          className: "space-y-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                "data-ocid": "submit_request.pay_button",
                disabled: submitting,
                onClick: handleStep3Pay,
                className: "w-full h-11 font-semibold",
                children: submitting ? "Redirecting to payment..." : "Pay $1 & Publish Case"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                type: "button",
                "data-ocid": "submit_request.back_to_docs_button",
                onClick: () => setStep(2),
                className: "w-full",
                children: "Back"
              }
            )
          ]
        }
      )
    ] })
  ] }) });
}
export {
  SubmitRequestPage as default
};

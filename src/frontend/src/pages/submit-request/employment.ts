export const EMPLOYMENT_OPTIONS = [
  {
    value: "Salaried / Employed",
    label: "Salaried / Employed",
    description: "Company employee, or recently laid off within the last 1–2 years",
    documents: [
      { key: "salarySlipUrl", label: "Last 6 Months Salary Slips", required: true, hint: "If recently laid off, upload your last available salary slip" },
      { key: "statementUrl", label: "Last 6 Months Bank Statement", required: true, hint: "Bank, EasyPaisa, or JazzCash" },
    ],
  },
  {
    value: "Business / Shop Owner",
    label: "Business / Shop Owner",
    description: "Owner of a shop, store, or commercial business",
    documents: [
      { key: "businessProofUrl", label: "Proof of Business / Shop Verification", required: true, hint: "Shop storefront with signboard or business visiting card" },
      { key: "statementUrl", label: "Last 6 Months Bank Statement", required: true, hint: "Personal or business bank account, EasyPaisa, or JazzCash" },
    ],
  },
  {
    value: "Self-Employed / Driver / Rider / Daily Wager",
    label: "Self-Employed / Driver / Rider / Daily Wager",
    description: "Driver, rider, freelancer, or daily-wage worker",
    documents: [
      { key: "professionProofUrl", label: "Proof of Profession / App Profile Screenshot", required: true, hint: "Driver's license or active Uber, Careem, InDrive, or Yango profile" },
      { key: "statementUrl", label: "Last 6 Months Account Statement", required: true, hint: "Bank account, EasyPaisa, or JazzCash" },
    ],
  },
  {
    value: "Unemployed / Housewife",
    label: "Unemployed / Housewife",
    description: "No current source of income",
    documents: [
      { key: "statementUrl", label: "Last 6 Months Account Statement (If available)", required: false, hint: "Bank account, EasyPaisa, or JazzCash" },
      { key: "supportDeclarationUrl", label: "Household Provider Income Proof", required: true, hint: "Salary slip, pension proof, business proof, or other income evidence for the person responsible for household expenses" },
    ],
  },
  {
    value: "Retired",
    label: "Retired",
    description: "Previously employed and now receiving a pension or retirement benefit",
    documents: [
      { key: "pensionProofUrl", label: "Pension Slip / Pension Proof", required: true, hint: "Government pension slip, company pension document, or retirement benefit proof" },
      { key: "statementUrl", label: "Last 6 Months Bank Statement", required: true, hint: "Bank, EasyPaisa, or JazzCash account receiving pension or household income" },
    ],
  },
  {
    value: "Previously Employed / Left Job / Laid Off",
    label: "Previously Employed / Left Job / Laid Off",
    description: "Previously worked but left the job or was laid off and has no current salary",
    documents: [
      { key: "previousIncomeProofUrl", label: "Previous Employment / Income Proof", required: true, hint: "Previous salary slip, employment letter, termination/layoff letter, or proof of the earlier income source" },
      { key: "statementUrl", label: "Last 6 Months Bank Statement", required: true, hint: "Bank, EasyPaisa, or JazzCash" },
    ],
  },
] as const;

export type EmploymentStatus = (typeof EMPLOYMENT_OPTIONS)[number]["value"];
export type EmploymentDocumentKey = "salarySlipUrl" | "statementUrl" | "businessProofUrl" | "professionProofUrl" | "supportDeclarationUrl" | "pensionProofUrl" | "previousIncomeProofUrl";

export function getEmploymentOption(value: unknown) {
  return EMPLOYMENT_OPTIONS.find((option) => option.value === value);
}

export function getRequiredEmploymentDocumentKeys(value: unknown): EmploymentDocumentKey[] {
  return (getEmploymentOption(value)?.documents || [])
    .filter((document) => document.required)
    .map((document) => document.key as EmploymentDocumentKey);
}

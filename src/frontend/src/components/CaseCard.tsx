import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ClipboardCheck, Copy, ExternalLink, FileText, Heart, HandCoins, Building2, BookOpen, User, Users, XCircle } from "lucide-react";
import { useState } from "react";

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", PKR: "Rs", GBP: "£", EUR: "€", INR: "₹", AED: "AED", SAR: "SAR" };

function sym(currency?: string) {
  return CURRENCY_SYMBOLS[currency || "USD"] ?? currency ?? "$";
}

function getDocLabel(key: string) {
  const labels: Record<string, string> = {
    selfie_url: "Case Selfie",
    video_url: "Case Appeal Video",
    paid_receipt_url: "Paid Receipt / Transaction Proof",
    cnic_front_url: "CNIC Front",
    cnic_back_url: "CNIC Back",
    medical_report_url: "Medical Report / Bill",
    fee_challan_url: "Fee Challan / Admission Letter",
    rental_agreement_url: "Rental Agreement",
    landlord_cnic_url: "Landlord CNIC",
    bill: "Bill / Challan Photo",
    salary_slip: "Salary Slip (6 Months)",
    statement: "Bank Statement (6 Months)",
    student_id: "Student ID / B-Form",
    student_id_proof: "Student ID Proof",
  };
  return labels[key] ?? key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/\\b\\w/g, (c) => c.toUpperCase()).trim();
}

async function copyText(text?: string) {
  if (!text || typeof navigator === "undefined" || !navigator.clipboard) return;
  try { await navigator.clipboard.writeText(text); } catch { /* Clipboard may be unavailable in restricted browsers. */ }
}

function StatusBadge({ status }: { status?: string }) {
  const colors: Record<string, string> = { pending: "bg-orange-100 text-orange-700", approved: "bg-teal-100 text-teal-700", rejected: "bg-red-100 text-red-700", completed: "bg-blue-100 text-blue-700" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[status || ""] ?? "bg-gray-100 text-gray-600"}`}>{status === "none" ? "NO KYC" : (status || "unknown").toUpperCase()}</span>;
}

function DetailRow({ label, value, mono }: { label: string; value?: unknown; mono?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  const text = String(value);
  return <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0"><div className="min-w-0"><p className="text-[10px] uppercase text-muted-foreground">{label}</p><p className={`text-sm font-medium break-all ${mono ? "font-mono" : ""}`}>{text}</p></div><button type="button" onClick={() => copyText(text)} className="shrink-0 h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-primary"><Copy className="h-3 w-3" /></button></div>;
}

function Img({ url, label }: { url: string; label: string }) {
  return <div className="space-y-1"><p className="text-[10px] text-muted-foreground truncate" title={label}>{label}</p><a href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={label} className="w-full rounded border max-h-28 object-cover hover:opacity-95" /></a></div>;
}

// ============================================================
//  CASE CARD - FULLY COMPLETE (ALL FIELDS VISIBLE)
// ============================================================
function CaseCard({ c, onUpdate, resolutions, profileMap }: any) {
  const [reason, setReason] = useState("");
  const cur = c.currency || "USD";
  const s = sym(cur);
  const seeker = profileMap[c.user_id];
  const hasPayment = c.institute_name || c.account_number || c.account_title || c.account_iban;
  const catDetails = c.category_details && typeof c.category_details === "object" ? c.category_details : null;
  const catDocs = catDetails?._documents && typeof catDetails._documents === "object" ? catDetails._documents : {};

  // ---- 1. Extract all possible fields from category_details ----
  const allFields: { label: string; value: any }[] = [];
  if (catDetails) {
    const excludeKeys = new Set([
      "_documents", "edu_documents", "edu_sub_fields", "property_ownership",
      "rental_agreement_url", "landlord_cnic_url", "job_status", "gender",
      "marital_status", "is_orphan", "orphan_parent", "seeker_name",
      "seeker_contact", "receiver_name", "receiver_contact", "receiver_bank",
      "receiver_account", "disability_mode", "disability_type", "disability_reason",
      "disability_shop_name", "disability_shop_contact", "disability_hospital",
      "treatment_amount", "treatment_expiry", "treatment_patient_number",
      "disability_bank_title", "disability_bank_number", "institute_name",
      "institute_contact", "institute_address", "is_institute_in_list",
      "reference_type", "reference_number", "due_date", "edu_sub_type",
      "edu_admission_level", "bill_owner_name",
    ]);
    for (const [key, val] of Object.entries(catDetails)) {
      if (excludeKeys.has(key)) continue;
      if (key.startsWith("_")) continue;
      if (typeof val === "string" && val.trim()) {
        allFields.push({ label: getDocLabel(key), value: val });
      } else if (typeof val === "number" || typeof val === "boolean") {
        allFields.push({ label: getDocLabel(key), value: String(val) });
      }
    }
  }

  // ---- 2. Education sub-fields ----
  const eduSubFields = catDetails?.edu_sub_fields || {};
  const eduFields: { label: string; value: any }[] = [];
  for (const [key, val] of Object.entries(eduSubFields)) {
    if (val) eduFields.push({ label: getDocLabel(key), value: val });
  }

  // ---- 3. Personal details (always show) ----
  const personalDetails = [
    { label: "Job Status", value: catDetails?.job_status || "Not provided" },
    { label: "Gender", value: catDetails?.gender || "Not provided" },
    { label: "Marital Status", value: catDetails?.marital_status || "Not provided" },
    { label: "Orphan", value: catDetails?.is_orphan || "Not provided" },
    { label: "Orphan Parent", value: catDetails?.orphan_parent || "Not provided" },
    { label: "Seeker Name", value: catDetails?.seeker_name || "Not provided" },
    { label: "Seeker Contact", value: catDetails?.seeker_contact || "Not provided" },
  ];

  // ---- 4. Receiver details ----
  const receiverDetails = [
    { label: "Receiver Name", value: catDetails?.receiver_name || "" },
    { label: "Receiver Contact", value: catDetails?.receiver_contact || "" },
    { label: "Receiver Bank", value: catDetails?.receiver_bank || "" },
    { label: "Receiver Account", value: catDetails?.receiver_account || "" },
    { label: "Receiver Address", value: catDetails?.receiver_address || "" },
    { label: "Shop Name", value: catDetails?.receiver_shop_name || "" },
  ].filter(d => d.value);

  // ---- 5. Disability details ----
  const disabilityDetails = [
    { label: "Disability Mode", value: catDetails?.disability_mode || "" },
    { label: "Disability Type", value: catDetails?.disability_type || "" },
    { label: "Disability Reason", value: catDetails?.disability_reason || "" },
    { label: "Shop Name", value: catDetails?.disability_shop_name || "" },
    { label: "Shop Contact", value: catDetails?.disability_shop_contact || "" },
    { label: "Hospital", value: catDetails?.disability_hospital || "" },
    { label: "Treatment Amount", value: catDetails?.treatment_amount || "" },
    { label: "Treatment Expiry", value: catDetails?.treatment_expiry || "" },
    { label: "Patient/Bill Number", value: catDetails?.treatment_patient_number || "" },
    { label: "Bank Title (Stipend)", value: catDetails?.disability_bank_title || "" },
    { label: "Bank Number (Stipend)", value: catDetails?.disability_bank_number || "" },
  ].filter(d => d.value);

  // ---- 6. Property details (always show) ----
  const propertyDetails = [
    { label: "Property Ownership", value: catDetails?.property_ownership === "rented" ? "Rented" : catDetails?.property_ownership === "owned" ? "Owned" : "Not provided" },
  ];
  // Additional property docs
  const rentalAgreement = catDetails?.rental_agreement_url || "";
  const landlordCnic = catDetails?.landlord_cnic_url || "";
  const ownerCnic = catDetails?.owner_cnic || "";
  const ownerRelation = catDetails?.owner_relation || "";

  // ---- 7. Files (all files with labels) ----
  const fileEntries: { key: string; label: string; url: string }[] = [];
  const topFileKeys = ["selfie_url", "video_url", "paid_receipt_url"];
  for (const key of topFileKeys) {
    if (c[key] && typeof c[key] === "string" && c[key].startsWith("http")) {
      fileEntries.push({ key, label: getDocLabel(key), url: c[key] });
    }
  }
  if (Array.isArray(c.photo_urls)) {
    const namedUrls = new Set(Object.values(catDocs));
    let extraCount = 0;
    for (const url of c.photo_urls) {
      if (typeof url === "string" && url.startsWith("http") && !namedUrls.has(url)) {
        extraCount++;
        fileEntries.push({ key: `extra_doc_${extraCount}`, label: `Document ${extraCount}`, url });
      }
    }
  }
  for (const [key, url] of Object.entries(catDocs)) {
    if (typeof url === "string" && url.startsWith("http")) {
      fileEntries.push({ key, label: getDocLabel(key), url });
    }
  }
  // Also include any other doc fields from catDetails
  if (catDetails) {
    for (const [key, val] of Object.entries(catDetails)) {
      if (key === "_documents" || key === "edu_documents") continue;
      if (typeof val === "string" && val.startsWith("http")) {
        if (!fileEntries.some(f => f.url === val)) {
          fileEntries.push({ key, label: getDocLabel(key), url: val });
        }
      }
    }
  }
  // Remove duplicates
  const seen = new Set<string>();
  const uniqueFiles = fileEntries.filter(f => {
    if (seen.has(f.url)) return false;
    seen.add(f.url);
    return true;
  });

  // ---- 8. Required Documents (based on category) ----
  const requiredDocKeys = [
    { key: "bill", label: "Bill / Challan Photo" },
    { key: "salary_slip", label: "Salary Slip (6 Months)" },
    { key: "statement", label: "Bank Statement (6 Months)" },
    { key: "rental_agreement", label: "Rental Agreement" },
    { key: "landlord_cnic", label: "Landlord's CNIC" },
    { key: "owner_cnic", label: "Owner's CNIC" },
    { key: "disability_cnic", label: "Disability CNIC" },
    { key: "disability_photo", label: "Disability Photo" },
    { key: "product_receipt", label: "Product Quotation" },
    { key: "doctor_prescription", label: "Doctor's Prescription" },
    { key: "student_id", label: "Student ID / B-Form" },
    { key: "student_id_proof", label: "Student ID Proof" },
    { key: "admission_proof", label: "Admission Proof (Offer Letter)" },
    { key: "fee_challan", label: "Fee Challan / Voucher" },
    { key: "books_quotation", label: "Books Quotation" },
    { key: "uniform_quotation", label: "Uniform Quotation" },
    { key: "uniform_items", label: "Uniform Items List" },
    { key: "doctor_report", label: "Doctor's Report" },
    { key: "father_death_cert", label: "Father's Death Certificate" },
    { key: "mother_death_cert", label: "Mother's Death Certificate" },
    { key: "husband_death_cert", label: "Husband's Death Certificate" },
    { key: "wife_death_cert", label: "Wife's Death Certificate" },
    { key: "divorce_cert", label: "Divorce Certificate" },
    { key: "orphan_proof", label: "Orphan Proof" },
    { key: "b_form", label: "B-Form" },
    { key: "frc", label: "FRC" },
    { key: "nikah_nama", label: "Nikah Nama" },
  ];
  const requiredFiles = requiredDocKeys
    .filter(doc => {
      // Only show relevant ones (if they exist in catDocs or catDetails)
      const exists = catDocs[doc.key] || (catDetails?.[doc.key] && typeof catDetails[doc.key] === "string" && catDetails[doc.key].startsWith("http"));
      return exists;
    })
    .map(doc => ({
      key: doc.key,
      label: doc.label,
      url: catDocs[doc.key] || catDetails?.[doc.key] || null,
    }))
    .filter(d => d.url);

  const isRejected = c.status === "rejected";

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isRejected ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : "bg-card"}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={c.status} />
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>
        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{c.urgency}</span>
        {c.was_free
          ? <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">FREE</span>
          : <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">PAID</span>}
        {c.closed_by_admin && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">FUNDRAISED & PAID</span>}
      </div>

      {isRejected && c.rejection_reason && (
        <div className="rounded-lg border-2 border-red-300 bg-red-100 dark:bg-red-950/30 p-4">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700">❌ Case Rejected</p>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{c.rejection_reason}</p>
              {c.reviewed_at && <p className="text-xs text-red-500 mt-2">Reviewed on: {new Date(c.reviewed_at).toLocaleString()}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="text-sm space-y-1">
        <p className="font-semibold">{c.title}</p>
        <p className="text-muted-foreground">{c.short_description}</p>
        <p className="text-muted-foreground text-xs">📍 {c.city}, {c.country} {c.amount_needed && `· Needs: ${s} ${c.amount_needed} ${cur}`}</p>
        {c.deadline && (
          <p className="text-xs font-bold text-red-600 flex items-center gap-1">
            ⏰ Bill / Case Due (Expiry) Date: {new Date(c.deadline).toLocaleDateString()}
          </p>
        )}
        {c.amount_needed > 0 && <p className="text-xs text-teal-600 font-medium">Collected: {s} {c.amount_collected ?? 0} / {s} {c.amount_needed}</p>}

        {!isRejected && (
          <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1">📋 Full Case Description</p>
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {c.description || "No description provided"}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-xs space-y-0.5">
        <p className="font-semibold text-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Submitted by</p>
        <p className="text-muted-foreground">{seeker?.full_name || "—"} · {seeker?.email || c.user_id?.slice(0, 8)}</p>
      </div>

      {/* ---- PERSONAL DETAILS (always visible) ---- */}
      <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
        <p className="text-xs font-semibold text-primary flex items-center gap-1"><User className="h-3 w-3" /> Personal Details</p>
        {personalDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
      </div>

      {/* ---- RECEIVER DETAILS ---- */}
      {receiverDetails.length > 0 && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
          <p className="text-xs font-semibold text-primary flex items-center gap-1"><HandCoins className="h-3 w-3" /> Payment Receiver</p>
          {receiverDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* ---- DISABILITY DETAILS ---- */}
      {disabilityDetails.length > 0 && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
          <p className="text-xs font-semibold text-primary flex items-center gap-1"><Heart className="h-3 w-3" /> Disability Details</p>
          {disabilityDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* ---- PROPERTY DETAILS (always visible) ---- */}
      <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
        <p className="text-xs font-semibold text-primary flex items-center gap-1"><Building2 className="h-3 w-3" /> Property Details</p>
        {propertyDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        {catDetails?.owner_relation && <DetailRow label="Owner Relation" value={catDetails.owner_relation} />}
        {rentalAgreement && <Img url={rentalAgreement} label="Rental Agreement" />}
        {landlordCnic && <Img url={landlordCnic} label="Landlord's CNIC" />}
        {ownerCnic && <Img url={ownerCnic} label="Owner's CNIC" />}
      </div>

      {/* ---- EDUCATION FIELDS ---- */}
      {eduFields.length > 0 && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 p-3 space-y-1">
          <p className="text-xs font-semibold text-blue-700 flex items-center gap-1"><BookOpen className="h-3 w-3" /> Education Details</p>
          {eduFields.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* ---- OTHER DETAILS ---- */}
      {allFields.length > 0 && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
          <p className="text-xs font-semibold text-primary flex items-center gap-1"><ClipboardCheck className="h-3 w-3" /> Other Details</p>
          {allFields.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* ---- REQUIRED DOCUMENTS SECTION ---- */}
      {requiredFiles.length > 0 && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 p-3 space-y-2">
          <p className="text-xs font-semibold text-yellow-800 flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Required Documents</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {requiredFiles.map(({ key, label, url }) => (
              <div key={key + url} className="space-y-1 bg-background/80 p-1.5 rounded border">
                <p className="text-[10px] font-medium text-foreground truncate" title={label}>📎 {label}</p>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={label} className="w-full rounded border max-h-28 object-cover hover:opacity-95" />
                  </a>
                ) : (
                  <p className="text-[10px] text-red-500 font-semibold">❌ Not uploaded</p>
                )}
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="block text-[9px] text-primary hover:underline text-center">
                    Open in Full Size ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- ALL UPLOADED FILES ---- */}
      {uniqueFiles.length > 0 ? (
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold flex items-center gap-1"><FileText className="h-4 w-4" /> All Uploaded Files ({uniqueFiles.length})</p>
            <div className="flex gap-1">
              <button onClick={() => copyText(uniqueFiles.map(f => f.url).join("\n"))} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                <Copy className="h-3 w-3" /> Copy URLs
              </button>
              <button onClick={() => copyText(JSON.stringify(c, null, 2))} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                <Copy className="h-3 w-3" /> Copy Raw Data
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {uniqueFiles.map(({ key, label, url }) => {
              const isVideo = url.match(/\.(mp4|webm|mov|avi)$/i) || url.includes("video");
              const isPdf = url.match(/\.pdf$/i);
              return (
                <div key={key + url} className="space-y-1 bg-background/80 p-1.5 rounded border">
                  <p className="text-[10px] font-medium text-foreground truncate" title={label}>📎 {label}</p>
                  {isVideo ? (
                    <video src={url} controls className="w-full rounded border max-h-32 bg-black" />
                  ) : isPdf ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block text-center py-4 bg-muted text-primary text-xs font-semibold rounded hover:underline">
                      📄 View PDF
                    </a>
                  ) : (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={label} className="w-full rounded border max-h-28 object-cover hover:opacity-95" />
                    </a>
                  )}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="block text-[9px] text-primary hover:underline text-center">
                    Open in Full Size ↗
                  </a>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground">📌 Click any image to enlarge.</p>
        </div>
      ) : (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 p-3 text-xs text-yellow-700">
          ⚠️ No files uploaded for this case.
        </div>
      )}

      {/* ---- INSTITUTE PAYMENT DETAILS ---- */}
      {hasPayment && (
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 space-y-1">
          <p className="font-semibold text-sm flex items-center gap-1 text-amber-700"><Building2 className="h-4 w-4" /> Institute Payment Details</p>
          <DetailRow label="Institute / Provider" value={c.institute_name} />
          <DetailRow label="Payment Method" value={c.payment_method} />
          <DetailRow label="Account Title / Reference" value={c.account_title} />
          <DetailRow label="Account / Bill Number" value={c.account_number} mono />
          <DetailRow label="IBAN" value={c.account_iban} mono />
          <DetailRow label="Institute Contact" value={c.institute_contact} mono />
          <DetailRow label="Institute Address" value={c.institute_address} />
          {/* ADD BILL OWNER NAME */}
          {catDetails?.bill_owner_name && (
            <DetailRow label="Bill Owner Name" value={catDetails.bill_owner_name} />
          )}
        </div>
      )}

      {/* ---- RESOLUTIONS (helps) ---- */}
      {resolutions.length > 0 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-2">
          <p className="font-semibold text-sm flex items-center gap-1"><Heart className="h-4 w-4 text-primary" /> All Helps on this case</p>
          {resolutions.map((r: any) => (
            <div key={r.id} className="text-xs space-y-0.5 border-b border-border/50 last:border-0 pb-2">
              <p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.status === "completed" ? "bg-teal-100 text-teal-700" : r.status === "disputed" ? "bg-red-100 text-red-700" : r.status === "seeker_confirmed" ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-700"}`}>{r.status?.toUpperCase()}</span>
                {" "}
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.paid_to === "givethra" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-700"}`}>{r.paid_to === "givethra" ? "FUNDRAISING" : "DIRECT"}</span>
              </p>
              <p><span className="text-muted-foreground">Amount:</span> {s} {r.seeker_confirmed_amount ?? r.amount_paid} {cur} · <span className="text-muted-foreground">TXN:</span> <span className="font-mono">{r.transaction_id}</span></p>
              {r.receipt_url && <a href={r.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary"><ExternalLink className="h-3 w-3" /> Receipt</a>}
            </div>
          ))}
        </div>
      )}

      {/* ---- RAW DETAILS BUTTON ---- */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => copyText(JSON.stringify(catDetails, null, 2))}>
          <Copy className="h-3 w-3 mr-1" /> Show Raw Details
        </Button>
      </div>

      {/* ---- ADMIN ACTIONS ---- */}
      {c.status === "pending" && (
        <div className="space-y-2">
          <Textarea placeholder="Rejection reason (e.g. 'video missing', 'bill not clear', 'account seems personal')" value={reason} onChange={e => setReason(e.target.value)} rows={2} className="text-sm" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => onUpdate(c.id, "approved")}><CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve & Publish</Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => onUpdate(c.id, "rejected", reason)}><XCircle className="h-3.5 w-3.5 mr-1" /> Reject</Button>
          </div>
        </div>
      )}
    </div>
  );
}

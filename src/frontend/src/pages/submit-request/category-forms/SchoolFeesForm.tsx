// src/frontend/src/pages/submit-request/category-forms/SchoolFeesForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";
import { EDUCATION_INSTITUTES } from "@/lib/institutesList";
import { useState } from "react";

export default function SchoolFeesForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { catFields, catDocUrls, refNumber, eduSubType, eduSubFields } = formData;
  const [search, setSearch] = useState("");
  const [isOther, setIsOther] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [otherAddress, setOtherAddress] = useState("");

  const setField = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      catFields: { ...prev.catFields, [key]: value },
    }));
  };

  const setEduField = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      eduSubFields: { ...prev.eduSubFields, [key]: value },
    }));
  };

  const setDoc = (key: string, url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls, [key]: url },
    }));
  };

  const setEduSubType = (type: string) => {
    setFormData((prev: any) => ({ ...prev, eduSubType: type, eduSubFields: {} }));
  };

  const setRef = (value: string) => {
    setFormData((prev: any) => ({ ...prev, refNumber: value }));
  };

  const filteredInstitutes = EDUCATION_INSTITUTES.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const isValid = catFields.student_name?.trim() && catDocUrls.fee_challan;

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="🎓 School, College & University Fees"
      subtitle="Provide fee details for ONE student only."
      guide="⚠️ One case = ONE student only. Upload a clear photo of the fee challan/voucher."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>What type of fee? *</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "school", label: "🏫 School" },
              { value: "college", label: "🎓 College" },
              { value: "university", label: "🏛️ University" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEduSubType(opt.value)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                  eduSubType === opt.value ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {eduSubType && (
          <>
            {!isOther && !catFields.institute_name && (
              <div className="space-y-2">
                <Label>Search & Select Your Institute *</Label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type institute name..."
                  className="w-full px-4 py-2.5 rounded-lg border"
                />
                {search.length >= 2 && (
                  <div className="rounded-xl border divide-y overflow-hidden max-h-48 overflow-y-auto">
                    {filteredInstitutes.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setField("institute_name", n)}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5"
                      >
                        {n}
                      </button>
                    ))}
                    {filteredInstitutes.length === 0 && (
                      <p className="px-3 py-2.5 text-sm text-muted-foreground">No match found.</p>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsOther(true)}
                  className="text-xs text-primary font-medium underline"
                >
                  My institute is not in the list
                </button>
              </div>
            )}

            {catFields.institute_name && !isOther && (
              <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-300 p-3 flex items-center justify-between">
                <p className="text-sm font-medium text-green-700">✓ {catFields.institute_name}</p>
                <button
                  type="button"
                  onClick={() => setField("institute_name", "")}
                  className="text-xs text-primary underline"
                >
                  Change
                </button>
              </div>
            )}

            {isOther && (
              <div className="space-y-3 rounded-xl border p-3">
                <div className="flex justify-between">
                  <p className="text-sm font-semibold">Institute (not in list)</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOther(false);
                      setOtherName("");
                      setOtherContact("");
                      setOtherAddress("");
                    }}
                    className="text-xs text-primary underline"
                  >
                    Back to list
                  </button>
                </div>
                <TextInput
                  field="Institute Full Name"
                  value={otherName}
                  onChange={setOtherName}
                  placeholder="Complete official name"
                />
                <TextInput
                  field="Institute Contact Number"
                  value={otherContact}
                  onChange={setOtherContact}
                  placeholder="Office number"
                />
                <TextInput
                  field="Institute Address"
                  value={otherAddress}
                  onChange={setOtherAddress}
                  placeholder="Complete address"
                />
              </div>
            )}

            {(catFields.institute_name || isOther) && (
              <>
                <TextInput
                  field="Student's Name (ONE student)"
                  value={catFields.student_name}
                  onChange={(v) => setField("student_name", v)}
                  placeholder="Full name of student"
                />

                <TextInput
                  field="Father's Name"
                  value={catFields.father_name}
                  onChange={(v) => setField("father_name", v)}
                  placeholder="Father's full name"
                />

                <TextInput
                  field="Roll No / Registration No"
                  value={catFields.roll_no}
                  onChange={(v) => setField("roll_no", v)}
                  placeholder="Student's roll number"
                />

                {eduSubType === "school" && (
                  <>
                    <TextInput
                      field="Class / Grade"
                      value={eduSubFields.class_grade}
                      onChange={(v) => setEduField("class_grade", v)}
                      placeholder="e.g. Grade 8"
                    />
                    <TextInput
                      field="Fee Month"
                      value={eduSubFields.fee_month}
                      onChange={(v) => setEduField("fee_month", v)}
                      placeholder="e.g. August 2026"
                    />
                  </>
                )}

                {eduSubType === "college" && (
                  <>
                    <div className="space-y-2">
                      <Label>Program / Class *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["FA", "FSc", "ICS", "I.Com", "Other"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setEduField("program", opt)}
                            className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                              eduSubFields.program === opt ? "bg-primary text-white border-primary" : "border-border"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Year *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["1st Year", "2nd Year"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setEduField("year", opt)}
                            className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                              eduSubFields.year === opt ? "bg-primary text-white border-primary" : "border-border"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <TextInput
                      field="Fee Month"
                      value={eduSubFields.fee_month}
                      onChange={(v) => setEduField("fee_month", v)}
                      placeholder="e.g. August 2026"
                    />
                  </>
                )}

                {eduSubType === "university" && (
                  <>
                    <TextInput
                      field="Program / Degree"
                      value={eduSubFields.program_degree}
                      onChange={(v) => setEduField("program_degree", v)}
                      placeholder="e.g. BS Psychology"
                    />
                    <TextInput
                      field="Semester / Year"
                      value={eduSubFields.semester_year}
                      onChange={(v) => setEduField("semester_year", v)}
                      placeholder="e.g. Fall 2026"
                    />
                    <TextInput
                      field="Fee Month"
                      value={eduSubFields.fee_month}
                      onChange={(v) => setEduField("fee_month", v)}
                      placeholder="e.g. August 2026"
                    />
                  </>
                )}

                <TextInput
                  field="Fee Challan / Voucher Number"
                  value={refNumber}
                  onChange={setRef}
                  placeholder="Challan number from the voucher"
                />

                <FileUpload
                  label="Fee Challan / Voucher Photo"
                  key="fee_challan"
                  required
                  hint="Challan should clearly show amount and due date"
                  onUpload={(url) => setDoc("fee_challan", url)}
                  value={catDocUrls.fee_challan}
                />

                <FileUpload
                  label="Student B-Form / CNIC / School ID"
                  key="student_id_proof"
                  required
                  hint="Clear proof of student identity"
                  onUpload={(url) => setDoc("student_id_proof", url)}
                  value={catDocUrls.student_id_proof}
                />
              </>
            )}
          </>
        )}
      </div>
    </BaseCategoryForm>
  );
}

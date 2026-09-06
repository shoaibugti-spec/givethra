// src/frontend/src/pages/submit-request/category-forms/EducationBooksForm.tsx
import { BaseCategoryForm, TextInput, FileUpload } from "./BaseCategoryForm";
import { EDUCATION_INSTITUTES } from "@/lib/institutesList";
import { useState } from "react";

export default function EducationBooksForm({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { catFields, catDocUrls, eduSubType, eduAdmissionLevel, eduSubFields } = formData;
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
    setFormData((prev: any) => ({
      ...prev,
      eduSubType: type,
      eduAdmissionLevel: "",
      eduSubFields: {},
    }));
  };

  const setEduAdmissionLevel = (level: string) => {
    setFormData((prev: any) => ({
      ...prev,
      eduAdmissionLevel: level,
      eduSubFields: {},
    }));
  };

  const filteredInstitutes = EDUCATION_INSTITUTES.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const isValid = catFields.student_name?.trim() && catFields.student_class?.trim();

  return (
    <BaseCategoryForm
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
      title="📚 Education, Books & Admission"
      subtitle="Provide details for admission, books, or uniform for ONE student only."
      guide="⚠️ One case = ONE student only. Choose what type of help you need."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>What do you need help with? *</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "admission", label: "🎓 Admission" },
              { value: "books", label: "📚 Books" },
              { value: "uniform", label: "👕 Uniform" },
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
            <TextInput
              field="Student's Full Name"
              value={catFields.student_name}
              onChange={(v) => setField("student_name", v)}
              placeholder="Full name of student"
            />

            <TextInput
              field="Class / Grade / Program"
              value={catFields.student_class}
              onChange={(v) => setField("student_class", v)}
              placeholder="e.g. Grade 8, FA, BS"
            />

            {eduSubType === "admission" && (
              <>
                <div className="space-y-2">
                  <Label>Where are you seeking admission? *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["School", "College", "University"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setEduAdmissionLevel(level)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                          eduAdmissionLevel === level ? "bg-primary text-white border-primary" : "border-border"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {eduAdmissionLevel && (
                  <>
                    {!isOther && !catFields.institute_name && (
                      <div className="space-y-2">
                        <Label>Search & Select {eduAdmissionLevel} *</Label>
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder={`Type ${eduAdmissionLevel.toLowerCase()} name...`}
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
                          field="Admission Type"
                          value={catFields.admission_type}
                          onChange={(v) => setField("admission_type", v)}
                          placeholder="New Admission / Re-admission / Transfer"
                        />

                        <TextInput
                          field="Admission Status"
                          value={catFields.admission_status}
                          onChange={(v) => setField("admission_status", v)}
                          placeholder="Selected / Admission Offered / Confirmed"
                        />

                        <FileUpload
                          label="Admission / Selection Proof (Offer Letter / Merit List)"
                          key="admission_proof"
                          required
                          hint="Clear photo of offer letter or merit list"
                          onUpload={(url) => setDoc("admission_proof", url)}
                          value={catDocUrls.admission_proof}
                        />

                        <FileUpload
                          label="Fee Challan / Voucher (with amount & due date)"
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
              </>
            )}

            {eduSubType === "books" && (
              <>
                <TextInput
                  field="Institute / School Name"
                  value={catFields.institute_name}
                  onChange={(v) => setField("institute_name", v)}
                  placeholder="School or college name"
                />

                <FileUpload
                  label="Books List / Quotation from Shop"
                  key="books_quotation"
                  required
                  hint="Clear photo of book list and price quotation"
                  onUpload={(url) => setDoc("books_quotation", url)}
                  value={catDocUrls.books_quotation}
                />

                <FileUpload
                  label="Student B-Form / School/College ID"
                  key="student_id_proof"
                  required
                  hint="Student identity proof"
                  onUpload={(url) => setDoc("student_id_proof", url)}
                  value={catDocUrls.student_id_proof}
                />
              </>
            )}

            {eduSubType === "uniform" && (
              <>
                <TextInput
                  field="Institute / School Name"
                  value={catFields.institute_name}
                  onChange={(v) => setField("institute_name", v)}
                  placeholder="School or college name"
                />

                <FileUpload
                  label="Uniform List / Quotation from Shop"
                  key="uniform_quotation"
                  required
                  hint="Clear photo of uniform items and price quotation"
                  onUpload={(url) => setDoc("uniform_quotation", url)}
                  value={catDocUrls.uniform_quotation}
                />

                <FileUpload
                  label="Student B-Form / School/College ID"
                  key="student_id_proof"
                  required
                  hint="Student identity proof"
                  onUpload={(url) => setDoc("student_id_proof", url)}
                  value={catDocUrls.student_id_proof}
                />

                <FileUpload
                  label="Items Needed (List photo or written)"
                  key="uniform_items"
                  required
                  hint="List of uniform items (shoes, bag, winter uniform etc.)"
                  onUpload={(url) => setDoc("uniform_items", url)}
                  value={catDocUrls.uniform_items}
                />
              </>
            )}
          </>
        )}
      </div>
    </BaseCategoryForm>
  );
}

// src/frontend/src/pages/submit-request/steps/StepCategoryDetails.tsx
import { BaseCategoryForm } from "../category-forms/BaseCategoryForm";

// Import all 19 forms
import ElectricityBillForm from "../category-forms/ElectricityBillForm";
import GasBillForm from "../category-forms/GasBillForm";
import WaterBillForm from "../category-forms/WaterBillForm";
import SchoolFeesForm from "../category-forms/SchoolFeesForm";
import MedicalTreatmentForm from "../category-forms/MedicalTreatmentForm";
import MedicinesForm from "../category-forms/MedicinesForm";
import ChildSupportForm from "../category-forms/ChildSupportForm";
import WidowElderlyForm from "../category-forms/WidowElderlyForm";
import DisabilitySupportForm from "../category-forms/DisabilitySupportForm";
import HouseRentForm from "../category-forms/HouseRentForm";
import EducationBooksForm from "../category-forms/EducationBooksForm";
import FoodGroceriesForm from "../category-forms/FoodGroceriesForm";
import MarriageSupportForm from "../category-forms/MarriageSupportForm";
import BusinessWorkHelpForm from "../category-forms/BusinessWorkHelpForm";
import HomeRepairForm from "../category-forms/HomeRepairForm";
import FuneralExpensesForm from "../category-forms/FuneralExpensesForm";
import LivestockFarmingForm from "../category-forms/LivestockFarmingForm";
import DebtReliefForm from "../category-forms/DebtReliefForm";
import EmergencyHelpForm from "../category-forms/EmergencyHelpForm";

// Map categories to their respective forms
const CATEGORY_FORM_MAP: Record<string, any> = {
  "Electricity Bill": ElectricityBillForm,
  "Gas Bill": GasBillForm,
  "Water Bill": WaterBillForm,
  "School, College & University Fees": SchoolFeesForm,
  "Medical & Treatment": MedicalTreatmentForm,
  "Medicines": MedicinesForm,
  "Child Support": ChildSupportForm,
  "Widow & Elderly Support": WidowElderlyForm,
  "Disability Support": DisabilitySupportForm,
  "House Rent": HouseRentForm,
  "Education, Books & Admission": EducationBooksForm,
  "Food & Groceries": FoodGroceriesForm,
  "Marriage Support": MarriageSupportForm,
  "Business / Work Help": BusinessWorkHelpForm,
  "Home Repair": HomeRepairForm,
  "Funeral Expenses": FuneralExpensesForm,
  "Livestock / Farming": LivestockFarmingForm,
  "Debt Relief": DebtReliefForm,
  "Emergency Help": EmergencyHelpForm,
};

export default function StepCategoryDetails({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { category } = formData;
  const FormComponent = CATEGORY_FORM_MAP[category];

  if (!FormComponent) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No form defined for this category.</p>
      </div>
    );
  }

  return (
    <FormComponent
      formData={formData}
      setFormData={setFormData}
      onNext={onNext}
      onBack={onBack}
      isFirst={isFirst}
      isLast={isLast}
    />
  );
}

// steps/StepCategoryDetails.tsx
import ElectricityBillForm from "../category-forms/ElectricityBillForm";
import GasBillForm from "../category-forms/GasBillForm";
// ... تمام کیٹگری فارمز

const CATEGORY_FORM_MAP: Record<string, any> = {
  "Electricity Bill": ElectricityBillForm,
  "Gas Bill": GasBillForm,
  "Water Bill": WaterBillForm,
  "House Rent": HouseRentForm,
  // ...
};

export default function StepCategoryDetails({ category, ...props }) {
  const FormComponent = CATEGORY_FORM_MAP[category];
  if (!FormComponent) {
    return <div>No form defined for this category</div>;
  }
  return <FormComponent {...props} />;
}

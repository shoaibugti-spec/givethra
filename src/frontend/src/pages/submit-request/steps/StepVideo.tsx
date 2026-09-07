// src/frontend/src/pages/submit-request/steps/StepVideo.tsx
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { DocBox } from "../shared/DocBox";

export default function StepVideo({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const videoUrl = formData?.videoUrl || "";

  const setDoc = (url: string) => {
    setFormData((prev: any) => ({ ...prev, videoUrl: url }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Video appeal</h2>
        <p className="text-sm text-muted-foreground">
          Record a short video explaining your need in your own words.
        </p>
        <DocBox
          label="Video appeal"
          required
          hint="Short clear video of you explaining the need"
          accept="video/*"
          onUpload={setDoc}
          value={videoUrl}
        />
      </div>

      <StepGuide
        lines={[
          "Speak clearly about who you are and why you need help.",
          "Keep the video short and honest.",
          "Face and voice should be clear.",
          "Video is required before you can submit the case.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!videoUrl}
      />
    </div>
  );
}

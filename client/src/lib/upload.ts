export type UploadPurpose = "avatar" | "cover" | "kyc" | "case" | "public";

export type UploadInput = {
  name: string;
  mimeType: string;
  dataUrl: string;
  purpose: UploadPurpose;
};

export async function fileToUploadInput(file: File, purpose: UploadPurpose): Promise<UploadInput> {
  if (file.size > 30 * 1024 * 1024) {
    throw new Error("Each file must be smaller than 30 MB.");
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The selected file could not be read."));
    reader.readAsDataURL(file);
  });
  return { name: file.name, mimeType: file.type || "application/octet-stream", dataUrl, purpose };
}

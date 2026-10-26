export interface KycOcrAssetPaths {
  workerPath: string;
  corePath: string;
  langPath: string;
}

export function getKycOcrAssetPaths(baseUrl: string): KycOcrAssetPaths {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const ocrRoot = `${base}ocr`;
  return {
    workerPath: `${ocrRoot}/worker.min.js`,
    corePath: `${ocrRoot}/core`,
    langPath: `${ocrRoot}/lang`,
  };
}

export function formatCnicNumber(value: string): string | null {
  const digits = value.trim().replace(/[\s-]/g, "");
  if (!/^\d{13}$/.test(digits)) return null;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

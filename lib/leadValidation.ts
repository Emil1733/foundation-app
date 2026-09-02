export const ALLOWED_SYMPTOMS = [
  "cracks_wall",
  "doors",
  "gaps_trim",
  "stair-step",
  "horizontal",
  "hairline",
  "pre_purchase",
] as const;

export type LeadField =
  | "name"
  | "email"
  | "phone"
  | "address"
  | "zip"
  | "symptoms"
  | "notes"
  | "tcpaConsent";

export type LeadSubmissionInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  symptoms: string[];
  notes: string;
  tcpaConsent: boolean;
};

export type NormalizedLeadSubmission = Omit<LeadSubmissionInput, "tcpaConsent"> & {
  tcpaConsent: true;
};

export type LeadFieldErrors = Partial<Record<LeadField, string>>;

export type LeadSubmissionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: LeadFieldErrors };

export type LeadValidationResult =
  | { success: true; data: NormalizedLeadSubmission }
  | { success: false; fieldErrors: LeadFieldErrors };

const allowedSymptoms = new Set<string>(ALLOWED_SYMPTOMS);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const zipPattern = /^\d{5}(?:-\d{4})?$/;
const phoneCharactersPattern = /^[\d\s()+.-]+$/;
const nationalPhonePattern = /^[2-9]\d{2}[2-9]\d{6}$/;

function normalizedText(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function validateLeadSubmission(input: unknown): LeadValidationResult {
  const source = input && typeof input === "object"
    ? input as Record<string, unknown>
    : {};
  const fieldErrors: LeadFieldErrors = {};

  const name = normalizedText(source.name);
  if (name.length < 2) {
    fieldErrors.name = "Enter your name.";
  } else if (name.length > 100) {
    fieldErrors.name = "Name must be 100 characters or fewer.";
  }

  const email = normalizedText(source.email).toLowerCase();
  if (!emailPattern.test(email) || email.length > 254) {
    fieldErrors.email = "Enter a valid email address.";
  }

  const rawPhone = normalizedText(source.phone);
  const phoneDigits = rawPhone.replace(/\D/g, "");
  const nationalPhone = phoneDigits.length === 11 && phoneDigits.startsWith("1")
    ? phoneDigits.slice(1)
    : phoneDigits;
  if (
    !phoneCharactersPattern.test(rawPhone)
    || !nationalPhonePattern.test(nationalPhone)
  ) {
    fieldErrors.phone = "Enter a valid 10-digit U.S. phone number.";
  }

  const address = normalizedText(source.address);
  if (address.length < 5) {
    fieldErrors.address = "Enter the property street address.";
  } else if (address.length > 200) {
    fieldErrors.address = "Address must be 200 characters or fewer.";
  }

  const zip = normalizedText(source.zip);
  if (!zipPattern.test(zip)) {
    fieldErrors.zip = "Enter a 5-digit ZIP code or ZIP+4.";
  }

  const rawSymptoms = Array.isArray(source.symptoms) ? source.symptoms : [];
  const symptoms = rawSymptoms.filter(
    (symptom): symptom is string => typeof symptom === "string",
  );
  if (
    symptoms.length === 0
    || symptoms.length !== rawSymptoms.length
    || new Set(symptoms).size !== symptoms.length
    || symptoms.some((symptom) => !allowedSymptoms.has(symptom))
  ) {
    fieldErrors.symptoms = "Select at least one listed foundation symptom.";
  }

  const notes = normalizedText(source.notes);
  if (notes.length > 2000) {
    fieldErrors.notes = "Notes must be 2,000 characters or fewer.";
  }

  if (source.tcpaConsent !== true) {
    fieldErrors.tcpaConsent = "Confirm contact consent before submitting.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      name,
      email,
      phone: `+1${nationalPhone}`,
      address,
      zip,
      symptoms,
      notes,
      tcpaConsent: true,
    },
  };
}

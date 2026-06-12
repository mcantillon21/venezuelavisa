import type { Locale } from "@/lib/i18n/dictionaries";

export type VisaCategory = "tourist" | "business" | "transit" | "student" | "work";

export type Localized = Record<Locale, string>;

export interface VisaType {
  id: VisaCategory;
  icon: "palm" | "briefcase" | "plane" | "cap" | "tools";
  name: Localized;
  tagline: Localized;
  description: Localized;
  feeUsd: number;
  validityMonths: number;
  processingDays: number;
  maxStayDays: number;
  requirements: Record<Locale, string[]>;
  /** extra supporting doc requested in the wizard, by category */
  supportDoc: Localized;
}

export const VISA_TYPES: VisaType[] = [
  {
    id: "tourist",
    icon: "palm",
    name: { es: "Visa de Turista", en: "Tourist Visa" },
    tagline: { es: "Para conocer Venezuela", en: "To explore Venezuela" },
    description: {
      es: "Para viajes de placer, turismo y visitas familiares de corta duración.",
      en: "For leisure travel, tourism and short family visits.",
    },
    feeUsd: 30,
    validityMonths: 12,
    processingDays: 5,
    maxStayDays: 90,
    requirements: {
      es: [
        "Pasaporte con vigencia mayor a 6 meses",
        "Fotografía reciente tipo carnet",
        "Reserva de alojamiento o carta de invitación",
        "Comprobante de fondos suficientes",
      ],
      en: [
        "Passport valid for more than 6 months",
        "Recent passport-style photo",
        "Accommodation booking or invitation letter",
        "Proof of sufficient funds",
      ],
    },
    supportDoc: { es: "Reserva de hotel o carta de invitación", en: "Hotel booking or invitation letter" },
  },
  {
    id: "business",
    icon: "briefcase",
    name: { es: "Visa de Negocios", en: "Business Visa" },
    tagline: { es: "Reuniones y comercio", en: "Meetings and trade" },
    description: {
      es: "Para reuniones, conferencias y actividades comerciales sin relación laboral local.",
      en: "For meetings, conferences and commercial activity without local employment.",
    },
    feeUsd: 60,
    validityMonths: 12,
    processingDays: 7,
    maxStayDays: 180,
    requirements: {
      es: [
        "Pasaporte con vigencia mayor a 6 meses",
        "Carta de la empresa que invita en Venezuela",
        "Carta del empleador de origen",
        "Fotografía reciente tipo carnet",
      ],
      en: [
        "Passport valid for more than 6 months",
        "Letter from the inviting company in Venezuela",
        "Letter from your home employer",
        "Recent passport-style photo",
      ],
    },
    supportDoc: { es: "Carta de invitación empresarial", en: "Business invitation letter" },
  },
  {
    id: "transit",
    icon: "plane",
    name: { es: "Visa de Tránsito", en: "Transit Visa" },
    tagline: { es: "De paso por el país", en: "Passing through" },
    description: {
      es: "Para conexiones y escalas que requieren salir de la zona internacional.",
      en: "For connections and layovers requiring you to leave the international zone.",
    },
    feeUsd: 20,
    validityMonths: 3,
    processingDays: 3,
    maxStayDays: 5,
    requirements: {
      es: [
        "Pasaporte con vigencia mayor a 6 meses",
        "Boleto de continuación del viaje",
        "Visa del país de destino, si aplica",
      ],
      en: [
        "Passport valid for more than 6 months",
        "Onward travel ticket",
        "Destination country visa, if applicable",
      ],
    },
    supportDoc: { es: "Boleto de continuación", en: "Onward travel ticket" },
  },
  {
    id: "student",
    icon: "cap",
    name: { es: "Visa de Estudiante", en: "Student Visa" },
    tagline: { es: "Estudios formales", en: "Formal studies" },
    description: {
      es: "Para estudios en instituciones venezolanas reconocidas por el Estado.",
      en: "For studies at Venezuelan institutions recognized by the State.",
    },
    feeUsd: 50,
    validityMonths: 24,
    processingDays: 12,
    maxStayDays: 365,
    requirements: {
      es: [
        "Pasaporte con vigencia mayor a 1 año",
        "Carta de admisión de la institución",
        "Comprobante de medios de sostenimiento",
        "Certificado médico",
      ],
      en: [
        "Passport valid for more than 1 year",
        "Admission letter from the institution",
        "Proof of means of support",
        "Medical certificate",
      ],
    },
    supportDoc: { es: "Carta de admisión", en: "Admission letter" },
  },
  {
    id: "work",
    icon: "tools",
    name: { es: "Visa de Trabajo", en: "Work Visa" },
    tagline: { es: "Empleo autorizado", en: "Authorized employment" },
    description: {
      es: "Para una relación laboral con una empresa venezolana, con permiso laboral previo.",
      en: "For employment with a Venezuelan company, with prior work permit.",
    },
    feeUsd: 120,
    validityMonths: 12,
    processingDays: 20,
    maxStayDays: 365,
    requirements: {
      es: [
        "Pasaporte con vigencia mayor a 1 año",
        "Contrato de trabajo registrado",
        "Permiso laboral del ministerio competente",
        "Antecedentes penales apostillados",
      ],
      en: [
        "Passport valid for more than 1 year",
        "Registered employment contract",
        "Work permit from the competent ministry",
        "Apostilled criminal record",
      ],
    },
    supportDoc: { es: "Contrato y permiso laboral", en: "Contract and work permit" },
  },
];

export function getVisa(id: string): VisaType | undefined {
  return VISA_TYPES.find((v) => v.id === id);
}

export const PORTS = [
  "Aeropuerto Internacional Simón Bolívar (Maiquetía)",
  "Aeropuerto Internacional La Chinita (Maracaibo)",
  "Aeropuerto Internacional Arturo Michelena (Valencia)",
  "Puerto de La Guaira",
  "Frontera San Antonio del Táchira",
];

/** Common nationalities (subset). value = ISO-ish key, label localized inline. */
export const COUNTRIES: { code: string; es: string; en: string }[] = [
  { code: "AR", es: "Argentina", en: "Argentina" },
  { code: "BR", es: "Brasil", en: "Brazil" },
  { code: "CA", es: "Canadá", en: "Canada" },
  { code: "CN", es: "China", en: "China" },
  { code: "CO", es: "Colombia", en: "Colombia" },
  { code: "FR", es: "Francia", en: "France" },
  { code: "DE", es: "Alemania", en: "Germany" },
  { code: "IN", es: "India", en: "India" },
  { code: "IT", es: "Italia", en: "Italy" },
  { code: "JP", es: "Japón", en: "Japan" },
  { code: "MX", es: "México", en: "Mexico" },
  { code: "NL", es: "Países Bajos", en: "Netherlands" },
  { code: "PT", es: "Portugal", en: "Portugal" },
  { code: "ES", es: "España", en: "Spain" },
  { code: "TR", es: "Turquía", en: "Turkey" },
  { code: "GB", es: "Reino Unido", en: "United Kingdom" },
  { code: "US", es: "Estados Unidos", en: "United States" },
];

export function countryName(code: string, locale: Locale): string {
  const c = COUNTRIES.find((x) => x.code === code);
  return c ? c[locale] : code;
}

export type AppStatus = "submitted" | "review" | "approved" | "rejected" | "info";

export interface TimelineEvent {
  status: AppStatus;
  at: string; // ISO
  note?: string;
}

export interface Application {
  reference: string;
  visaType: VisaCategory;
  status: AppStatus;
  firstName: string;
  lastName: string;
  nationality: string; // country code
  sex: "M" | "F" | "X";
  dob: string;
  passportNo: string;
  passportExp: string;
  email: string;
  phone: string;
  purpose: string;
  arrival: string;
  departure: string;
  port: string;
  addressVe: string;
  documents: { passport: boolean; photo: boolean; support: boolean };
  verification?: { email: boolean; phone: boolean };
  paymentRef?: string;
  submittedAt: string;
  timeline: TimelineEvent[];
}

/* ---- seed applications for the admin demo ------------------- */
export const SEED_APPLICATIONS: Application[] = [
  mkSeed("VE-2026-004871", "tourist", "review", "Amélie", "Laurent", "FR", "F", "2026-06-08T09:12:00Z"),
  mkSeed("VE-2026-004870", "business", "submitted", "Kenji", "Tanaka", "JP", "M", "2026-06-09T14:40:00Z"),
  mkSeed("VE-2026-004869", "work", "review", "Sofia", "Rossi", "IT", "F", "2026-06-07T11:05:00Z"),
  mkSeed("VE-2026-004868", "student", "info", "Lucas", "Müller", "DE", "M", "2026-06-06T16:25:00Z"),
  mkSeed("VE-2026-004867", "tourist", "approved", "Priya", "Sharma", "IN", "F", "2026-06-05T08:50:00Z"),
  mkSeed("VE-2026-004866", "transit", "submitted", "Mateus", "Costa", "BR", "M", "2026-06-09T19:02:00Z"),
  mkSeed("VE-2026-004865", "tourist", "approved", "Olivia", "Smith", "GB", "F", "2026-06-04T10:30:00Z"),
  mkSeed("VE-2026-004864", "business", "rejected", "Carlos", "Mendoza", "MX", "M", "2026-06-03T13:15:00Z"),
];

function mkSeed(
  reference: string,
  visaType: VisaCategory,
  status: AppStatus,
  firstName: string,
  lastName: string,
  nationality: string,
  sex: "M" | "F" | "X",
  submittedAt: string,
): Application {
  const timeline: TimelineEvent[] = [{ status: "submitted", at: submittedAt }];
  if (status !== "submitted") {
    timeline.push({ status: "review", at: bump(submittedAt, 6) });
  }
  if (status === "approved") timeline.push({ status: "approved", at: bump(submittedAt, 30) });
  if (status === "rejected")
    timeline.push({ status: "rejected", at: bump(submittedAt, 28), note: "Documentación insuficiente." });
  if (status === "info")
    timeline.push({ status: "info", at: bump(submittedAt, 10), note: "Se requiere carta de admisión legible." });

  return {
    reference,
    visaType,
    status,
    firstName,
    lastName,
    nationality,
    sex,
    dob: "1991-04-17",
    passportNo: "P" + reference.slice(-6),
    passportExp: "2031-09-01",
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: "+1 555 0100",
    purpose: visaType,
    arrival: "2026-07-15",
    departure: "2026-07-29",
    port: PORTS[0],
    addressVe: "Hotel Humboldt, Caracas",
    documents: { passport: true, photo: true, support: status !== "info" },
    submittedAt,
    timeline,
  };
}

function bump(iso: string, hours: number): string {
  const ms = Date.parse(iso) + hours * 3600 * 1000;
  return new Date(ms).toISOString();
}

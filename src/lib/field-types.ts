
import { z } from "zod";

export const QUESTION_TYPES = ["TEXT", "TEXTAREA", "EMAIL","NUMBER","PHONE","DATE","CHOICE","RADIO","CHECKBOX",
  "YES_NO",
  "RATING",
  "RANGE",
  "NPS",
  "ADDRESS",
  "FULL_NAME",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];


/** Types that need a list of options. */
export const OPTION_TYPES: QuestionType[] = ["CHOICE", "RADIO", "CHECKBOX"];

/** Types that accept more than one answer (stored comma separated). */
export const MULTI_TYPES: QuestionType[] = ["CHECKBOX"];

export function isQuestionType(value: unknown): value is QuestionType {
  return typeof value === "string" && (QUESTION_TYPES as readonly string[]).includes(value);
}

export function hasOptions(type: QuestionType): boolean {
  return OPTION_TYPES.includes(type);
}

export function isMultiSelect(type: QuestionType): boolean {
  return MULTI_TYPES.includes(type);
}

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 10;

/**
 * Multi-select answers are stored as a comma-joined string, so an option may
 * not contain a comma - otherwise the stored answer cannot be split back into
 * the original options.
 */
export const OPTION_FORBIDDEN_CHAR = ",";

export function hasForbiddenOptionChar(options: string[]): boolean {
  return options.some((o) => o.includes(OPTION_FORBIDDEN_CHAR));
}

/**
 * Shared zod schema for a question's options. Used by every write path
 * (add/update question and the builder save) so a comma can never reach the
 * database.
 */
export const optionsSchema = z
  .array(z.string().trim().min(1).max(100))
  .min(2)
  .max(10)
  .refine((o) => new Set(o).size === o.length, "Options must be unique")
  .refine(
    (o) => !o.some((opt) => opt.includes(OPTION_FORBIDDEN_CHAR)),
    "Options cannot contain commas",
  );

/** RATING: 1..5 stars. */
export const RATING_MIN = 1;
export const RATING_MAX = 5;
/** RANGE: slider 0..100. */
export const RANGE_MIN = 0;
export const RANGE_MAX = 100;
/** NPS: 0..10. */
export const NPS_MIN = 0;
export const NPS_MAX = 10;

export const FONT_WEIGHTS = ["normal", "medium", "semibold", "bold"] as const;
export const FONT_STYLES = ["normal", "italic"] as const;
export const MIN_FONT_SIZE = 10;
export const MAX_FONT_SIZE = 32;
export const MAX_PLACEHOLDER = 120;

/** Defaults applied when a field has no explicit style stored. */
export const DEFAULT_FONT_SIZE = 14;
export const DEFAULT_FONT_WEIGHT = "semibold";

export interface FieldStyle {
  placeholder?: string | null;
  textColor?: string | null;
  fontSize?: number | null;
  fontWeight?: string | null;
  fontStyle?: string | null;
}

/**
 * Resolves the effective style of a field. Font size and weight always have a
 * value so a field never renders unstyled (thin, tiny) text.
 */
export function resolveFieldStyle(style: FieldStyle | null | undefined) {
  return {
    fontSize: style?.fontSize ?? DEFAULT_FONT_SIZE,
    fontWeight: (style?.fontWeight ?? DEFAULT_FONT_WEIGHT) as
      | "normal"
      | "medium"
      | "semibold"
      | "bold",
    fontStyle: (style?.fontStyle ?? "normal") as "normal" | "italic",
    color: style?.textColor ?? undefined,
    placeholder: style?.placeholder ?? undefined,
  };
}

/** Builds the inline style object for a field's label / input text. */
export function fieldStyleCss(style: FieldStyle | null | undefined): React.CSSProperties {
  const s = resolveFieldStyle(style);
  return {
    fontSize: `${s.fontSize}px`,
    fontWeight: s.fontWeight,
    fontStyle: s.fontStyle,
    color: s.color,
  };
}


export function isFontWeight(value: unknown): boolean {
  return typeof value === "string" && (FONT_WEIGHTS as readonly string[]).includes(value);
}

export function isFontStyle(value: unknown): boolean {
  return typeof value === "string" && (FONT_STYLES as readonly string[]).includes(value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Server-side validation of a single answer for a given question.
 * Returns an error message, or null when the value is acceptable.
 */
export function validateAnswer(
  type: QuestionType,
  value: string,
  options: string[] | null,
): string | null {
  const v = value.trim();
  if (v === "") return null; // emptiness is handled by the required check

  switch (type) {
    case "EMAIL":
      if (v.length > 254) return "Email address is too long";
      if (!EMAIL_RE.test(v)) return "Enter a valid email address";
      return null;
    case "NUMBER": {
      if (!/^-?\d+(\.\d+)?$/.test(v)) return "Enter a valid number";
      return null;
    }
    case "PHONE": {
      if (!/^\+?[\d\s()-]{6,20}$/.test(v)) return "Enter a valid phone number";
      return null;
    }
    case "DATE": {
      if (!DATE_RE.test(v)) return "Enter a valid date";
      return null;
    }
    case "CHOICE":
    case "RADIO": {
      const opts = options ?? [];
      if (!opts.includes(v)) return "Choose one of the available options";
      return null;
    }
    case "CHECKBOX": {
      const opts = options ?? [];
      const picked = v.split(",").map((s) => s.trim()).filter(Boolean);
      if (picked.length === 0) return "Choose at least one option";
      if (picked.some((p) => !opts.includes(p))) return "Choose only from the available options";
      return null;
    }
    case "YES_NO": {
      if (v !== "yes" && v !== "no") return "Answer must be yes or no";
      return null;
    }
    case "RATING": {
      const n = Number(v);
      if (!Number.isInteger(n) || n < RATING_MIN || n > RATING_MAX)
        return `Rating must be between ${RATING_MIN} and ${RATING_MAX}`;
      return null;
    }
    case "RANGE": {
      const n = Number(v);
      if (!Number.isFinite(n) || n < RANGE_MIN || n > RANGE_MAX)
        return `Value must be between ${RANGE_MIN} and ${RANGE_MAX}`;
      return null;
    }
    case "NPS": {
      const n = Number(v);
      if (!Number.isInteger(n) || n < NPS_MIN || n > NPS_MAX)
        return `Score must be between ${NPS_MIN} and ${NPS_MAX}`;
      return null;
    }
    case "TEXT":
    case "TEXTAREA":
    case "ADDRESS":
    case "FULL_NAME":
      return null;
    default:
      return null;
  }
}

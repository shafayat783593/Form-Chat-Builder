
import { z } from "zod";



export const QUESTION_TYPES = [
  "TEXT",
  "TEXTAREA",
  "EMAIL",
  "NUMBER",
  "PHONE",
  "DATE",
  "CHOICE", // dropdown
  "RADIO",
  "CHECKBOX",
  "YES_NO",
  "RATING",
  "RANGE",
  "NPS",
  "ADDRESS",
  "FULL_NAME",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

/** Types where the visitor picks from a list of options written by the owner. */
const TYPES_WITH_OPTIONS: readonly QuestionType[] = ["CHOICE", "RADIO", "CHECKBOX"];

export function hasOptions(type: QuestionType): boolean {
  return TYPES_WITH_OPTIONS.includes(type);
}


export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 10;


export const OPTION_FORBIDDEN_CHAR = ",";

export function hasForbiddenOptionChar(options: string[]): boolean {
  return options.some((option) => option.includes(OPTION_FORBIDDEN_CHAR));
}

export const optionsSchema = z
  .array(z.string().trim().min(1).max(100))
  .min(MIN_OPTIONS)
  .max(MAX_OPTIONS)
  .refine((options) => new Set(options).size === options.length, "Options must be unique")
  .refine((options) => !hasForbiddenOptionChar(options), "Options cannot contain commas");

// ---------------------------------------------------------------------------
// Scale questions
// ---------------------------------------------------------------------------

export const RATING_MIN = 1; // stars
export const RATING_MAX = 5;
export const RANGE_MIN = 0; // slider
export const RANGE_MAX = 100;
export const NPS_MIN = 0; // net promoter score
export const NPS_MAX = 10;

// ---------------------------------------------------------------------------
// Per-question text style
// ---------------------------------------------------------------------------

export const FONT_WEIGHTS = ["normal", "medium", "semibold", "bold"] as const;
export const FONT_STYLES = ["normal", "italic"] as const;
export const MIN_FONT_SIZE = 10;
export const MAX_FONT_SIZE = 32;
export const DEFAULT_FONT_SIZE = 14;
export const DEFAULT_FONT_WEIGHT = "semibold";
export const MAX_PLACEHOLDER = 120;

/** The optional look of one question. A missing value means "use the default". */
export interface FieldStyle {
  placeholder?: string | null;
  textColor?: string | null;
  fontSize?: number | null;
  fontWeight?: string | null;
  fontStyle?: string | null;
}

/** Turns a question's style into inline CSS, filling in the defaults. */
export function fieldStyleCss(style: FieldStyle): React.CSSProperties {
  return {
    fontSize: `${style.fontSize ?? DEFAULT_FONT_SIZE}px`,
    fontWeight: style.fontWeight ?? DEFAULT_FONT_WEIGHT,
    fontStyle: style.fontStyle ?? "normal",
    color: style.textColor ?? undefined,
  };
}

// Answer validation (runs in the browser and again on the server)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

/** Types that only need their text to match a pattern. */
const PATTERN_RULES: Partial<Record<QuestionType, { pattern: RegExp; message: string }>> = {
  NUMBER: { pattern: /^-?\d+(\.\d+)?$/, message: "Enter a valid number" },
  PHONE: { pattern: /^\+?[\d\s()-]{6,20}$/, message: "Enter a valid phone number" },
  DATE: { pattern: /^\d{4}-\d{2}-\d{2}$/, message: "Enter a valid date" },
};

function isWholeNumberBetween(value: string, min: number, max: number): boolean {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max;
}


export function validateAnswer(
  type: QuestionType,
  value: string,
  options: string[] | null,
): string | null {
  const answer = value.trim();
  if (answer === "") return null;

  const patternRule = PATTERN_RULES[type];
  if (patternRule) {
    return patternRule.pattern.test(answer) ? null : patternRule.message;
  }

  switch (type) {
    case "EMAIL":
      if (answer.length > MAX_EMAIL_LENGTH) return "Email address is too long";
      return EMAIL_PATTERN.test(answer) ? null : "Enter a valid email address";

    case "CHOICE":
    case "RADIO":
      return (options ?? []).includes(answer) ? null : "Choose one of the available options";

    case "CHECKBOX": {
      const picked = answer.split(",").map((item) => item.trim()).filter(Boolean);
      if (picked.length === 0) return "Choose at least one option";
      const allowed = options ?? [];
      return picked.every((item) => allowed.includes(item))
        ? null
        : "Choose only from the available options";
    }

    case "YES_NO":
      return answer === "yes" || answer === "no" ? null : "Answer must be yes or no";

    case "RATING":
      return isWholeNumberBetween(answer, RATING_MIN, RATING_MAX)
        ? null
        : `Rating must be between ${RATING_MIN} and ${RATING_MAX}`;

    case "NPS":
      return isWholeNumberBetween(answer, NPS_MIN, NPS_MAX)
        ? null
        : `Score must be between ${NPS_MIN} and ${NPS_MAX}`;

    case "RANGE": {
      const number = Number(answer);
      const inRange = Number.isFinite(number) && number >= RANGE_MIN && number <= RANGE_MAX;
      return inRange ? null : `Value must be between ${RANGE_MIN} and ${RANGE_MAX}`;
    }

    // TEXT, TEXTAREA, ADDRESS and FULL_NAME accept any text.
    default:
      return null;
  }
}

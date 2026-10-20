import {
  Type,
  AlignLeft,
  Mail,
  Hash,
  Phone,
  Calendar,
  ChevronDownSquare,
  CircleDot,
  CheckSquare,
  CircleCheck,
  Star,
  SlidersHorizontal,
  Gauge,
  MapPin,
  User,
  type LucideIcon,
} from "lucide-react";
import type { QuestionType } from "@/lib/field-types";

export interface FieldTypeMeta {
  type: QuestionType;
  label: string;
  icon: LucideIcon;
  /** Placeholder used for the input preview and the chat input. */
  placeholder: string;
  /** Whether the answer is a free text, a single choice or a multi choice. */
  kind: "text" | "choice" | "multi" | "scale";
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  { type: "TEXT", label: "Text Input", icon: Type, placeholder: "Enter your answer", kind: "text" },
  { type: "TEXTAREA", label: "Textarea", icon: AlignLeft, placeholder: "Type your message…", kind: "text" },
  { type: "EMAIL", label: "Email", icon: Mail, placeholder: "Enter your email address", kind: "text" },
  { type: "NUMBER", label: "Number", icon: Hash, placeholder: "Enter a number", kind: "text" },
  { type: "PHONE", label: "Phone", icon: Phone, placeholder: "Enter your phone number", kind: "text" },
  { type: "DATE", label: "Date", icon: Calendar, placeholder: "", kind: "text" },
  { type: "CHOICE", label: "Dropdown", icon: ChevronDownSquare, placeholder: "", kind: "choice" },
  { type: "RADIO", label: "Radio Button", icon: CircleDot, placeholder: "", kind: "choice" },
  { type: "CHECKBOX", label: "Checkbox", icon: CheckSquare, placeholder: "", kind: "multi" },
  { type: "YES_NO", label: "Yes / No", icon: CircleCheck, placeholder: "", kind: "choice" },
  { type: "RATING", label: "Star Rating", icon: Star, placeholder: "", kind: "scale" },
  { type: "RANGE", label: "Range Slider", icon: SlidersHorizontal, placeholder: "", kind: "scale" },
  { type: "NPS", label: "NPS Score", icon: Gauge, placeholder: "", kind: "scale" },
  { type: "ADDRESS", label: "Address", icon: MapPin, placeholder: "Enter your address", kind: "text" },
  { type: "FULL_NAME", label: "Full Name", icon: User, placeholder: "Enter your full name", kind: "text" },
];

const BY_TYPE = new Map(FIELD_TYPES.map((f) => [f.type, f]));

export function fieldMeta(type: QuestionType): FieldTypeMeta {
  return (
    BY_TYPE.get(type) ?? {
      type,
      label: type,
      icon: Type,
      placeholder: "Enter your answer",
      kind: "text",
    }
  );
}

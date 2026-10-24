import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NPS_MAX,
  NPS_MIN,
  RANGE_MAX,
  RANGE_MIN,
  RATING_MAX,
  fieldStyleCss,
} from "@/lib/field-types";
import type { ClientQuestion } from "../builder-state";

const READ_ONLY_INPUT = "pointer-events-none h-9 bg-muted/40 text-muted-foreground";


export function FieldPreview({ question }: { question: ClientQuestion }) {
  const style = fieldStyleCss(question);
  const placeholder = question.placeholder ?? "";

  switch (question.type) {
    case "YES_NO":
      return (
        <div className="flex items-center gap-4 text-sm text-muted-foreground" style={style}>
          {["Yes", "No"].map((answer) => (
            <span key={answer} className="inline-flex items-center gap-2">
              <span className="size-4 rounded-full border" />
              {answer}
            </span>
          ))}
        </div>
      );

    case "RATING":
      return (
        <div className="flex items-center gap-1 text-muted-foreground" style={style}>
          {Array.from({ length: RATING_MAX }, (_, i) => (
            <span key={i} className="text-lg leading-none">
              ★
            </span>
          ))}
        </div>
      );

    case "RANGE":
      return (
        <div className="flex items-center gap-3" style={style}>
          <span className="text-xs text-muted-foreground">{RANGE_MIN}</span>
          <span className="h-1.5 flex-1 rounded-full bg-muted" />
          <span className="text-xs text-muted-foreground">{RANGE_MAX}</span>
        </div>
      );

    case "NPS":
      return (
        <div className="flex flex-wrap items-center gap-1" style={style}>
          {Array.from({ length: NPS_MAX - NPS_MIN + 1 }, (_, i) => (
            <span
              key={i}
              className="grid size-7 place-items-center rounded-md border text-xs text-muted-foreground"
            >
              {NPS_MIN + i}
            </span>
          ))}
        </div>
      );

    case "TEXTAREA":
      return (
        <Textarea
          readOnly
          value={placeholder}
          className="pointer-events-none min-h-20 resize-none bg-muted/40 text-muted-foreground"
          style={style}
        />
      );

    case "DATE":
      return (
        <Input
          readOnly
          value={placeholder}
          placeholder="Select a date"
          className={READ_ONLY_INPUT}
          style={style}
        />
      );

    default:
      return (
        <Input
          readOnly
          value={placeholder}
          placeholder={placeholder || "Enter your answer"}
          className={READ_ONLY_INPUT}
          style={style}
        />
      );
  }
}

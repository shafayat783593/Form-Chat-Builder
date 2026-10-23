import { validateAnswer, type QuestionType } from "@/lib/field-types";
import { collectPrefill, type SearchParams } from "@/modules/form-runtime/prefill";

export type Phase = "intro" | "typing" | "asking" | "submitting" | "done";

export type SubmitError =
  | { kind: "network"; message: string }
  | { kind: "rate_limit"; message: string; retryAfter: number }
  | { kind: "server"; message: string };

export interface FlowQuestion {
  id: string;
  type: QuestionType;
  label: string;
  options: string[] | null;
  required: boolean;
  prefillKey?: string | null;
  placeholder?: string | null;
  textColor?: string | null;
  fontSize?: number | null;
  fontWeight?: string | null;
  fontStyle?: string | null;
}

export interface FlowState {
  phase: Phase;
  index: number;
  answers: Record<string, string>;
  errors: Record<string, string>;
  submitError: SubmitError | null;
}

export type FlowAction =
  | { type: "START" }
  | { type: "TYPED" }
  | { type: "SET_ANSWER"; id: string; value: string }
  | { type: "SET_ERROR"; id: string; message: string }
  | { type: "ADVANCE" }
  | { type: "SKIP"; id: string }
  | { type: "SUBMIT_FAILED"; error: SubmitError }
  | { type: "SERVER_FIELD_ERRORS"; details: Record<string, string>; questionIndex: (id: string) => number }
  | { type: "DONE" }
  | { type: "RESTART" };

export interface TranscriptEntry {
  kind: "bot" | "user";
  text: string;
  muted?: boolean;
  isTyping?: boolean;
}

export function validateQuestion(q: FlowQuestion, value: string): string | null {
  const trimmed = value.trim();
  if (q.required && trimmed === "") return "This question is required";
  if (trimmed === "") return null;
  if (trimmed.length > 2000) return "Answer too long (max 2000 characters)";
  return validateAnswer(q.type, trimmed, q.options);
}

export function buildTranscript(
  questions: FlowQuestion[],
  state: FlowState,
  welcomeText: string,
): TranscriptEntry[] {
  const entries: TranscriptEntry[] = [{ kind: "bot", text: welcomeText }];

  for (let i = 0; i < state.index; i++) {
    const q = questions[i];
    if (!q) continue;
    entries.push({ kind: "bot", text: q.label });
    const answer = state.answers[q.id] ?? "";
    if (answer === "") {
      entries.push({ kind: "user", text: "Skipped", muted: true });
    } else {
      entries.push({ kind: "user", text: answer });
    }
  }

  if (state.index < questions.length) {
    const q = questions[state.index];
    if (q) {
      if (state.phase === "typing") {
        entries.push({ kind: "bot", text: "", isTyping: true });
      } else if (state.phase === "asking") {
        entries.push({ kind: "bot", text: q.label });
      } else {
        // "submitting" / "done": the answer was given, so show it before the
        // response is sent (the last answer must be visible too).
        entries.push({ kind: "bot", text: q.label });
        const answer = state.answers[q.id] ?? "";
        entries.push(
          answer === ""
            ? { kind: "user", text: "Skipped", muted: true }
            : { kind: "user", text: answer },
        );
      }
    }
  }

  return entries;
}

export function createInitialState(
  questions: FlowQuestion[],
  searchParams?: SearchParams,
): FlowState {
  const prefilled = collectPrefill(
    questions.map((q) => ({
      id: q.id,
      type: q.type,
      options: q.options,
      prefillKey: q.prefillKey,
    })),
    searchParams,
  );
  return {
    phase: "typing",
    index: 0,
    answers: prefilled,
    errors: {},
    submitError: null,
  };
}

export function flowReducer(
  state: FlowState,
  action: FlowAction,
  questionCount: number,
): FlowState {
  switch (action.type) {
    case "START":
      // Show the welcome bubble and the typing indicator; the first question
      // arrives with TYPED.
      return { ...state, phase: "typing" };

    case "TYPED":
      return { ...state, phase: "asking" };

    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.id]: action.value },
        errors: { ...state.errors, [action.id]: undefined as unknown as string },
        submitError: null,
      };

    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.id]: action.message },
      };

    case "ADVANCE": {
      const nextIndex = state.index + 1;
      if (nextIndex >= questionCount) {
        return { ...state, phase: "submitting", index: state.index };
      }
      return { ...state, phase: "typing", index: nextIndex };
    }

    case "SKIP": {
      const nextIndex = state.index + 1;
      const newAnswers = { ...state.answers, [action.id]: "" };
      if (nextIndex >= questionCount) {
        return { ...state, phase: "submitting", index: state.index, answers: newAnswers };
      }
      return { ...state, phase: "typing", index: nextIndex, answers: newAnswers };
    }

    case "SUBMIT_FAILED":
      return { ...state, phase: "asking", submitError: action.error };

    case "SERVER_FIELD_ERRORS": {
      const firstId = Object.keys(action.details)[0];
      const newIndex = firstId ? action.questionIndex(firstId) : state.index;
      return {
        ...state,
        phase: "asking",
        index: newIndex >= 0 ? newIndex : state.index,
        errors: { ...state.errors, ...action.details },
        submitError: null,
      };
    }

    case "DONE":
      return { ...state, phase: "done", submitError: null };

    case "RESTART":
      return {
        phase: "typing",
        index: 0,
        answers: {},
        errors: {},
        submitError: null,
      };
    default:
      return state;
  }
}

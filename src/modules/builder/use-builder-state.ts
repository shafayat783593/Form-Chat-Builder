"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { hasOptions, type QuestionType } from "@/lib/field-types";

export type { QuestionType };

const DEFAULT_PLACEHOLDERS: Partial<Record<QuestionType, string>> = {
  TEXT: "Enter your answer",
  TEXTAREA: "Type your message…",
  EMAIL: "Enter your email address",
  NUMBER: "Enter a number",
  PHONE: "Enter your phone number",
  DATE: "",
  ADDRESS: "Enter your address",
  FULL_NAME: "Enter your full name",
};

function defaultPlaceholder(type: QuestionType): string {
  return DEFAULT_PLACEHOLDERS[type] ?? "";
}

export interface ClientQuestion {
  clientId: string;
  id?: string;
  type: QuestionType;
  label: string;
  options: string[];
  required: boolean;
  order: number;
  prefillKey?: string | null;
  placeholder?: string | null;
  textColor?: string | null;
  fontSize?: number | null;
  fontWeight?: string | null;
  fontStyle?: string | null;
}

export interface BuilderSettings {
  title: string;
  description: string | null;
  welcomeText: string;
  completionText: string;
  themeColor: string;
  launcherLabel: string;
  widgetPosition: "RIGHT" | "LEFT";
  notifyOnResponse: boolean;
  notifyEmails: string[];
}

export interface ServerForm {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  welcomeText: string;
  completionText: string;
  themeColor: string;
  launcherLabel: string;
  widgetPosition: "RIGHT" | "LEFT";
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
  notifyOnResponse: boolean;
  notifyEmails: string[];
  questions: Array<{
    id: string;
    type: QuestionType;
    label: string;
    options: string[] | null;
    required: boolean;
    order: number;
    prefillKey: string | null;
    placeholder?: string | null;
    textColor?: string | null;
    fontSize?: number | null;
    fontWeight?: string | null;
    fontStyle?: string | null;
  }>;
}

export interface BuilderState {
  questions: ClientQuestion[];
  settings: BuilderSettings;
  status: "DRAFT" | "PUBLISHED";
  dirty: boolean;
}

type BuilderAction =
  | { type: "INIT"; form: ServerForm }
  | { type: "ADD_QUESTION"; question: { type: QuestionType; label: string } }
  | { type: "UPDATE_QUESTION"; clientId: string; patch: Partial<ClientQuestion> }
  | { type: "REMOVE_QUESTION"; clientId: string }
  | { type: "MOVE_QUESTION"; fromIndex: number; toIndex: number }
  | { type: "DUPLICATE_QUESTION"; clientId: string }
  | { type: "UPDATE_SETTINGS"; patch: Partial<BuilderSettings> }
  | { type: "MARK_SAVED"; form: ServerForm }
  | { type: "REPLACE"; state: BuilderState };

export const DEFAULT_SETTINGS: BuilderSettings = {
  title: "Untitled form",
  description: null,
  welcomeText: "Hi! Mind answering a few quick questions?",
  completionText: "Thanks! Your response has been recorded.",
  themeColor: "#4f46e5",
  launcherLabel: "Chat with us",
  widgetPosition: "RIGHT",
  notifyOnResponse: false,
  notifyEmails: [],
};

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null || typeof a !== typeof b) return false;
  if (typeof a !== "object") return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (Array.isArray(a) || Array.isArray(b)) return false;
  const ka = Object.keys(a as Record<string, unknown>);
  const kb = Object.keys(b as Record<string, unknown>);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

function clientQuestionFromServer(q: ServerForm["questions"][number], index: number): ClientQuestion {
  return {
    clientId: crypto.randomUUID(),
    id: q.id,
    type: q.type,
    label: q.label,
    options: q.options ?? [],
    required: q.required,
    order: index,
    prefillKey: q.prefillKey ?? undefined,
    placeholder: q.placeholder ?? null,
    textColor: q.textColor ?? null,
    fontSize: q.fontSize ?? null,
    fontWeight: q.fontWeight ?? null,
    fontStyle: q.fontStyle ?? null,
  };
}

function createInitialState(form: ServerForm): BuilderState {
  const questions = form.questions
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((q, index) => ({ ...clientQuestionFromServer(q, index), order: index }));
  return {
    questions,
    settings: {
      title: form.title,
      description: form.description,
      welcomeText: form.welcomeText,
      completionText: form.completionText,
      themeColor: form.themeColor,
      launcherLabel: form.launcherLabel,
      widgetPosition: form.widgetPosition,
      notifyOnResponse: form.notifyOnResponse,
      notifyEmails: Array.isArray(form.notifyEmails) ? form.notifyEmails : [],
    },
    status: form.status,
    dirty: false,
  };
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "INIT": {
      return createInitialState(action.form);
    }
    case "ADD_QUESTION": {
      const next = [...state.questions, {
        clientId: crypto.randomUUID(),
        type: action.question.type,
        label: action.question.label,
        options: hasOptions(action.question.type) ? ["Option 1", "Option 2"] : [],
        required: true,
        order: state.questions.length,
        placeholder: defaultPlaceholder(action.question.type),
        textColor: null,
        fontSize: null,
        fontWeight: null,
        fontStyle: null,
      }];
      return { ...state, questions: next };
    }
    case "UPDATE_QUESTION": {
      const next = state.questions.map((q) => (q.clientId === action.clientId ? { ...q, ...action.patch } : q));
      return { ...state, questions: next };
    }
    case "REMOVE_QUESTION": {
      const next = state.questions.filter((q) => q.clientId !== action.clientId);
      return { ...state, questions: next };
    }
    case "MOVE_QUESTION": {
      const next = [...state.questions];
      const [moved] = next.splice(action.fromIndex, 1);
      next.splice(action.toIndex, 0, moved);
      return { ...state, questions: next };
    }
    case "DUPLICATE_QUESTION": {
      const idx = state.questions.findIndex((q) => q.clientId === action.clientId);
      if (idx === -1) return state;
      const original = state.questions[idx];
      const copy: ClientQuestion = {
        ...original,
        clientId: crypto.randomUUID(),
        id: undefined,
        label: `${original.label} (copy)`,
        order: state.questions.length,
      };
      const next = [...state.questions.slice(0, idx + 1), copy, ...state.questions.slice(idx + 1)];
      return { ...state, questions: next };
    }
    case "UPDATE_SETTINGS": {
      return { ...state, settings: { ...state.settings, ...action.patch } };
    }
    case "MARK_SAVED": {
      return createInitialState(action.form);
    }
    case "REPLACE": {
      return action.state;
    }
    default:
      return state;
  }
}

export function useBuilderState(initialForm?: ServerForm) {
  const snapshotRef = useRef<BuilderState | null>(null);
  const initializedRef = useRef(false);
  const historyRef = useRef<BuilderState[]>([]);
  const futureRef = useRef<BuilderState[]>([]);
  const [state, dispatch] = useReducer(builderReducer, {
    questions: [],
    settings: { ...DEFAULT_SETTINGS },
    status: "DRAFT",
    dirty: false,
  });
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });

  // Initialize state from the server form once, in an effect (refs must not be
  // touched during render).
  useEffect(() => {
    if (!initialForm || initializedRef.current) return;
    dispatch({ type: "INIT", form: initialForm });
    snapshotRef.current = createInitialState(initialForm);
    initializedRef.current = true;
  }, [initialForm]);

  // Keep an undo/redo history of the builder state.
  const lastStateRef = useRef(state);
  useEffect(() => {
    if (lastStateRef.current !== state) {
      historyRef.current.push(lastStateRef.current);
      if (historyRef.current.length > 50) historyRef.current.shift();
      futureRef.current = [];
      lastStateRef.current = state;
      setHistoryState({ canUndo: historyRef.current.length > 0, canRedo: false });
    }
  }, [state]);

  const dirty = useCallback(() => {
    if (!snapshotRef.current) return false;
    return !deepEqual(state, snapshotRef.current);
  }, [state]);

  const resetDirty = useCallback(() => {
    snapshotRef.current = {
      questions: [...state.questions],
      settings: { ...state.settings },
      status: state.status,
      dirty: false,
    };
  }, [state]);

  const undo = useCallback(() => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    futureRef.current.push(state);
    lastStateRef.current = previous;
    dispatch({ type: "REPLACE", state: previous });
    setHistoryState({ canUndo: historyRef.current.length > 0, canRedo: futureRef.current.length > 0 });
  }, [state]);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push(state);
    lastStateRef.current = next;
    dispatch({ type: "REPLACE", state: next });
    setHistoryState({ canUndo: historyRef.current.length > 0, canRedo: futureRef.current.length > 0 });
  }, [state]);

  return {
    state,
    dispatch,
    dirty,
    resetDirty,
    undo,
    redo,
    canUndo: historyState.canUndo,
    canRedo: historyState.canRedo,
  };
}

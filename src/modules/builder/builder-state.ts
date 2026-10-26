

import {
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT,
  hasOptions,
  type FieldStyle,
  type QuestionType,
} from "@/lib/field-types";
import { fieldMeta } from "./field-meta";

export type FormStatus = "DRAFT" | "PUBLISHED";

// Types

/** Form-wide settings, edited in the right-hand panel. */
export interface BuilderSettings {
  title: string;
  description: string | null;
  welcomeText: string;
  completionText: string;
  themeColor: string;
  launcherLabel: string;
  widgetPosition: "RIGHT" | "LEFT";
  submitButtonText: string;
  displayMode: "CLASSIC" | "FOCUS";
  showProgress: boolean;
  multiPageForm: boolean;
  notifyOnResponse: boolean;
  notifyEmails: string[];
}

/** A question as the builder holds it while the owner is editing. */
export interface ClientQuestion extends FieldStyle {
  /** Identifies the question inside the browser. Exists before it is ever saved. */
  clientId: string;
  /** Database id. Missing until the question has been saved once. */
  id?: string;
  type: QuestionType;
  label: string;
  options: string[];
  required: boolean;
  prefillKey?: string | null;
}

/** A question as it comes from the database. */
export interface ServerQuestion extends FieldStyle {
  id: string;
  type: QuestionType;
  label: string;
  options: string[] | null;
  required: boolean;
  order: number;
  prefillKey: string | null;
}

/** The form as it comes from the database. */
export interface ServerForm extends BuilderSettings {
  id: string;
  slug: string;
  status: FormStatus;
  /** ISO date. Sent back on save so the server can detect edits made in another tab. */
  updatedAt: string;
  questions: ServerQuestion[];
}

/** What the owner edits. */
export interface BuilderContent {
  settings: BuilderSettings;
  questions: ClientQuestion[];
}

export interface SavedQuestionId {
  clientId?: string;
  id: string;
}

/** Everything a component may ask the builder to do. */
export interface BuilderActions {
  addQuestion(type: QuestionType): void;
  updateQuestion(clientId: string, patch: Partial<ClientQuestion>): void;
  removeQuestion(clientId: string): void;
  moveQuestion(from: number, to: number): void;
  duplicateQuestion(clientId: string): void;
  updateSettings(patch: Partial<BuilderSettings>): void;
  undo(): void;
  redo(): void;
  /** Call after a successful save. */
  markSaved(ids: SavedQuestionId[]): void;
}

// Building the first state from the database form

function settingsFromForm(form: ServerForm): BuilderSettings {
  return {
    title: form.title,
    description: form.description,
    welcomeText: form.welcomeText,
    completionText: form.completionText,
    themeColor: form.themeColor,
    launcherLabel: form.launcherLabel,
    widgetPosition: form.widgetPosition,
    submitButtonText: form.submitButtonText,
    displayMode: form.displayMode,
    showProgress: form.showProgress,
    multiPageForm: form.multiPageForm,
    notifyOnResponse: form.notifyOnResponse,
    notifyEmails: form.notifyEmails,
  };
}

function questionFromServer(question: ServerQuestion): ClientQuestion {
  return {
    clientId: crypto.randomUUID(),
    id: question.id,
    type: question.type,
    label: question.label,
    options: question.options ?? [],
    required: question.required,
    prefillKey: question.prefillKey ?? undefined,
    placeholder: question.placeholder ?? null,
    textColor: question.textColor ?? null,
    fontSize: question.fontSize ?? null,
    fontWeight: question.fontWeight ?? null,
    fontStyle: question.fontStyle ?? null,
  };
}

export function contentFromForm(form: ServerForm): BuilderContent {
  const questions = [...form.questions]
    .sort((a, b) => a.order - b.order)
    .map(questionFromServer);
  return { settings: settingsFromForm(form), questions };
}

/** A brand-new question of the given type, as added from the palette. */
function newQuestion(type: QuestionType): ClientQuestion {
  const meta = fieldMeta(type);
  return {
    clientId: crypto.randomUUID(),
    type,
    label: meta.label,
    options: hasOptions(type) ? ["Option 1", "Option 2"] : [],
    required: true,
    placeholder: meta.placeholder,
    textColor: null,
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: DEFAULT_FONT_WEIGHT,
    fontStyle: "normal",
  };
}

// Editing the content

export type BuilderEdit =
  | { type: "ADD_QUESTION"; questionType: QuestionType }
  | { type: "UPDATE_QUESTION"; clientId: string; patch: Partial<ClientQuestion> }
  | { type: "REMOVE_QUESTION"; clientId: string }
  | { type: "MOVE_QUESTION"; from: number; to: number }
  | { type: "DUPLICATE_QUESTION"; clientId: string }
  | { type: "UPDATE_SETTINGS"; patch: Partial<BuilderSettings> };

/** Applies one edit. Returns the same object when nothing changed. */
export function editContent(content: BuilderContent, edit: BuilderEdit): BuilderContent {
  const { questions } = content;

  switch (edit.type) {
    case "ADD_QUESTION":
      return { ...content, questions: [...questions, newQuestion(edit.questionType)] };

    case "UPDATE_QUESTION":
      return {
        ...content,
        questions: questions.map((q) =>
          q.clientId === edit.clientId ? { ...q, ...edit.patch } : q,
        ),
      };

    case "REMOVE_QUESTION":
      return { ...content, questions: questions.filter((q) => q.clientId !== edit.clientId) };

    case "MOVE_QUESTION": {
      const { from, to } = edit;
      const outOfRange = to < 0 || to >= questions.length || from < 0 || from >= questions.length;
      if (from === to || outOfRange) return content;

      const reordered = [...questions];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      return { ...content, questions: reordered };
    }

    case "DUPLICATE_QUESTION": {
      const index = questions.findIndex((q) => q.clientId === edit.clientId);
      if (index === -1) return content;

      const original = questions[index];
      const copy: ClientQuestion = {
        ...original,
        clientId: crypto.randomUUID(),
        id: undefined, // a copy is a new question in the database
        label: `${original.label} (copy)`,
      };
      return {
        ...content,
        questions: [...questions.slice(0, index + 1), copy, ...questions.slice(index + 1)],
      };
    }

    case "UPDATE_SETTINGS":
      return { ...content, settings: { ...content.settings, ...edit.patch } };
  }
}

// Undo / redo and "unsaved changes"

const MAX_UNDO_STEPS = 50;

export interface BuilderHistory {
  past: BuilderContent[];
  present: BuilderContent;
  future: BuilderContent[];
  /** The version the server has. Compared with `present` to find unsaved changes. */
  saved: BuilderContent;
}

export type HistoryAction =
  | BuilderEdit
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SAVED"; ids: SavedQuestionId[] };

export function createHistory(form: ServerForm): BuilderHistory {
  const content = contentFromForm(form);
  return { past: [], present: content, future: [], saved: content };
}

/** True when the owner changed something since the last save. */
export function hasUnsavedChanges(history: BuilderHistory): boolean {
  return JSON.stringify(history.present) !== JSON.stringify(history.saved);
}

/** Gives the questions of `content` the database ids the server just assigned. */
function withSavedIds(content: BuilderContent, ids: SavedQuestionId[]): BuilderContent {
  const idByClientId = new Map<string, string>();
  for (const { clientId, id } of ids) {
    if (clientId) idByClientId.set(clientId, id);
  }

  return {
    ...content,
    questions: content.questions.map((q) => {
      const id = idByClientId.get(q.clientId);
      return id ? { ...q, id } : q;
    }),
  };
}

export function historyReducer(history: BuilderHistory, action: HistoryAction): BuilderHistory {
  switch (action.type) {
    case "UNDO": {
      const previous = history.past.at(-1);
      if (!previous) return history;
      return {
        ...history,
        past: history.past.slice(0, -1),
        present: previous,
        future: [history.present, ...history.future],
      };
    }

    case "REDO": {
      const [next, ...rest] = history.future;
      if (!next) return history;
      return {
        ...history,
        past: [...history.past, history.present],
        present: next,
        future: rest,
      };
    }

    case "SAVED": {
      // Every version in the history gets the new ids. Otherwise undoing past a
      // save would bring back questions without an id, and the next save would
      // create them again and delete the originals together with their answers.
      const give = (content: BuilderContent) => withSavedIds(content, action.ids);
      const present = give(history.present);
      return {
        past: history.past.map(give),
        present,
        future: history.future.map(give),
        saved: present,
      };
    }

    default: {
      const present = editContent(history.present, action);
      if (present === history.present) return history;
      return {
        ...history,
        past: [...history.past, history.present].slice(-MAX_UNDO_STEPS),
        present,
        future: [],
      };
    }
  }
}

// Saving

export function toSaveQuestion(q: ClientQuestion) {
  return {
    clientId: q.clientId,
    id: q.id,
    type: q.type,
    label: q.label,
    options: q.options.length > 0 ? q.options : undefined,
    required: q.required,
    prefillKey: q.prefillKey ?? undefined,
    placeholder: q.placeholder ?? undefined,
    textColor: q.textColor ?? undefined,
    fontSize: q.fontSize ?? undefined,
    fontWeight: q.fontWeight ?? undefined,
    fontStyle: q.fontStyle ?? undefined,
  };
}

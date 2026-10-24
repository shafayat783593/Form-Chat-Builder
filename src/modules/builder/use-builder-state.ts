"use client";

import { useMemo, useReducer } from "react";
import {
  createHistory,
  hasUnsavedChanges,
  historyReducer,
  type BuilderActions,
  type ServerForm,
} from "./builder-state";


export function useBuilderState(form: ServerForm) {
  const [history, dispatch] = useReducer(historyReducer, form, createHistory);

  // `dispatch` never changes, so these functions are created 
  // once.
  const actions = useMemo<BuilderActions>(() => ({
      addQuestion: (questionType) => dispatch({ type: "ADD_QUESTION", questionType }),
      updateQuestion: (clientId, patch) => dispatch({ type: "UPDATE_QUESTION", clientId, patch }),
      removeQuestion: (clientId) => dispatch({ type: "REMOVE_QUESTION", clientId }),
      moveQuestion: (from, to) => dispatch({ type: "MOVE_QUESTION", from, to }),
      duplicateQuestion: (clientId) => dispatch({ type: "DUPLICATE_QUESTION", clientId }),
      updateSettings: (patch) => dispatch({ type: "UPDATE_SETTINGS", patch }),
      undo: () => dispatch({ type: "UNDO" }),
      redo: () => dispatch({ type: "REDO" }),
      markSaved: (ids) => dispatch({ type: "SAVED", ids }),
    }),
    [],
  );

  return {
    settings: history.present.settings,
    questions: history.present.questions,
    hasUnsavedChanges: hasUnsavedChanges(history),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    actions,
  };
}

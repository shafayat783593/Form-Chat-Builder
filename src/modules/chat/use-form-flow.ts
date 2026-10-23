"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  flowReducer,
  createInitialState,
  buildTranscript,
  validateQuestion,
  type FlowQuestion,
  type FlowState,
  type TranscriptEntry,
} from "./flow";
import { submitAnswers } from "./submit-answers";
import type { SearchParams } from "@/modules/form-runtime/prefill";

const TYPING_DELAY_MS = 500;
const PREVIEW_DELAY_MS = 400;

export interface UseFormFlowArgs {
  form: {
    slug: string;
    title: string;
    welcomeText: string;
    completionText: string;
    themeColor: string;
    submitButtonText: string;
    displayMode: "CLASSIC" | "FOCUS";
    showProgress: boolean;
    multiPageForm: boolean;
    questions: FlowQuestion[];
  };
  previewMode?: boolean;
  searchParams?: SearchParams;
  sourceOrigin?: string;
}

export interface UseFormFlowResult {
  state: FlowState;
  question: FlowQuestion | undefined;
  isLast: boolean;
  transcript: TranscriptEntry[];
  setAnswer: (value: string) => void;
  submit: (valueOverride?: string) => void;
  skip: () => void;
  retry: () => void;
  restart: () => void;
  /** Seconds left before a rate-limited Retry is allowed. */
  retryCountdown: number;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useFormFlow(args: UseFormFlowArgs): UseFormFlowResult {
  const { form, previewMode = false, searchParams, sourceOrigin } = args;

  const [state, setState] = useState<FlowState>(() => createInitialState(form.questions, searchParams));
  const [retryCountdown, setRetryCountdown] = useState(0);
  const isMounted = useRef(true);
  const isSubmitting = useRef(false);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const question = form.questions[state.index];
  const isLast = state.index >= form.questions.length - 1;

  const dispatch = useCallback(
    (action: Parameters<typeof flowReducer>[1]) => {
      setState((prev) => flowReducer(prev, action, form.questions.length));
    },
    [form.questions.length],
  );

  const indexOfQuestion = useCallback(
    (id: string) => form.questions.findIndex((q) => q.id === id),
    [form.questions],
  );

  const startCountdown = useCallback((seconds: number) => {
    setRetryCountdown(seconds);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    countdownTimer.current = setInterval(() => {
      setRetryCountdown((n) => {
        if (n <= 1) {
          if (countdownTimer.current) clearInterval(countdownTimer.current);
          countdownTimer.current = null;
          return 0;
        }
        return n - 1;
      });
    }, 1000);
  }, []);

  // Track unmounting so late async results are ignored.
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, []);

  // "typing" -> "asking". Runs on mount and between every question.
  useEffect(() => {
    if (state.phase !== "typing") return;
    const delay = prefersReducedMotion() ? 0 : TYPING_DELAY_MS;
    const timer = setTimeout(() => {
      if (isMounted.current) dispatch({ type: "TYPED" });
    }, delay);
    return () => clearTimeout(timer);
  }, [state.phase, dispatch]);

  // Send the answers to the API.
  const sendAnswers = useCallback(
    async (answers: Record<string, string>) => {
      if (isSubmitting.current) return;
      isSubmitting.current = true;

      if (previewMode) {
        await new Promise((r) => setTimeout(r, PREVIEW_DELAY_MS));
        if (isMounted.current) dispatch({ type: "DONE" });
        isSubmitting.current = false;
        return;
      }

      const outcome = await submitAnswers({
        slug: form.slug,
        answers,
        sourceOrigin,
      });

      if (!isMounted.current) return;
      isSubmitting.current = false;

      if (outcome.ok) {
        dispatch({ type: "DONE" });
        return;
      }

      if (outcome.details) {
        dispatch({ type: "SERVER_FIELD_ERRORS", details: outcome.details, questionIndex: indexOfQuestion });
        return;
      }

      dispatch({ type: "SUBMIT_FAILED", error: outcome.error });

      if (outcome.error.kind === "rate_limit") {
        startCountdown(outcome.error.retryAfter);
      }
    },
    [dispatch, form.slug, previewMode, sourceOrigin, indexOfQuestion, startCountdown],
  );

  const setAnswer = useCallback(
    (value: string) => {
      if (!question) return;
      dispatch({ type: "SET_ANSWER", id: question.id, value });
    },
    [dispatch, question],
  );

  /** Answers the current question and moves on. The last question sends. */
  const submit = useCallback(
    (valueOverride?: string) => {
      if (!question) return;
      if (state.phase !== "asking") return;

      const value = valueOverride ?? (state.answers[question.id] ?? "");
      const error = validateQuestion(question, value);
      if (error) {
        dispatch({ type: "SET_ERROR", id: question.id, message: error });
        return;
      }

      const answers = { ...state.answers, [question.id]: value.trim() };
      dispatch({ type: "SET_ANSWER", id: question.id, value: value.trim() });
      dispatch({ type: "ADVANCE" });

      if (isLast) void sendAnswers(answers);
    },
    [dispatch, question, state.answers, state.phase, isLast, sendAnswers],
  );

  /** Skips an optional question. Skipping the last one sends the answers. */
  const skip = useCallback(() => {
    if (!question || question.required) return;
    const answers = { ...state.answers, [question.id]: "" };
    dispatch({ type: "SET_ANSWER", id: question.id, value: "" });
    dispatch({ type: "SKIP", id: question.id });
    if (isLast) void sendAnswers(answers);
  }, [dispatch, question, state.answers, isLast, sendAnswers]);

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "submitting", submitError: null }));
    void sendAnswers(state.answers);
  }, [sendAnswers, state.answers]);

  const restart = useCallback(() => {
    dispatch({ type: "RESTART" });
  }, [dispatch]);

  return {
    state,
    question,
    isLast,
    transcript: buildTranscript(form.questions, state, form.welcomeText),
    setAnswer,
    submit,
    skip,
    retry,
    restart,
    retryCountdown,
  };
}

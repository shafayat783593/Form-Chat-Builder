/**
 * Server-side limits enforced everywhere user input crosses a boundary.
 * Client-side validation is UX only; these are the source of truth.
 */
export const MAX_FORMS_PER_USER = 20;
export const MAX_QUESTIONS_PER_FORM = 50;
export const MAX_OPTIONS = 10;
export const MAX_LABEL = 200;
export const MAX_ANSWER = 2000;
export const MAX_NOTIFY_EMAILS = 5;

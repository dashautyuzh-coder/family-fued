// lib/shared/keyboard.ts

/** True when a keydown event originated from a text field, so global
 * keyboard shortcuts shouldn't fire while the user is typing. */
export function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

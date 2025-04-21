import { clsx, type ClassValue } from "clsx"

/**
 * Combines multiple class names into a single string
 * This is a replacement for the Tailwind cn utility
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

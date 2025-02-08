/**
 * Joins class names together, filtering out falsy values
 * @param classes - Array of class names or conditional class name objects
 * @returns String of joined class names
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
  }
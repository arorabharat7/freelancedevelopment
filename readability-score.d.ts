declare module 'readability-score' {
    export function fleschKincaid(text: string): number;
    export function fleschReadingEase(text: string): number;
  }
  
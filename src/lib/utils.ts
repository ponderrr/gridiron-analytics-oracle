import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...args: any[]): string {
  return args.filter(Boolean).join(" ");
}

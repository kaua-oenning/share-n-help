import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Bed, Shirt, Sofa, UtensilsCrossed, Tv, Baby, Droplets, Apple, Package,
  type LucideIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const categoryIconMap: Record<string, LucideIcon> = {
  beds: Bed,
  clothing: Shirt,
  furniture: Sofa,
  kitchen: UtensilsCrossed,
  appliances: Tv,
  baby: Baby,
  hygiene: Droplets,
  food: Apple,
  other: Package,
};

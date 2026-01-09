import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertDurationToSeconds(durationString: string): number {
  if (!durationString) return 0;
  const parts = durationString.match(/(\d+)h\s*(\d+)min/);
  if (!parts) return 0;
  const hours = parseInt(parts[1] || '0', 10);
  const minutes = parseInt(parts[2] || '0', 10);
  return (hours * 3600) + (minutes * 60);
}

export function convertSecondsToDurationString(seconds: number): string {
  if (seconds < 0) return "0h 0min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}min`;
}

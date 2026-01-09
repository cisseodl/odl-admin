import { Module } from "./module.model";

export interface Lesson {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  title?: string | null;
  lessonOrder?: number | null;
  type?: string | null;
  contentUrl?: string | null;
  duration?: number | null; // seconds
  module?: Module | null;
}

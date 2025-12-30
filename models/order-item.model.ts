import { Course } from './course.model';

export interface OrderItem {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  price?: number | null;
  course?: Course | null;
  order_id?: number | null; // Keep order_id if not nested as object
}

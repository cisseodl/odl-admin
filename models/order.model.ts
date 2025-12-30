import { UserDb } from './user-db.model';
import { OrderItem } from './order-item.model';

export interface Order {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  orderDate?: Date | null;
  paymentId?: string | null;
  status?: string | null;
  totalAmount?: number | null;
  user?: UserDb | null;
  items?: OrderItem[] | null;
}

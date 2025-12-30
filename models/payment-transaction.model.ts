import { Order } from './order.model';

export interface PaymentTransaction {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  amount?: number | null;
  status?: string | null;
  stripePaymentIntentId?: string | null;
  timestamp?: Date | null;
  order?: Order | null;
}

import { Order } from '../models/order.model';
import { fetchApi } from './api.service';

export class OrderService {
  async getMyOrders(): Promise<Order[]> {
    const response = await fetchApi<any>("/orders/my-orders", { method: "GET" });
    return response.data;
  }

  async createOrder(courseIds: number[]): Promise<Order> {
    const response = await fetchApi<any>("/orders/create", {
      method: "POST",
      body: { courseIds },
    });
    return response.data;
  }

  async createPaymentIntent(orderId: number): Promise<any> {
    const response = await fetchApi<any>(`/orders/payment-intent/${orderId}`, { method: "POST" });
    return response.data;
  }

  async confirmPayment(paymentIntentId: string): Promise<Order> {
    const response = await fetchApi<any>("/orders/confirm", {
      method: "POST",
      body: { paymentIntentId },
    });
    return response.data;
  }

  // Other methods (getAllOrders, getOrderById, updateOrder, deleteOrder)
  // not explicitly defined in test.md.
  async getAllOrders(): Promise<Order[]> {
    console.log('Fetching all orders... (No explicit endpoint)');
    return [];
  }

  async getOrderById(id: number): Promise<Order | null> {
    console.log(`Fetching order with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order | null> {
    console.log(`Updating order with ID: ${id}`, orderData);
    return null;
  }

  async deleteOrder(id: number): Promise<void> {
    console.log(`Deleting order with ID: ${id}`);
  }
}

export const orderService = new OrderService();

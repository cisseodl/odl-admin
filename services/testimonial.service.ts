// services/testimonial.service.ts
import { fetchApi } from './api.service';

export interface Testimonial {
  id: number;
  content: string;
  createdAt: string;
  user?: {
    id: number;
    fullName?: string;
    email?: string;
  };
}

export class TestimonialService {
  async getAllTestimonials(): Promise<Testimonial[]> {
    try {
      const response = await fetchApi<any>(`/api/testimonials`, {
        method: "GET",
      });
      return response.data || response;
    } catch (error) {
      console.error("Error fetching all testimonials:", error);
      return [];
    }
  }

  async deleteTestimonial(testimonialId: number): Promise<void> {
    await fetchApi<void>(`/api/testimonials/${testimonialId}`, {
      method: "DELETE",
    });
  }
}

export const testimonialService = new TestimonialService();

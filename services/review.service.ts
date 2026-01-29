// services/review.service.ts
import { fetchApi } from './api.service';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id: number;
    fullName?: string;
    email?: string;
    avatar?: string;
  };
  course?: {
    id: number;
    title?: string;
  };
}

export class ReviewService {
  async addCourseReview(courseId: number, rating: number, comment: string): Promise<Review> {
    const response = await fetchApi<any>(`/api/courses/${courseId}/reviews?rating=${rating}&comment=${encodeURIComponent(comment)}`, {
      method: "POST",
    });
    return response.data || response;
  }

  async getReviewsByCourse(courseId: number): Promise<Review[]> {
    const response = await fetchApi<any>(`/api/courses/${courseId}/reviews`, {
      method: "GET",
    });
    return response.data || response;
  }

  async getAllReviews(): Promise<Review[]> {
    try {
      const response = await fetchApi<any>(`/api/reviews/all`, { // Corrected path
        method: "GET",
      });
      return response.data || response;
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      return [];
    }
  }

  async deleteReview(reviewId: number): Promise<void> {
    await fetchApi<void>(`/api/reviews/${reviewId}`, {
      method: "DELETE",
    });
  }
}

export const reviewService = new ReviewService();
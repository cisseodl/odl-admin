import { fetchApi } from './api.service';

// services/analytics.service.ts

// Define the data structure for a learner's progress, which will be returned by our service.
export type CourseProgress = {
  courseId: number;
  courseTitle: string;
  courseOverallProgress: number; // Percentage for this specific course
  chaptersCompleted: number;
  totalChapters: number;
  period: string; // New field for the learning period
};

export type LearnerProgress = {
  id: string
  name: string
  email: string
  coursesEnrolled: number
  coursesCompleted: number
  overallProgress: number // a percentage from 0 to 100
  courses: CourseProgress[]; // New field for detailed course progress
}

// Type for the dashboard summary data from the API
export type AdminDashboardSummary = {
  totalUsers: number;
  totalCourses: number;
  totalQuizAttemptsGlobal: number;
  totalCertificatesGlobal: number;
  mode: "ADMIN";
}

// Data type for the new comprehensive admin dashboard analytics
export interface AdminDashboardAnalytics {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  usersByRole: { [role: string]: number };
  totalCourses: number;
  newCoursesLast7Days: number;
  newCoursesLast30Days: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  top5CoursesByEnrollment: { [courseTitle: string]: number };
  lessonsCompleted: number;
  totalQuizzes: number;
  pendingModeration: number;
}

// Data type for instructor dashboard statistics
export interface InstructorDashboardStats {
  totalCoursesCreated: number;
  totalStudents: number;
  averageRating: number;
  totalRevenue: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  newEnrollmentsLast7Days: number;
  newEnrollmentsLast30Days: number;
  activeLearners: number;
  averageCompletionRate: number;
  averageQuizScore: number;
  newComments: number;
}

// New type for the overall comparison statistics
export type OverallComparisonStats = {
  registrationsCurrentPeriod: number;
  registrationsPreviousPeriod: number;
  completionRateCurrentPeriod: number;
  completionRatePreviousPeriod: number;
  coursesCreatedCurrentPeriod: number;
  coursesCreatedPreviousPeriod: number;
  activeUsersCurrentPeriod: number;
  activeUsersPreviousPeriod: number;
};


// Define ComparisonStatsData based on typical comparison metrics (this type is no longer directly returned by getComparisonStats)
// Keeping it for now in case other parts of the app use it, but getComparisonStats will return OverallComparisonStats
export type ComparisonStatsData = {
  metric: string;
  currentPeriod: number;
  previousPeriod: number;
  change: number; // Percentage change
  isPositiveTrend: boolean;
};

// Define ModerationSummaryData based on pending moderation alerts
export type ModerationSummaryData = {
  pendingCourses: number;
  pendingInstructorProfiles: number;
  pendingReviews: number;
  flaggedContent: number; // Added this property
  totalPending: number;
};

// Define UserGrowthDataPoint for chart data
export type UserGrowthDataPoint = {
  date: string; // La date (ex: "YYYY-MM-DD" ou "YYYY-MM")
  newUsers: number;
  totalUsers: number; // Added totalUsers
};

// Define CoursePerformanceDataPoint for chart data
export type CoursePerformanceDataPoint = {
  courseId: number;
  courseTitle: string;
  enrollments: number; // Nombre d'inscriptions
  completionRate: number; // Taux de complétion moyen (en pourcentage)
  averageRating: number; // Note moyenne
  period: string; // Période des données (ex: "2025-01")
};

class AnalyticsService {
  async getComparisonStats(): Promise<OverallComparisonStats> { // Changed return type
    // Assuming an API endpoint that returns the OverallComparisonStats object
    const response = await fetchApi<{ data: OverallComparisonStats }>('/analytics/comparison-stats', { method: 'GET' });
    return response.data; // Extraire la propriété 'data'
  }

  async getAdminDashboardAnalytics(): Promise<AdminDashboardAnalytics> {
    // Assuming an API endpoint for global admin dashboard analytics
    const response = await fetchApi<{ data: AdminDashboardAnalytics }>('/analytics/admin-dashboard-analytics', { method: 'GET' });
    // Le backend retourne directement AdminStats, pas dans un objet avec mode
    return response.data; // Extraire la propriété 'data'
  }

  async getModerationSummary(): Promise<ModerationSummaryData> {
    // Assuming an API endpoint for moderation summary
    const response = await fetchApi<{ data: ModerationSummaryData }>('/analytics/moderation-summary', { method: 'GET' });
    return response.data; // Extraire la propriété 'data'
  }

  async getUserGrowthData(timeframe: string): Promise<UserGrowthDataPoint[]> { // Renamed and added timeframe parameter
    const queryParams = new URLSearchParams();
    queryParams.append("timeframe", timeframe); // Add timeframe to query params
    const response = await fetchApi<{ data: UserGrowthDataPoint[] }>(`/analytics/user-growth?${queryParams.toString()}`, { method: 'GET' });
    return response.data; // Extraire la propriété 'data'
  }

  async getCoursePerformanceData(timeFilter?: string, startDate?: string, endDate?: string): Promise<CoursePerformanceDataPoint[]> {
    const queryParams = new URLSearchParams();
    // Utiliser une valeur par défaut si timeFilter n'est pas fourni
    queryParams.append("timeFilter", timeFilter || "30d");
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const response = await fetchApi<{ data: CoursePerformanceDataPoint[] }>(`/analytics/course-performance?${queryParams.toString()}`, { method: 'GET' });
    return response.data || []; // Extraire la propriété 'data' ou retourner un tableau vide
  }

  async getLearnerProgress(learnerId: number): Promise<LearnerProgress> {
    const response = await fetchApi<{ data: LearnerProgress }>(`/analytics/learner/${learnerId}/progress`, { method: 'GET' });
    return response.data; // Extraire la propriété 'data'
  }

  async getAnalyticsMetrics(): Promise<AnalyticsMetrics> {
    const response = await fetchApi<{ data: AnalyticsMetrics }>('/analytics/analytics-metrics', { method: 'GET' });
    return response.data; // Extraire la propriété 'data'
  }

  async getInstructorDashboardStats(): Promise<InstructorDashboardStats> {
    const response = await fetchApi<{ data: { instructorStats: any; mode: string } }>('/api/dashboard/instructor', { method: 'GET' });
    // Le backend retourne DashboardStatsDTO avec instructorStats dans data
    const data = response.data || response;
    const instructorStats = data.instructorStats || data;
    // Mapper les champs du backend vers le type frontend
    return {
      totalCoursesCreated: instructorStats.totalCourses || 0,
      totalStudents: instructorStats.totalStudents || 0,
      averageRating: instructorStats.averageRating || 0,
      totalRevenue: instructorStats.totalRevenue || 0,
      publishedCourses: instructorStats.publishedCourses || 0,
      draftCourses: instructorStats.draftCourses || 0,
      totalEnrollments: instructorStats.totalEnrollments || 0,
      newEnrollmentsLast7Days: instructorStats.newEnrollmentsLast7Days || 0,
      newEnrollmentsLast30Days: instructorStats.newEnrollmentsLast30Days || 0,
      activeLearners: instructorStats.activeLearners || 0,
      averageCompletionRate: instructorStats.averageCompletionRate || 0,
      averageQuizScore: instructorStats.averageQuizScore || 0,
      newComments: instructorStats.newComments || 0,
    };
  }

  async getInstructorActivity(instructorId: number, limit: number = 10): Promise<InstructorActivityDataPoint[]> {
    const response = await fetchApi<{ data: InstructorActivityDataPoint[] }>(
      `/api/analytics/instructor-activity?instructorId=${instructorId}&limit=${limit}`,
      { method: 'GET' }
    );
    return response.data || [];
  }

  // You can add more analytics methods here as needed
}

export interface AnalyticsMetrics {
  averageRating: number;
  totalReviews: number;
  engagementRate: number;
  activeUsers: number;
  totalUsers: number;
  averageSessionTimeMinutes: number;
  activeSessions: number;
  interactionRate: number;
}

export interface InstructorActivityDataPoint {
  activityType: string;
  courseId?: number;
  courseTitle?: string;
  timestamp: string;
}

export const analyticsService = new AnalyticsService();
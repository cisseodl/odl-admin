export const adminStats = {
  totalUsers: 2500,
  newUsersLast7Days: 150,
  newUsersLast30Days: 600,
  usersByRole: {
    ADMIN: 5,
    INSTRUCTOR: 50,
    LEARNER: 2445,
  },
  totalCourses: 120,
  newCoursesLast7Days: 8,
  newCoursesLast30Days: 25,
  publishedCourses: 110,
  draftCourses: 10,
  totalEnrollments: 15080,
  top5CoursesByEnrollment: {
    "Introduction à AWS S3": 2300,
    "React pour les débutants": 1850,
    "Spring Boot Avancé": 1500,
    "Docker & Kubernetes": 1200,
    "Python pour la Data Science": 1100,
  },
  lessonsCompleted: 75000,
  totalQuizzes: 450,
  pendingModeration: 10,
};

export const instructorStats = {
  totalCourses: 15,
  publishedCourses: 12,
  draftCourses: 3,
  totalEnrollments: 1234,
  newEnrollmentsLast7Days: 56,
  newEnrollmentsLast30Days: 210,
  activeLearners: 450,
  averageCompletionRate: 45.7,
  averageQuizScore: 82.3,
  newComments: 12,
};

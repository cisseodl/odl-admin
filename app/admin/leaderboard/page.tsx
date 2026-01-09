"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Star, BookOpen, GraduationCap } from "lucide-react"
import { MonthlyLeaderboard } from "@/components/admin/leaderboard/monthly-leaderboard"
import { CourseLeaderboard } from "@/components/admin/leaderboard/course-leaderboard"
import type { LeaderboardEntry } from "@/types/gamification"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

import { leaderboardService, courseService } from "@/services"; // Import services
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader
import { Course } from "@/models/course.model"; // Import Course model

// Extension du type LeaderboardEntry pour inclure les détails des formations et certifications
interface UserDetails extends LeaderboardEntry {
  completedCoursesList: { id: number, title: string }[]
  certificationsList: { id: number, title: string, issuedDate: string }[]
}

export default function LeaderboardPage() {
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false)

  const [overallLeaderboard, setOverallLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]); // For course filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overall, monthly, courses] = await Promise.all([
          leaderboardService.getOverall(),
          leaderboardService.getMonthly(),
          courseService.getAllCourses(),
        ]);
        setOverallLeaderboard(overall.map((entry: any, index: number) => ({ ...entry, rank: index + 1 })));
        setMonthlyLeaderboard(monthly);
        setCoursesList(courses);
      } catch (err: any) {
        setError(err.message || "Failed to fetch leaderboard data.");
        console.error("Error fetching leaderboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboardData();
  }, []);

  const getUserDetails = async (entry: LeaderboardEntry) => { // Make async
    setShowUserDetailsModal(true); // Open modal immediately
    setSelectedUser(null); // Clear previous user details while loading

    try {
      const userDetails = await leaderboardService.getUserDetails(entry.userId); // Fetch details from API
      // Map API response to UserDetails interface
      const mappedDetails: UserDetails = {
        ...entry,
        completedCoursesList: userDetails.completedCoursesList || [],
        certificationsList: userDetails.certificationsList || [],
        // Assuming userDetails from API also contains basic LeaderboardEntry fields
      };
      setSelectedUser(mappedDetails);
    } catch (err: any) {
      console.error("Error fetching user details:", err);
      setSelectedUser({
        ...entry,
        completedCoursesList: [],
        certificationsList: [],
      }); // Fallback to basic info + empty lists on error
    }
  };


  const getLeaderboardForCourse = async (courseId: number): Promise<LeaderboardEntry[]> => { // Make async
    try {
      const response = await leaderboardService.getCourseLeaderboard(courseId);
      return response;
    } catch (err: any) {
      console.error(`Error fetching leaderboard for course ${courseId}:`, err);
      return [];
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classements"
        description="Consultez les classements et performances des utilisateurs"
      />

      {loading ? (
        <PageLoader />
      ) : error ? (
        <div className="text-center text-destructive p-4">{error}</div>
      ) : (
        <Tabs defaultValue="overall" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-[rgb(50,50,50)]/10 dark:bg-[rgb(50,50,50)]/20 border border-[rgb(50,50,50)]/20">
            <TabsTrigger
              value="overall"
              className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
            >
              Général
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
            >
              Mensuel
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-[rgb(255,102,0)] data-[state=active]:text-white dark:data-[state=active]:bg-[rgb(255,102,0)] dark:data-[state=active]:text-white"
            >
              Par formation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Classement Général</CardTitle>
                <CardDescription>Top utilisateurs par nombre de formations et certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overallLeaderboard.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4">Aucun classement général trouvé.</div>
                  ) : (
                    overallLeaderboard.map((entry) => (
                      <div
                        key={entry.rank}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => {
                          getUserDetails(entry)
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center">
                            {getRankIcon(entry.rank)}
                          </div>
                          <Avatar>
                            <AvatarImage src={entry.avatar} />
                            <AvatarFallback>{entry.userName.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{entry.userName}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-4">
                              <span>{entry.coursesCompleted} formations</span>
                              <span>•</span>
                              <span>{entry.certifications} certifications</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <MonthlyLeaderboard entries={monthlyLeaderboard} />
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <CourseLeaderboard courses={coursesList} getLeaderboardForCourse={getLeaderboardForCourse} />
          </TabsContent>
        </Tabs>
      )}

      {/* Modal Détails Utilisateur */}
      <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de {selectedUser?.userName}</DialogTitle>
            <DialogDescription>
              Aperçu des formations terminées et des certifications obtenues.
            </DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Formations Terminées ({selectedUser.completedCoursesList.length})
                </h3>
                {selectedUser.completedCoursesList.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedUser.completedCoursesList.map((course) => (
                      <li key={course.id} className="text-muted-foreground text-sm">{course.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">Aucune formation terminée.</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Certifications Obtenues ({selectedUser.certificationsList.length})
                </h3>
                {selectedUser.certificationsList.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedUser.certificationsList.map((cert) => (
                      <li key={cert.id} className="text-muted-foreground text-sm">
                        {cert.title} (Délivré le: {cert.issuedDate})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">Aucune certification obtenue.</p>
                )}
              </div>
            </div>
          ) : (
            <PageLoader /> // Show loader while fetching user details
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetailsModal(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
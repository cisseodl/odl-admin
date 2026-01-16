"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import type { User } from "@/types"
import { authService } from "@/lib/auth"

// Define UserRole type for local use
type UserRole = "admin" | "instructor" | "apprenant";

type AuthContextType = {
  user: User | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter(); // Initialize useRouter
  const INACTIVITY_TIMEOUT = 60000; // 1 minute en millisecondes

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedUser = authService.getUserInfo();
      const token = authService.getAuthToken();

      if (storedUser && token) {
        // Validate token with the backend
        const isValid = await authService.validateToken();
        if (isValid) {
          setUser(storedUser);
        } else {
          // Token is invalid, clear storage and redirect to login
          console.log("Stored token is invalid. Logging out and redirecting.");
          authService.signOut();
          setUser(null);
          router.push('/login');
        }
      } else {
        // No user or token found in local storage
        setUser(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [router]); // Add router to dependency array

  // Gestion de la déconnexion automatique après 1 minute d'inactivité
  useEffect(() => {
    if (!user) return; // Ne pas surveiller si l'utilisateur n'est pas connecté

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      // Réinitialiser le timer à chaque activité
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log("Déconnexion automatique après 1 minute d'inactivité");
        authService.signOut();
        setUser(null);
        router.push('/login');
      }, INACTIVITY_TIMEOUT);
    };

    // Événements à surveiller pour détecter l'activité
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Initialiser le timer
    resetTimer();

    // Nettoyer les event listeners et le timer lors du démontage
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, router]);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setIsLoading(true); // Start loading
    try {
      const loggedInUser = await authService.signIn(credentials);
      console.log("Logged in user data from authService.signIn:", loggedInUser);
      const rawUser = loggedInUser.user; // <-- Réintroduit cette ligne cruciale
      
      if (rawUser && rawUser.role) { // Simplifier la condition
        const userWithRole: User = {
          id: String(rawUser.id),
          email: rawUser.email,
          name: rawUser.fullName || rawUser.email,
          role: rawUser.role, // Utiliser directement le rôle déjà déterminé
        };
        setUser(userWithRole);
        console.log("User state set in AuthContext:", userWithRole);
      } else {
        setUser(null);
        console.log("User state set in AuthContext: null (role could not be determined or rawUser is null)");
      }
    } catch (error) {
      console.error("Login failed in AuthContext:", error);
      // Optionally handle error here or rethrow
      throw error;
    } finally {
      setIsLoading(false); // End loading
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    authService.signOut()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


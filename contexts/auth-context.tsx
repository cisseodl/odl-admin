"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import type { User } from "@/types"
import { authService } from "@/lib/auth"

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

  useEffect(() => {
    // Charger l'utilisateur depuis le localStorage au montage
    const storedUser = authService.getUser()
    setUser(storedUser)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setIsLoading(true); // Start loading
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
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
    authService.removeUser()
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


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, Mail, Lock, Shield, Eye, EyeOff, Loader2, Sparkles } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useRedirectIfAuthenticated } from "@/hooks/use-redirect"
// import { DEMO_USERS } from "@/constants/auth" // Removed DEMO_USERS
import { redirectToDashboard } from "@/lib/navigation"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { login, isLoading: authLoading } = useAuth() // Use isLoading from auth context
  const [isLoading, setIsLoading] = useState(false) // Local loading for form submission
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Rediriger si déjà connecté
  useRedirectIfAuthenticated()

  const onSubmit = async (data: LoginFormData) => {
    setError("")
    setIsLoading(true) // Start local loading for form submission

    try {
      await login({ email: data.email, password: data.password });
      // The redirectToDashboard is handled by the useRedirectIfAuthenticated hook
      // or can be added here if needed, but context handles it.
      // For now, the AuthProvider's login will set the user, and useRedirectIfAuthenticated will redirect.
    } catch (err: any) {
      setError(err.message || t('auth.loginPage.error'));
      console.error("Login page error:", err);
    } finally {
      setIsLoading(false); // End local loading
    }
  }

  // Combine both loading states
  const finalLoading = isLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-orange-50/30 to-orange-100/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Container principal centré */}
      <div className="w-full max-w-sm relative z-10">
        <Card className="backdrop-blur-sm bg-background/80 border-2 shadow-lg dark:shadow-xl dark:shadow-primary/20">
          <CardHeader className="space-y-3 pb-4">
            {/* Logo et titre */}
            <div className="flex flex-col items-center space-y-4">
              <Image 
                src="/logo.png" 
                alt="Logo E-Learning" 
                width={240} 
                height={90} 
                className="h-24 w-auto object-contain"
                priority
              />
              <div className="text-center space-y-1">
                <CardTitle className="text-xl font-semibold">Connexion</CardTitle>
                <CardDescription className="text-sm">
                  Connectez-vous pour accéder à votre espace
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Champ Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('auth.loginPage.emailLabel')}
                </Label>
                <div className="relative group">
                  <div
                    className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                      focusedField === "email" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('auth.loginPage.emailPlaceholder')}
                        className={cn(
                          "pl-10 h-11 transition-all duration-200",
                          errors.email
                            ? "border-destructive focus-visible:ring-destructive"
                            : focusedField === "email"
                              ? "border-primary focus-visible:ring-primary"
                              : "border-input",
                          "focus-visible:ring-2 focus-visible:ring-offset-2"
                        )}
                        {...field}
                        value={field.value || ""}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        disabled={finalLoading}
                        autoComplete="email"
                      />
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <span className="text-destructive">•</span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative group">
                  <div
                    className={cn(
                      "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                      focusedField === "password" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Lock className="h-5 w-5" />
                  </div>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={cn(
                          "pl-10 pr-10 h-11 transition-all duration-200",
                          errors.password
                            ? "border-destructive focus-visible:ring-destructive"
                            : focusedField === "password"
                              ? "border-primary focus-visible:ring-primary"
                              : "border-input",
                          "focus-visible:ring-2 focus-visible:ring-offset-2"
                        )}
                        {...field}
                        value={field.value || ""}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        disabled={finalLoading}
                        autoComplete="current-password"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={finalLoading}
                    aria-label={showPassword ? t('auth.loginPage.hidePassword') : t('auth.loginPage.showPassword')}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <span className="text-destructive">•</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <span className="text-destructive">•</span>
                  {error}
                </div>
              )}

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                disabled={finalLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('auth.loginPage.submitting')}
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    {t('auth.loginPage.submit')}
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}

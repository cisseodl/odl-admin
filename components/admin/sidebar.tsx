"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { adminRoutes } from "@/constants/routes"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Accordion imports

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
        aria-controls="sidebar-navigation"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar-navigation"
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navigation principale"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b px-6">
            <Link 
              href="/admin" 
              className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              aria-label="Retour au tableau de bord"
            >
              <Image 
                src="/logo.png" 
                alt="Logo E-Learning" 
                width={120} 
                height={40} 
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

                    <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto" aria-label="Navigation principale"> {/* space-y-3 */}
                      <Accordion type="multiple" className="w-full"> {/* Use Accordion for expandable sub-menus */}
                        {adminRoutes.map((route) => {
                          const isActive = pathname === route.href || (route.children && route.children.some(child => pathname.startsWith(child.href)));
                          
                          if (route.children) {
                                                        return (
                                                          <AccordionItem key={route.label} value={route.label} className="border-b-0 mb-3">
                                                            <AccordionTrigger 
                                                              className={cn(
                                                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                                isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground",
                                                              )}
                                                            >
                                                              <route.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                              <span>{route.label}</span>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="pb-1">
                                                              <div className="ml-4 pl-2 border-l border-muted-foreground/20 space-y-3"> {/* space-y-3 */}
                                                                {route.children.map((child) => {
                                                                  const isChildActive = pathname === child.href;
                                                                  return (
                                                                    <Link
                                                                      key={child.href}
                                                                      href={child.href}
                                                                      onClick={() => setIsOpen(false)}
                                                                      className={cn(
                                                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                                        isChildActive
                                                                          ? "bg-primary text-primary-foreground shadow-sm"
                                                                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                                                      )}
                                                                      aria-current={isChildActive ? "page" : undefined}
                                                                    >
                                                                      <child.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                                      <span>{child.label}</span>
                                                                    </Link>
                                                                  );
                                                                })}
                                                              </div>
                                                            </AccordionContent>
                                                          </AccordionItem>
                                                        );
                                                      } else {
                                                        return (
                                                          <div key={route.href} className="mb-3"> {/* Wrap in a div to add margin */}
                                                            <Link
                                                              href={route.href}
                                                              onClick={() => setIsOpen(false)}
                                                              className={cn(
                                                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                                isActive
                                                                  ? "bg-primary text-primary-foreground shadow-sm"
                                                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                                              )}
                                                              aria-current={isActive ? "page" : undefined}
                                                            >
                                                              <route.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                              <span>{route.label}</span>
                                                            </Link>
                                                            {/* Remove the conditional mb-4 here for uniform spacing */}
                                                          </div>
                                                        );                          }
                        })}
                      </Accordion>
                    </nav>        </div>      </aside>
    </>
  )
}

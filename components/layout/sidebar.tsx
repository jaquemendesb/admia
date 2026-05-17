"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { navigation } from "@/config/navigation"
import { can } from "@/lib/rbac/check"
import { cn } from "@/lib/utils"
import type { RoleName } from "@/types/rbac"

interface SidebarProps {
  role: string
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string | null>(() => {
    const active = navigation.find(
      (item) => item.children && pathname.startsWith(item.href)
    )
    return active?.href ?? null
  })

  const visibleNav = navigation.filter((item) =>
    can(role as RoleName, item.resource, "VIEW")
  )

  return (
    <aside className="w-60 flex-shrink-0 bg-brand-navy flex flex-col h-full">
      <div className="h-14 flex items-center px-5 border-b border-white/10 flex-shrink-0">
        <span className="text-white font-semibold text-lg tracking-tight">
          ADMIA
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {visibleNav.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          const isExpanded = expanded === item.href || isActive

          if (!item.children) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/65 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.title}
              </Link>
            )
          }

          return (
            <div key={item.href}>
              <button
                onClick={() => setExpanded(isExpanded ? null : item.href)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/65 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.title}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>
              {isExpanded && (
                <div className="ml-4 mt-0.5 border-l border-white/10 pl-3 space-y-0.5">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-2 py-1.5 rounded-md text-xs transition-colors",
                          childActive
                            ? "text-white font-medium"
                            : "text-white/55 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {child.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

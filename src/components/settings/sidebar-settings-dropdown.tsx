"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
import clsx from "clsx"

const settingsItems = [
  { title: "Expense Category", url: "/settings/expensescategory" },
  { title: "Customers", url: "/settings/customers"},
  { title: "Supplier", url: "/settings/supplier"},
  { title: "Tax Rates", url: "/settings/taxrates" },
  { title: "Branches", url: "/settings/branches" },
]

export function SidebarSettingsDropdown() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = settingsItems.some(item => pathname.startsWith(item.url))

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "flex items-center justify-between w-full px-2 py-2 text-sm rounded-md hover:bg-muted",
          isActive ? "bg-muted" : ""
        )}
      >
        <span className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {open && (
        <div className="ml-6 mt-1 space-y-1  border-border pl-3">
          {settingsItems.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className={clsx(
                "block text-sm text-muted-foreground hover:text-foreground",
                pathname === item.url && "text-foreground font-medium"
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

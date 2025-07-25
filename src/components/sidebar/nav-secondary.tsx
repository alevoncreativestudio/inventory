import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/types/navigation";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const settingsItems = [
  { title: "Expense Category", url: "/settings/expensescategory" },
  { title: "Customers", url: "/settings/customers" },
  { title: "Supplier", url: "/settings/supplier" },
  { title: "Tax Rates", url: "/settings/taxrates" },
  { title: "Branches", url: "/settings/branches" },
];

interface NavSecondaryProps extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  items: NavItem[];
}

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  const pathname = usePathname();
  const isSettingsActive = settingsItems.some((item) =>
    pathname.startsWith(item.url)
  );

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            if (item.title === "Settings") {
              return (
                <Collapsible
                  key="settings"
                  defaultOpen={isSettingsActive}
                  className="w-full group/collapsible"
                >
                  <CollapsibleTrigger
                    className={clsx(
                      "flex items-center justify-between w-full px-2 py-2 text-sm rounded-md hover:bg-muted",
                      isSettingsActive && "bg-muted"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span className="truncate transition-all group-[.collapsed]/sidebar:hidden">
                        {item.title}
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4 ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 group-[.collapsed]/sidebar:hidden" />
                  </CollapsibleTrigger>


                  <CollapsibleContent className="pl-4 mt-1 space-y-1">
                    {settingsItems.map((subItem) => (
                      <Link
                        key={subItem.url}
                        href={subItem.url}
                        className={clsx(
                          "block text-sm text-muted-foreground hover:text-foreground",
                          pathname === subItem.url && "text-foreground font-medium"
                        )}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

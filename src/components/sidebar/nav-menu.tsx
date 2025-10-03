"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NavItem } from "@/types/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

interface NavMenuProps {
  items: NavItem[];
}

export const NavMenu = ({ items, ...rest }: NavMenuProps) => {
  const pathname = usePathname();
  
  return (
    <SidebarMenu {...rest}>
      {items.map((item) =>
        item.children ? (
          <SubMenu key={item.title} item={item} />
        ) : (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton 
              asChild 
              isActive={pathname === item.url}
              className={clsx(
                "text-sidebar-foreground hover:text-white hover:bg-green-600",
                pathname === item.url && "!bg-green-600 !text-white"
              )}
            >
              <Link href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ),
      )}
    </SidebarMenu>
  );
};

const SubMenu = ({ item }: { item: NavItem }) => {
  const pathname = usePathname();
  const isActive = pathname === item.url || item.children?.some(child => 
    pathname === child.url || (child.children && child.children.some(grandChild => pathname === grandChild.url))
  );
  
  return (
    <Collapsible key={item.title} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            className={clsx(
              "text-sidebar-foreground hover:text-white hover:bg-green-600",
              isActive && "!bg-green-600 !text-white"
            )}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>

      <CollapsibleContent>
        <SidebarMenuSub>
          {item.children!.map((subItem) =>
            subItem.children ? (
              <SidebarMenuSubItem key={subItem.url}>
                <SubMenu item={subItem} />
              </SidebarMenuSubItem>
            ) : (
              <SidebarMenuSubItem key={subItem.url}>
                <SidebarMenuSubButton 
                  asChild 
                  isActive={pathname === subItem.url}
                  className={clsx(
                    "text-sidebar-foreground hover:text-white hover:bg-green-600",
                    pathname === subItem.url && "!bg-green-600 !text-white"
                  )}
                >
                  <Link href={subItem.url}>
                    {subItem.icon && <subItem.icon />}
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ),
          )}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
};

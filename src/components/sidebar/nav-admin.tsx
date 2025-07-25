'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { ChevronDown } from 'lucide-react';
import { IconArrowsUpDown, IconDots, IconMan, IconShare3 } from '@tabler/icons-react';

import Link from 'next/link';
import type { NavItem } from '@/types/navigation';
import { useSidebar } from '@/components/ui/sidebar';

interface NavAdminProps {
  items: NavItem[];
}

export function NavAdmin({ items }: NavAdminProps) {
  const { isMobile } = useSidebar();

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger>
            Admin Area
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover className="data-[state=open]:bg-accent rounded-sm">
                      <IconDots />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? 'bottom' : 'right'}
                    align={isMobile ? 'end' : 'start'}
                  >
                    <DropdownMenuItem asChild>
                      <Link href="/reports/contact-reports">
                        <IconMan className="mr-2 h-4 w-4" />
                        Contact Report
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reports/sales-purchase-reports">
                        <IconArrowsUpDown className="mr-2 h-4 w-4" />
                        Sales & Purchase Report
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reports/payment-reports">
                        <IconArrowsUpDown className="mr-2 h-4 w-4" />
                        Payment Report
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reports/pnl-reports">
                        <IconArrowsUpDown className="mr-2 h-4 w-4" />
                        PnL Report
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconShare3 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

import {
  IconBrandProducthunt,
  IconBrandShopee,
  IconCategory,
  IconCurrency,
  IconDashboard,
  IconDatabase,
  IconFileText,
  IconHelp, IconSearch,
  IconSettings,
  IconShoppingBag,
  IconUserPlus
} from '@tabler/icons-react';
import type { SidebarData } from '@/types/navigation';
import { APP_CONFIG } from '@/config/app';

export const SIDEBAR_DATA: SidebarData = {
  demoUser: {
    name: 'John Doe',
    email: 'john@company.com',
    avatar: '/avatars/default.jpg',
  },

  // main navigation for all users
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Purchase',
      url: '/purchase',
      icon: IconShoppingBag,
    },
    {
      title: 'Products',
      url: '/products',
      icon: IconBrandProducthunt,
    },
    {
      title: 'Brands',
      url: '/brands',
      icon: IconBrandShopee,
    },
    {
      title: 'Categories',
      url: '/categories',
      icon: IconCategory,
    },
    {
      title: 'Expenses',
      url: '/expenses',
      icon: IconCurrency,
    }
  ],

  // only admin can see this navigation
  admin: [
    {
      title: 'Data Management',
      url: '/admin/data-management',
      icon: IconDatabase,
    },
    {
      title: 'Reports',
      url: '/admin/reports',
      icon: IconFileText,
    },
    {
      title: 'Users',
      url: '/admin/users',
      icon: IconUserPlus,
    },
  ],

  // secondary navigation for all users
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: IconSettings,
    },
    {
      title: 'Search',
      url: '/search',
      icon: IconSearch,
    },
    {
      title: 'Help & Support',
      url: '/help',
      icon: IconHelp,
    },
  ],
};

export const COMPANY_INFO = {
  name: APP_CONFIG.name,
  description: APP_CONFIG.description,
} as const;

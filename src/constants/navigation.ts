import {
  IconBox,
  IconBrandShopee,
  IconBuilding,
  IconCategory,
  IconCoin,
  IconCurrency,
  IconDashboard,
  IconFileText,
  IconPercentage,
  IconSettings,
  IconShoppingBag,
  IconTruckDelivery,
  IconTruckLoading,
  IconUserPlus,
} from "@tabler/icons-react";
import type { SidebarData } from "@/types/navigation";
import { APP_CONFIG } from "@/config/app";

export const SIDEBAR_DATA: SidebarData = {
  // main navigation for all users
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/products",
      icon: IconBox,
    },
    {
      title: "Purchase",
      url: "/purchase",
      icon: IconShoppingBag,
    },
    {
      title: "Purchase Return",
      url: "/purchase-return",
      icon: IconTruckDelivery,
    },
    {
      title: "Sales",
      url: "/sales",
      icon: IconCoin,
    },
    {
      title: "Sales Return",
      url: "/sales-return",
      icon: IconTruckLoading,
    },
    {
      title: "Brands",
      url: "/brands",
      icon: IconBrandShopee,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: IconCategory,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: IconCurrency,
    },
  ],

  // only admin can see this navigation
  admin: [
    // {
    //   title: 'Data Management',
    //   url: '/admin/data-management',
    //   icon: IconDatabase,
    // },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: IconFileText,
      children: [
        {
          title: "Contact Report",
          url: "/reports/contact-reports",
        },
        {
          title: "Sales & Purchase Report",
          url: "/reports/sales-purchase-reports",
        },
        {
          title: "Payment Report",
          url: "/reports/payment-reports",
        },
        {
          title: "Profit & Loss Report",
          url: "/reports/pnl-reports",
        },
      ],
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUserPlus,
    },
    { 
      title: "Tax Rates", 
      url: "/settings/taxrates",
      icon: IconPercentage, 
     },
    { 
      title: "Branches", 
      url: "/settings/branches",
      icon: IconBuilding, 
    },
  ],

  // secondary navigation for all users
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
      children: [
        { title: "Expense Category", url: "/settings/expensescategory" },
        { title: "Customers", url: "/settings/customers" },
        { title: "Supplier", url: "/settings/supplier" },
      ],
    },
  ],
};

export const COMPANY_INFO = {
  name: APP_CONFIG.name,
  description: APP_CONFIG.description,
} as const;

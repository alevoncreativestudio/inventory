"use client";

import { Customer } from "@prisma/client";
import { CustomerFormDialog } from "./customer-form";
import { CustomersDeleteDialog } from "./customer-delete-dailog";

import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Clock1,
  Edit2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CustomerPayDialog } from "./customer-pay-dialog";
import { IconCash } from "@tabler/icons-react";
import { CustomerHistoryListDialog } from "./customer-payment-dialog";

export const customersColumns: ColumnDef<Customer>[] = [
  
  {
    accessorKey: "CustomerID",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      const renderIcon = () => {
        if (!sort) return <ArrowUpDown className="size-4" />;
        if (sort === "asc") return <ArrowUp className="size-4" />;
        if (sort === "desc") return <ArrowDown className="size-4" />;
        return null;
      };

      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(sort === "asc")}
        >
          Customer Id
          {renderIcon()}
        </Button>
      );
    },
    cell: ({ row }) => <div className="px-3">{row.getValue("CustomerID") as string}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      const renderIcon = () => {
        if (!sort) return <ArrowUpDown className="size-4" />;
        if (sort === "asc") return <ArrowUp className="size-4" />;
        if (sort === "desc") return <ArrowDown className="size-4" />;
        return null;
      };

      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(sort === "asc")}
        >
          Name
          {renderIcon()}
        </Button>
      );
    },
    cell: ({ row }) => <div className="px-3">{row.getValue("name") as string}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="px-3">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div className="px-3">{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => <div className="px-3">{row.getValue("address")}</div>,
  },
  {
    accessorKey: "openingBalance",
    header: "Opening Bal",
    cell: ({ row }) => <div className="px-3">{row.getValue("openingBalance")}</div>,
  },
  {
    accessorKey: "salesDue",
    header: "Sales Due",
    cell: ({ row }) => <div className="px-3">{row.getValue("salesDue")}</div>,
  },
  {
    accessorKey: "salesReturnDue",
    header: "Sales Return Due",
    cell: ({ row }) => <div className="px-3">{row.getValue("salesReturnDue")}</div>,
  },
  {
    id: "action",
    cell: ({ row }) =>
      row.original && <CustomerDropdownMenu customer={row.original} />,
  },
];

export const CustomerDropdownMenu = ({ customer }: { customer: Customer }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPay,setOpenPay] = useState(false);
  const [openPayment,setOpenPayment] = useState(false);

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpenPay(true)}>
            <IconCash color="blue" className="size-4 mr-2" />
            Pay
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenPayment(true)}>
            <Clock1 className="size-4 mr-2" />
            Payment History
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenEdit(true)}>
            <Edit2 className="size-4 mr-2" />
            Edit Customer
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => setOpenDelete(true)}
          >
            <Trash2 className="size-4 mr-2" />
            Delete Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomerFormDialog
        open={openEdit}
        openChange={setOpenEdit}
        customer={customer}
      />

      <CustomerHistoryListDialog
        open={openPayment}
        setOpen={setOpenPayment}
        customerId={customer?.id}
      />

      <CustomerPayDialog 
        customer={customer}
        open={openPay}
        setOpen={setOpenPay}
      />

      <CustomersDeleteDialog
        customer={customer}
        open={openDelete}
        setOpen={setOpenDelete}
      />
    </div>
  );
};

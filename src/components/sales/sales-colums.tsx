"use client";

import { Sale } from "@/types/sales";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit2,
  MoreHorizontal,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SalesDeleteDialog } from "./sales-delete-dailog";
import { useState } from "react";
import { SalesFormSheet } from "./sales-form";
import { SalesDetailsSheet } from "./sales-details-sheet";
import { formatCurrency, formatDate } from "@/lib/utils";

export const salesColumns: ColumnDef<Sale>[] = [
  {
    accessorKey: "invoiceNo",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(sort === "asc")}>
          Ref No {sort === "asc" ? <ArrowUp /> : sort === "desc" ? <ArrowDown /> : <ArrowUpDown />}
        </Button>
      );
    },
  },
  {
    accessorKey: "salesdate",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("salesdate") as string | Date;
      return (
        <div>
          {date ? formatDate(date) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell:({row}) =>{
      const Location = row.original.branch?.name

      return (
        <span>
          {Location}
        </span>
      )
    }
  },
  {
    accessorKey: "customerId",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer.name;
      return <span>{customer}</span>;
    },
  },
    {
    id: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const payments = row.original.payments ?? [];
      const dueDate = payments.find((p) => p.dueDate)?.dueDate;
      const dueAmount = row.original.dueAmount ?? 0;

      // fully paid
      if (dueAmount === 0) {
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-green-100 text-green-800">
            Paid
          </span>
        );
      }

      if (!dueDate) {
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-gray-100 text-gray-800">
            No Due Date
          </span>
        );
      }

      const today = new Date();
      const due = new Date(dueDate);

      if (due < today) {
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-red-100 text-red-800">
            Overdue
          </span>
        );
      }

      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-blue-100 text-blue-800">
          Upcoming Payment
        </span>
      );
    },
  },
  {
    accessorKey: "openingBalance",
    header: "Opening Balance",
    cell: ({ row }) => {
      const customer = row.original.customer.openingBalance;
      return <span>{formatCurrency(customer)}</span>;
    },
  },
  {
    accessorKey: "paidAmount",
    header: "Paid Amount",
    cell: ({ row }) => {
      const amount = row.getValue("paidAmount") as number;
      return <div className="font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "dueAmount",
    header: "Due (Old Balance)",
    cell: ({ row }) => {
      const amount = row.getValue("dueAmount") as number;
      return <div className="font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "grandTotal",
    header: "Grand Total",
    cell: ({ row }) => {
      const amount = row.getValue("grandTotal") as number;
      return <div className="font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SalesActions sale={row.original} />,
  },
];

const SalesActions = ({ sale }: { sale: Sale }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpenView(true)}>
            <Eye className="size-4 mr-2" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenEdit(true)}>
            <Edit2 className="size-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenDelete(true)} className="text-destructive">
            <Trash2 className="size-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SalesFormSheet open={openEdit} openChange={setOpenEdit} sales={sale} />
      <SalesDeleteDialog sale={sale} open={openDelete} setOpen={setOpenDelete} />
      <SalesDetailsSheet sale={sale} open={openView} openChange={setOpenView} />
    </div>
  );
};

"use client";

import { Supplier } from "@prisma/client";
import { SupplierFormDialog } from "./supplier-form";
import { SupplierDeleteDialog } from "./supplier-delete-dailog";
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
import { SupplierPayDialog } from "./supplier-pay-dialog";
import { IconCash } from "@tabler/icons-react";
import { SupplierHistoryListDialog } from "./supplier-payment-dialog";

export const supplierColumns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "SupplierId",
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
          Supplier Id
          {renderIcon()}
        </Button>
      );
    },
    cell: ({ row }) => <div className="px-3">{row.getValue("SupplierId") as string}</div>,
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
    accessorKey: "purchaseDue",
    header: "Purchase Due",
    cell: ({ row }) => <div className="px-3">{row.getValue("purchaseDue")}</div>,
  },
  {
    accessorKey: "purchaseReturnDue",
    header: "Purchase Return Due",
    cell: ({ row }) => <div className="px-3">{row.getValue("purchaseReturnDue")}</div>,
  },
  {
    id: "action",
    cell: ({ row }) =>
      row.original && <SupplierDropdownMenu supplier={row.original} />,
  },
];

export const SupplierDropdownMenu = ({ supplier }: { supplier: Supplier }) => {
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
            Edit Supplier
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => setOpenDelete(true)}
          >
            <Trash2 className="size-4 mr-2" />
            Delete Supplier
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SupplierFormDialog
        open={openEdit}
        openChange={setOpenEdit}
        supplier={supplier}
      />

      <SupplierPayDialog 
        supplier={supplier}
        open={openPay}
        setOpen={setOpenPay}
      />

      <SupplierHistoryListDialog
        open={openPayment}
        setOpen={setOpenPayment}
        supplierId={supplier?.id}
      />

      <SupplierDeleteDialog
        supplier={supplier}
        open={openDelete}
        setOpen={setOpenDelete}
      />
    </div>
  );
};

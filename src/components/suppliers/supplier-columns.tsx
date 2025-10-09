"use client";

import { Supplier } from "@prisma/client";
import { SupplierFormDialog } from "./supplier-form";
import { SupplierDeleteDialog } from "./supplier-delete-dailog";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Clock1,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SupplierPayDialog } from "./supplier-pay-dialog";
import { IconCash } from "@tabler/icons-react";
import { SupplierHistoryListDialog } from "./supplier-payment-dialog";
import { formatCurrency } from "@/lib/utils";

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
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => <div>{row.getValue("address")}</div>,
  },
  {
    accessorKey: "openingBalance",
    header: "Opening Bal",
    cell: ({ row }) => {
          const amount = row.getValue("openingBalance") as number;
          return <div className="font-medium">{formatCurrency(amount)}</div>;
        },
  },
  {
    accessorKey: "purchaseDue",
    header: "Purchase Due",
    cell: ({ row }) => {
          const amount = row.getValue("purchaseDue") as number;
          return <div className="font-medium">{formatCurrency(amount)}</div>;
        }
  },
  {
    accessorKey: "purchaseReturnDue",
    header: "Purchase Return Due",
    cell: ({ row }) => {
          const amount = row.getValue("purchaseReturnDue") as number;
          return <div className="font-medium">{formatCurrency(amount)}</div>;
        },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) =>
      row.original && <SupplierActions supplier={row.original} />,
  },
];

export const SupplierActions = ({ supplier }: { supplier: Supplier }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPay,setOpenPay] = useState(false);
  const [openPayment,setOpenPayment] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpenPay(true)}
        className="h-8 w-8 p-0"
      >
        <IconCash className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpenPayment(true)}
        className="h-8 w-8 p-0"
      >
        <Clock1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpenEdit(true)}
        className="h-8 w-8 p-0"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpenDelete(true)}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

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

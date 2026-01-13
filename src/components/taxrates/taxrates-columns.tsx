"use client";

import { TaxRates } from "@prisma/client";
import { TaxRateFormDialog } from "./taxrates-form";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaxRateDeleteDialog } from "./taxrates-delete-dailog";
import { useState } from "react";

export const taxRatesColumns: ColumnDef<TaxRates>[] = [
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
    cell: ({ row }) => (
      <div className="px-3">{row.getValue("name") as string}</div>
    ),
  },
  {
    accessorKey: "taxRate",
    header: () => <div className="px-3 text-center">Tax rate</div>,
    cell: ({ row }) => (
      <div className="flex justify-center px-3">{row.getValue("taxRate")}%</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="px-3 text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-center px-3">
        <TaxrateActions taxRate={row.original} />
      </div>
    ),
  },
];

export const TaxrateActions = ({ taxRate }: { taxRate: TaxRates }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <div className="flex items-center gap-2">
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
        className="text-destructive hover:text-destructive h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Edit Dialog */}
      <TaxRateFormDialog
        open={openEdit}
        openChange={setOpenEdit}
        tax={taxRate}
      />

      {/* Delete Dialog */}
      <TaxRateDeleteDialog
        taxRate={taxRate}
        open={openDelete}
        setOpen={setOpenDelete}
      />
    </div>
  );
};

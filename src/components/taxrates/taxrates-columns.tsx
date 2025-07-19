"use client";

import { TaxRates } from "@prisma/client";
import { TaxRateFormDialog } from "./taxrates-form";

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
  Edit2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaxRateDeleteDialog } from "./taxrates-delete-dailog"
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
    cell: ({ row }) =>  <div className="px-3">{row.getValue('name') as string}</div>,
  },
  {
    accessorKey:'taxRate',
    header:"Tax Rate"
  },
  {
    id: "action",
    cell: ({ row }) =>
      row.original && <TaxrateDropdeownMenu taxRate={row.original} />,
  },
];

export const TaxrateDropdeownMenu = ({ taxRate }: { taxRate: TaxRates }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

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
          <DropdownMenuItem onSelect={() => setOpenEdit(!openEdit)}>
            <Edit2 className="size-4" />
            Edit Tax Rate
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => setOpenDelete(!openDelete)}
          >
            <Trash2 className="size-4" />
            Delete Tax Rate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <TaxRateFormDialog open={openEdit} openChange={setOpenEdit} tax={taxRate} />

      {/* Dialogs */}
      <TaxRateDeleteDialog
        taxRate={taxRate}
        open={openDelete}
        setOpen={setOpenDelete}
      />
    </div>
  );
};

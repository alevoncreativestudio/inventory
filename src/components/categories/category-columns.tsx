"use client";

import { Category } from "@prisma/client";
import { CategoryFormDialog } from "./category-form";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryDeleteDialog } from "./category-delete-dailog";
import { useState } from "react";

export const categoryColumns: ColumnDef<Category>[] = [
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
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) =>
      row.original && <CategoryActions category={row.original} />,
  },
];

export const CategoryActions = ({ category }: { category: Category }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <div className="flex items-center justify-center gap-2">
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
      <CategoryFormDialog
        open={openEdit}
        openChange={setOpenEdit}
        category={category}
      />

      {/* Delete Dialog */}
      <CategoryDeleteDialog
        category={category}
        open={openDelete}
        setOpen={setOpenDelete}
      />
    </div>
  );
};

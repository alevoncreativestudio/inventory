"use client";

import { Product } from "@/types/product";
import { ProductFormDialog } from "./product-form";

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
  Eye,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductDeleteDialog } from "./products-delete-dailog";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "product_name",
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
    cell: ({ row }) =>  <div className="px-3">{row.getValue('product_name') as string}</div>,
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({row}) => {
      const Brand = row.original.brand.name

       return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium text-blue-500`}>
            {Brand}
        </span>
        );
    }
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({row}) => {
      const Category =  row.original.category.name

      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium text-orange-500`}>
            {Category}
        </span>
        );
    }
  },
  {
    id: "action",
    cell: ({ row }) =>
      row.original && <ProductDropdeownMenu product={row.original} />,
  },
];

export const ProductDropdeownMenu = ({ product }: { product: Product }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const router = useRouter()

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

          <DropdownMenuItem onSelect={() => router.push(`/products/${product.id}`)}>
            <Eye className="size-4" />
            View
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setOpenEdit(!openEdit)}>
            <Edit2 className="size-4" />
            Edit Product
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => setOpenDelete(!openDelete)}
          >
            <Trash2 className="size-4" />
            Delete Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <ProductFormDialog open={openEdit} openChange={setOpenEdit} product={product} />

      {/* Dialogs */}
      <ProductDeleteDialog
        product={product}
        open={openDelete}
        setOpen={setOpenDelete}
      />
    </div>
  );
};

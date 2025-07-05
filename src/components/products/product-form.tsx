"use client";

import { Product } from "@/types/product";
import {
  FormDialog,
  FormDialogContent,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
  FormDialogTrigger,
} from "@/components/common/form-dialog";
import { productSchema } from "@/schemas/product-schema";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogClose } from "../ui/dialog";
import { createProduct, updateProduct } from "@/actions/product-actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getBrandlistForDropdown } from "@/actions/brand-actions";
import { getCategorylistForDropdown } from "@/actions/category-actions";

interface ProductFormProps {
  product?: Product;
  open?: boolean;
  openChange?: (open: boolean) => void;
}

export const ProductFormDialog = ({
  product,
  open,
  openChange,
}: ProductFormProps) => {

  const { execute: createProject, isExecuting: isCreating } = useAction(createProduct);
  const { execute: updateProject, isExecuting: isUpdating } = useAction(updateProduct);

  const [brandList, setBrandList] = useState<{ name: string; id: string }[]>([])
  const [categoryList, setCategoryList] = useState<{ name: string; id: string }[]>([])



  useEffect(() => {
    const fetchOptions = async () => {
    const brandRes = await getBrandlistForDropdown()
    const categoryRes = await getCategorylistForDropdown()
    setBrandList(brandRes)
    setCategoryList(categoryRes)
  };
  fetchOptions();
  },[])
  

  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_name: product?.product_name || "",
      price: product?.price ?? undefined,
      quantity: product?.quantity ?? undefined,
      brandId: product?.brandId || "",
      categoryId: product?.categoryId || "",
    },
  });

  const handleSubmit = async (
    data: z.infer<typeof productSchema>,
    close: () => void,
  ) => {
    if (product) {
      await updateProject({ id: product.id, ...data });
      toast.success("Product updated successfully");
    } else {
      await createProject(data);
      toast.success("Product created successfully");
    }
    close();
  };

  return (
    <FormDialog open={open} openChange={openChange} form={form} onSubmit={handleSubmit}>
      <FormDialogTrigger asChild>
        <Button>
          <Plus className="size-4 mr-2" />
          New Product
        </Button>
      </FormDialogTrigger>

      <FormDialogContent className="sm:max-w-sm">
        <FormDialogHeader>
          <FormDialogTitle>{product ? "Edit Product" : "New Product"}</FormDialogTitle>
          <FormDialogDescription>
            Fill out the product details. Click save when youre done.
          </FormDialogDescription>
        </FormDialogHeader>

        {/* Product Name */}
        <FormField
          control={form.control}
          name="product_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Product Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                type="number"
                {...field}
                value={field.value ?? ""}
                placeholder="price"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quantity */}
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                type="number"
                {...field}
                value={field.value ?? ""}
                placeholder="qty"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Brand Dropdown */}
        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brandList.map((brand) => (
                    <SelectItem key={brand?.id} value={brand?.id}>
                      {brand?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoryList.map((category) => (
                    <SelectItem key={category?.id} value={category?.id}>
                      {category?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormDialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isCreating || isUpdating}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? "Saving..." : "Save"}
          </Button>
        </FormDialogFooter>
      </FormDialogContent>
    </FormDialog>
  );
};

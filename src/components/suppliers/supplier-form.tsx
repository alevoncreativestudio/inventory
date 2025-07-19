'use client';

import {
  FormDialog,
  FormDialogContent,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
  FormDialogTrigger,
} from "@/components/common/form-dialog";
import { supplierSchema } from "@/schemas/supplier-schema";
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
import { DialogClose } from "@/components/ui/dialog";
import { createSupplier, updateSupplier } from "@/actions/supplier-action";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { SupplierFormProps } from "@/types/supplier";
import { Textarea } from "../ui/textarea";

export const SupplierFormDialog = ({ supplier, open, openChange }: SupplierFormProps) => {
  const { execute: createSupplierAction, isExecuting: isCreating } = useAction(createSupplier);
  const { execute: updateSupplierAction, isExecuting: isUpdating } = useAction(updateSupplier);

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      SupplierId:supplier?.SupplierId || "",
      name: supplier?.name || "",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      address:supplier?.address || ""
    },
  });

  const handleSubmit = async (
    data: z.infer<typeof supplierSchema>,
    close: () => void
  ) => {
    if (supplier) {
      await updateSupplierAction({ id: supplier.id, ...data });
      toast.success("Supplier updated successfully");
    } else {
      await createSupplierAction(data);
      toast.success("Supplier created successfully");
    }
    close();
  };

  return (
    <FormDialog open={open} openChange={openChange} form={form} onSubmit={handleSubmit}>
      <FormDialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New Supplier
        </Button>
      </FormDialogTrigger>

      <FormDialogContent className="sm:max-w-sm">
        <FormDialogHeader>
          <FormDialogTitle>
            {supplier ? "Edit Supplier" : "New Supplier"}
          </FormDialogTitle>
          <FormDialogDescription>
            Fill out the supplier details. Click save when you done.
          </FormDialogDescription>
        </FormDialogHeader>

        <FormField
          control={form.control}
          name="SupplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer ID</FormLabel>
              <FormControl>
                <Input placeholder="S0001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Supplier Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Textarea placeholder="Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormDialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isCreating || isUpdating}>
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

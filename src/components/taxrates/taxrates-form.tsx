'use client';
import { FormDialog, FormDialogContent, FormDialogDescription, FormDialogFooter, FormDialogHeader, FormDialogTitle, FormDialogTrigger } from "@/components/common/form-dialog";
import { taxrateSchema } from "@/schemas/taxrates-schema";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogClose } from "../ui/dialog";
import { createTaxRate, updateTaxRate } from "@/actions/taxrate-actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { TaxRateFormProps } from "@/types/taxrates";


export const TaxRateFormDialog = ({ tax, open, openChange }: TaxRateFormProps) => {

  const { execute: createProject, isExecuting: isCreating } = useAction(createTaxRate);
  const { execute: updateProject, isExecuting: isUpdating } = useAction(updateTaxRate);

  const form = useForm<z.infer<typeof taxrateSchema>>({
    resolver: zodResolver(taxrateSchema),
    defaultValues: {
      name: tax?.name || "",
      taxRate: tax?.taxRate || undefined,
    },
  });

  const handleSubmit = async (
    data: z.infer<typeof taxrateSchema>,
    close: () => void,
  ) => {
    if (tax) {
      await updateProject({ id: tax.id, ...data });
      toast.success("Tax Rate updated successfully");
    } else {
      await createProject(data);
      toast.success("Tax Rate created successfully");
    }
    close();
  };

  return (
    <FormDialog
      open={open}
      openChange={openChange}
      form={form}
      onSubmit={handleSubmit}
    >
      <FormDialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New Tax Rate
        </Button>
      </FormDialogTrigger>

      <FormDialogContent className="sm:max-w-sm">
        <FormDialogHeader>
          <FormDialogTitle>
            {tax ? "Edit Tax Rate" : "New Tax Rate"}
          </FormDialogTitle>
          <FormDialogDescription>
            Fill out the Tax Rate details. Click save when you&apos;re done.
          </FormDialogDescription>
        </FormDialogHeader>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Name</FormLabel>
              <FormControl>
                <Input placeholder="Tax Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Rate Name</FormLabel>
              <FormControl>
                <Input placeholder="Tax Rate" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
              <FormDescription>Enter as percentage (e.g., 18 for 18% GST)</FormDescription>
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

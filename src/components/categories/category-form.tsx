'use client';
import { FormDialog, FormDialogContent, FormDialogDescription, FormDialogFooter, FormDialogHeader, FormDialogTitle, FormDialogTrigger } from "@/components/common/form-dialog";
import { categorySchema } from "@/schemas/category-schema";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogClose } from "../ui/dialog";
import { createCategory, updateCategory } from "@/actions/category-actions";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { CategoryFormProps } from "@/types/category";



export const CategoryFormDialog = ({ category, open, openChange }: CategoryFormProps) => {

    const { execute: createProject, isExecuting: isCreating } = useAction(createCategory);
    const { execute: updateProject, isExecuting: isUpdating } = useAction(updateCategory);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
    },
  });

  const handleSubmit = async (
    data: z.infer<typeof categorySchema>,
    close: () => void,
  ) => {
    if (category) {
      await updateProject({ id: category.id, ...data });
      toast.success("Category updated successfully");
    } else {
      await createProject(data);
      toast.success("Category created successfully");
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
          New Category
        </Button>
      </FormDialogTrigger>

      <FormDialogContent className="sm:max-w-sm">
        <FormDialogHeader>
          <FormDialogTitle>
            {category ? "Edit Category" : "New Category"}
          </FormDialogTitle>
          <FormDialogDescription>
            Fill out the category details. Click save when you&apos;re done.
          </FormDialogDescription>
        </FormDialogHeader>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Category Name" {...field} />
              </FormControl>
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

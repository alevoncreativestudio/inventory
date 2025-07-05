"use client";

import {
  FormDialog,
  FormDialogContent,
  FormDialogDescription,
  FormDialogFooter,
  FormDialogHeader,
  FormDialogTitle,
  FormDialogTrigger,
} from "@/components/common/form-dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus ,Calendar1} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import z from "zod";
import { purchaseSchema,paymentStatusEnum,purchaseStatusEnum } from "@/schemas/purchase-schema";
import { createPurchase, updatePurchase } from "@/actions/purchase-actions";
import { useAction } from "next-safe-action/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PurchaseFormProps } from "@/types/purchase";



export const PurchaseFormDialog = ({ purchase, open, openChange }: PurchaseFormProps) => {

  const purchaseStatusOptions = purchaseStatusEnum.options; 
  const paymentStatusOptions = paymentStatusEnum.options;

  const { execute: create, isExecuting: isCreating } = useAction(createPurchase);
  const { execute: update, isExecuting: isUpdating } = useAction(updatePurchase);

  const form = useForm<z.infer<typeof purchaseSchema>>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      referenceNo: purchase?.referenceNo || "",
      location: purchase?.location || "",
      supplier: purchase?.supplier || "",
      purchaseStatus: purchase?.purchaseStatus ?? undefined,
      paymentStatus: purchase?.paymentStatus ?? undefined,
      grandTotal: purchase?.grandTotal ?? undefined,
      paymentDue: purchase?.paymentDue ?? undefined,
      date: purchase?.date ? new Date(purchase.date) : undefined,
    },
  });

  const handleSubmit = async (data: z.infer<typeof purchaseSchema>, close: () => void) => {
    if (purchase) {
      await update({ id: purchase.id, ...data });
      toast.success("Purchase updated successfully");
    } else {
      await create(data);
      toast.success("Purchase created successfully");
    }
    close();
  };

  return (
    <FormDialog open={open} openChange={openChange} form={form} onSubmit={handleSubmit}>
      <FormDialogTrigger asChild>
        <Button>
          <Plus className="size-4 mr-2" />
          New Purchase
        </Button>
      </FormDialogTrigger>

      <FormDialogContent className="sm:max-w-2xl">
        <FormDialogHeader>
            <FormDialogTitle>{purchase ? "Edit Purchase" : "New Purchase"}</FormDialogTitle>
            <FormDialogDescription>
            Fill out the purchase details. Click save when done.
            </FormDialogDescription>
        </FormDialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField name="referenceNo" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Reference No</FormLabel>
                <FormControl><Input placeholder="PO2024/001" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />

            <FormField name="location" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl><Input placeholder="Location" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />

            <FormField name="supplier" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl><Input placeholder="Jackson Hill" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />

            <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
                <FormLabel>Date</FormLabel>
                <Popover>
                <PopoverTrigger asChild>
                    <FormControl>
                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? new Date(field.value).toLocaleDateString() : <Calendar1 className="text-left"/>}
                    </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent>
                    <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                    captionLayout="dropdown"
                    />
                </PopoverContent>
                </Popover>
                <FormMessage />
            </FormItem>
            )} />

            <FormField name="purchaseStatus" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Purchase Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                    {purchaseStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )} />

            <FormField name="paymentStatus" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                <SelectContent>
                    {paymentStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )} />

            <FormField name="grandTotal" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Grand Total</FormLabel>
                <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />

            <FormField name="paymentDue" control={form.control} render={({ field }) => (
            <FormItem>
                <FormLabel>Payment Due</FormLabel>
                <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />

            
        </div>

        <FormDialogFooter className="pt-6">
            <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isCreating || isUpdating}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? "Saving..." : "Save"}
            </Button>
        </FormDialogFooter>
        </FormDialogContent>

    </FormDialog>
  );
};

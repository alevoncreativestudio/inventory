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
import { customerSchema } from "@/schemas/customer-schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { DialogClose } from "@/components/ui/dialog";
import { createCustomer, updateCustomer } from "@/actions/customer-action";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { CustomerFormProps } from "@/types/customer";
import { useEffect, useState } from "react";
import { getAllBranches } from "@/actions/auth";

export const CustomerFormDialog = ({ customer, open, openChange }: CustomerFormProps) => {
  const [baranchList, setBranchList] = useState<{ name: string; id: string;}[]>([]);
  const { execute: createCustomerAction, isExecuting: isCreating } = useAction(createCustomer);
  const { execute: updateCustomerAction, isExecuting: isUpdating } = useAction(updateCustomer);

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      CustomerID:customer?.CustomerID || "",
      name: customer?.name || "",
      branchId:customer?.branchId || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address:customer?.address || "",
    },
  });

  const handleSubmit = async (
    data: z.infer<typeof customerSchema>,
    close: () => void
  ) => {
    if (customer) {
      await updateCustomerAction({ id: customer.id, ...data });
      toast.success("Customer updated successfully");
    } else {
      await createCustomerAction(data);
      toast.success("Customer created successfully");
    }
    close();
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const branches = await getAllBranches()
      setBranchList(branches);
    }
    fetchOptions()
  },[])

  return (
    <FormDialog open={open} openChange={openChange} form={form} onSubmit={handleSubmit}>
      <FormDialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          New Customer
        </Button>
      </FormDialogTrigger>

      <FormDialogContent className="sm:max-w-sm">
        <FormDialogHeader>
          <FormDialogTitle>
            {customer ? "Edit Customer" : "New Customer"}
          </FormDialogTitle>
          <FormDialogDescription>
            Fill out the customer details. Click save when you done.
          </FormDialogDescription>
        </FormDialogHeader>

        <FormField
          control={form.control}
          name="CustomerID"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer ID</FormLabel>
              <FormControl>
                <Input placeholder="C0001" {...field} />
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
                <Input placeholder="Customer Name" {...field} />
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
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField control={form.control} name="branchId" render={({ field }) => (
          <FormItem>
            <FormLabel>Business Location</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Branch" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {baranchList.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

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

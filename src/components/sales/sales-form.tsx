"use client";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar1, Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useEffect, useState } from "react";

import { createSale, updateSale } from "@/actions/sales-action";
import { useAction } from "next-safe-action/hooks";
import { SaleFormProps } from "@/types/sales";
import { getCustomerListForDropdown } from "@/actions/customer-action";
import { Card } from "../ui/card";
import { ProductOption } from "@/types/product";
import { PurchaseItemField } from "@/types/purchase";
import { fullSalesSchema } from "@/schemas/sales-item-schema";
import { getProductListForDropdown } from "@/actions/product-actions";
import { Command,CommandGroup, CommandItem,CommandInput,CommandEmpty,CommandList } from "../ui/command";
import { nanoid } from "nanoid";

export const SalesFormSheet = ({ sales, open, openChange }: SaleFormProps) => {
  const isControlled = typeof open === "boolean";
  const { execute: create, isExecuting: isCreating } = useAction(createSale);
  const { execute: update, isExecuting: isUpdating } = useAction(updateSale);
  const [customerList, setCustomerList] = useState<{ id: string; name: string,openingBalance:number }[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedCustomerOpeningBalance, setSelectedCustomerOpeningBalance] = useState<number | null>(null);

  const form = useForm<z.infer<typeof fullSalesSchema>>({
    resolver: zodResolver(fullSalesSchema),
    defaultValues: {
    invoiceNo: sales?.invoiceNo || "",
    customerId: sales?.customerId || "",
    grandTotal: sales?.grandTotal ?? 0,
    dueAmount: sales?.dueAmount ?? 0,
    salesdate: sales?.salesdate ? new Date(sales.salesdate) : undefined,
    items: sales?.items || [],
    salesPayment: sales?.payments || [],
  }
  });

  const itemFieldKeys: PurchaseItemField[] = [
    "quantity",
    "excTax",
    "discount",
    "incTax",
    "subtotal",
    "total",
    ];

  const itemFieldKeysWithoutQuantity = itemFieldKeys.filter((key) => key !== "quantity");

  const year = new Date().getFullYear();
  
  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "items",
  });


  useEffect(() => {
    const fetchCustomers = async () => {
      const result = await getCustomerListForDropdown();
      setCustomerList(result);
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!sales) {
      form.setValue("invoiceNo", `INV-${year}-${nanoid(4).toUpperCase()}`);
    }
  }, [form, sales,year]);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (productSearch.length > 1) {
        const res = await getProductListForDropdown({ query: productSearch });
        setProductOptions(res?.data?.products || []);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [productSearch]);


 const handleSubmit = async (data: z.infer<typeof fullSalesSchema>) => {
  const grandTotal = data.items.reduce((sum, item) => sum + (item.total || 0), 0);
  const paidAmount = data.salesPayment.reduce((sum, p) => sum + (p.amount || 0), 0);
  const dueAmount = grandTotal - paidAmount;

  form.setValue("grandTotal", grandTotal);
  form.setValue("dueAmount", dueAmount);

  const payload = {
    ...data,
    grandTotal,
    dueAmount,
  };

  if (sales) {
    await update({ id: sales.id, ...payload });
    toast.success("Sale updated successfully");
  } else {
    await create(payload);
    toast.success("Sale created successfully");
  }

  if (isControlled && openChange) openChange(false);
};

console.log(customerList);


  return (
    <Sheet open={open} onOpenChange={openChange}>
      {!isControlled && (
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2" />
            New Sale
          </Button>
        </SheetTrigger>
      )}

      <SheetContent side="top" className="max-h-screen overflow-y-auto p-6">
        <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">        
        <SheetHeader className="mb-6">
          <SheetTitle>{sales ? "Edit Sale" : "New Sale"}</SheetTitle>
        </SheetHeader>
            <Card className="grid md:grid-cols-2 gap-4 p-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Customer</FormLabel>
                    <Popover open={showCustomerSuggestions} onOpenChange={setShowCustomerSuggestions}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {customerList.find((c) => c.id === field.value)?.name || "Select customer..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search customer..."/>
                          <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                              {customerList.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.name}
                                  onSelect={() => {
                                    field.onChange(customer.id)
                                    setSelectedCustomerOpeningBalance(customer.openingBalance)
                                    setShowCustomerSuggestions(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      customer.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {customer.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice No</FormLabel>
                    <FormControl>
                      <Input placeholder="PO2024/001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="salesdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full text-left", !field.value && "text-muted-foreground")}>{field.value ? new Date(field.value).toLocaleDateString() : <Calendar1 className="h-4 w-4" />}</Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown" />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Sales Table */}
            <Card className="p-4 space-y-4">
              <FormItem className="relative max-w-sm">

                <FormLabel className="mb-1">Add Product</FormLabel>
                  <Popover open={productOptions.length > 0} onOpenChange={(open) => !open && setProductOptions([])}>
                    <PopoverTrigger asChild>
                      <div>
                      <Input
                        placeholder="Search product…"
                        className="pl-9"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                      <Search className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" />
                    </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search product..."
                          value={productSearch}
                          onValueChange={(val) => setProductSearch(val)}
                        />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {productOptions.map((p) => (
                              <CommandItem
                                key={p.id}
                                value={p.product_name}
                                onSelect={() => {
                                  append({
                                    productId: p.id,
                                    quantity: 1,
                                    product_name: p.product_name,
                                    stock:p.stock,
                                    discount: 0,
                                    excTax: p.excTax,
                                    incTax: p.incTax,
                                    subtotal: p.excTax,
                                    total: p.excTax + p.incTax,
                                  });
                                  setProductSearch("");
                                  setProductOptions([]);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    false
                                  )}
                                />
                                {p.product_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Available Stock</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Price(Inc Tax)</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Total Amount</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {fields.map((f, idx) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.product_name || "—"}</TableCell>
                      <TableCell>{f.stock}</TableCell>

                      <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${idx}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      value={field.value ?? ""}
                                      onBlur={() => {
                                        const qty = Number(form.getValues(`items.${idx}.quantity`));
                                        const discount = Number(form.getValues(`items.${idx}.discount`));
                                        const tax = Number(form.getValues(`items.${idx}.incTax`));

                                        const subtotal = qty * tax;
                                        const total = subtotal - discount;

                                        form.setValue(`items.${idx}.subtotal`, subtotal);
                                        form.setValue(`items.${idx}.total`, total);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                      
                      {itemFieldKeysWithoutQuantity.map((key) => (
                          <TableCell key={key}>
                            <FormField
                              control={form.control}
                              name={`items.${idx}.${key}`}
                              render={({ field }) => (
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    value={field.value ?? ""}
                                    onBlur={() => {
                                      const qty = Number(form.getValues(`items.${idx}.quantity`));
                                      const discount = Number(form.getValues(`items.${idx}.discount`));
                                      const tax = Number(form.getValues(`items.${idx}.incTax`));

                                      const subtotal = qty * tax;
                                      const total = subtotal - discount;

                                      form.setValue(`items.${idx}.subtotal`, subtotal);
                                      form.setValue(`items.${idx}.total`, total);
                                    }}
                                  />
                                </FormControl>
                              )}
                            />
                          </TableCell>
                        ))}

                      <TableCell>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => remove(idx)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Grand Total */}
              <div className="flex justify-end pr-4">
                <div className="text-right space-y-1">
                  <div className="text-muted-foreground text-sm">Grand Total:</div>
                  <div className="text-xl font-semibold">
                    ₹{" "}
                    {form
                      .watch("items")
                      .reduce((sum, item) => sum + (Number(item.total) || 0), 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
            <Card className="p-4 space-y-4">
              <h3 className="text-lg font-semibold">Add Payment</h3>
                {selectedCustomerOpeningBalance !== null && (
                <div className="text-sm text-muted-foreground mt-1">
                  Opening Balance: ₹ {selectedCustomerOpeningBalance.toFixed(2)}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salesPayment.0.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salesPayment.0.paidOn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid On</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full text-left">
                              {field.value
                                ? new Date(field.value).toLocaleDateString()
                                : "Pick date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={new Date(field.value)}
                            onSelect={field.onChange}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salesPayment.0.paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["cash", "card", "bank"].map((method) => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salesPayment.0.paymentNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Note</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pr-4">
                <div className="text-right space-y-1">
                  <div className="text-muted-foreground text-sm">Due Amount:</div>
                  <div className="text-xl font-semibold">
                    ₹{(
                      form.watch("items").reduce((sum, item) => sum + (Number(item.total) || 0), 0) -
                      form.watch("salesPayment").reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>


            <SheetFooter>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? "Saving..." : "Save"}
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
};

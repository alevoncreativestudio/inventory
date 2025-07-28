'use client';

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm, FormProvider, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { fullPurchaseSchema } from "@/schemas/purchase-item-schema";
import { createPurchase, updatePurchase } from "@/actions/purchase-actions";
import { getSupplierListForDropdown } from "@/actions/supplier-action";
import { getProductListForDropdown } from "@/actions/product-actions";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card } from "../ui/card";
import { purchaseStatusEnum } from "@/schemas/purchase-schema";
import { PurchaseFormProps } from "@/types/purchase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { PurchaseItemField } from "@/types/purchase";
import { z } from "zod";
import { ProductOption } from "@/types/product";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { nanoid } from "nanoid";
import { getAllBranches } from "@/actions/auth";
import { getTaxRateListForDropdown } from "@/actions/taxrate-actions";


export const PurchaseFormSheet = ({
  purchase,
  open,
  openChange,
}: PurchaseFormProps) => {
  const purchaseStatusOption = purchaseStatusEnum.options;
  const isControlled = typeof open === "boolean";
  const { execute: create, isExecuting: isCreating } = useAction(createPurchase);
  const { execute: update, isExecuting: isUpdating } = useAction(updatePurchase);
  const [productSearch, setProductSearch] = useState("");
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [supplierList, setSupplierList] = useState<{ name: string; id: string,openingBalance:number }[]>([]);
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [selectedSupplierOpeningBalance, setSelectedSupplierOpeningBalance] = useState<number | null>(null);
  const [baranchList, setBranchList] = useState<{ name: string; id: string;}[]>([]);
  const [taxRateList, setTaxRateList] = useState<{ name: string; taxRate: string; id: string }[]>([]);
  
  const itemFieldKeys: PurchaseItemField[] = [
    "quantity",
    "excTax",
    "tax",
    "discount",
    "incTax",
    "margin",
    "subtotal",
    "total",
    "sellingPrice",
  ];

  const itemFieldKeysWithoutTax = itemFieldKeys.filter((key) => key !== "tax");


  useEffect(() => {
    const fetchOptions = async () => {
      const res = await getSupplierListForDropdown();
      const branches = await getAllBranches()
      const taxRateRes = await getTaxRateListForDropdown();
      setSupplierList(res);
      setBranchList(branches);
      setTaxRateList(taxRateRes);

    };
    fetchOptions();
  }, []);

  const form = useForm<z.infer<typeof fullPurchaseSchema>>({
    resolver: zodResolver(fullPurchaseSchema),
    defaultValues: {
      supplierId: purchase?.supplierId || "",
      referenceNo: purchase?.referenceNo || "",
      branchId: purchase?.branchId || "",
      purchaseDate: purchase?.purchaseDate ? new Date(purchase.purchaseDate) : new Date(),
      status: purchase?.status ?? purchaseStatusOption[0],
      totalAmount: purchase?.totalAmount || 0,
      dueAmount:purchase?.dueAmount || 0,
      paidAmount:purchase?.paidAmount || 0,
      items: purchase?.items || [],
      payments: purchase?.payments || []
    },
  });

  useEffect(() => {
  if (!purchase) {
    form.setValue("referenceNo", `REF-${nanoid(4).toUpperCase()}`);
  }
}, [form, purchase]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

const excTax = useWatch({ control: form.control, name: "items.0.excTax" });
const incTax = useWatch({ control: form.control, name: "items.0.incTax" });
const taxRate = useWatch({ control: form.control, name: "items.0.tax" });
const margin = useWatch({ control: form.control, name: "items.0.margin" });
const sellingPriceTaxType = useWatch({ control: form.control, name: "items.0.sellingPrice" });

useEffect(() => {
  const exc = Number(excTax) || 0;
  const inc = Number(incTax) || 0;
  const tax = Number(taxRate) || 0;
  const mgn = Number(margin) || 0;

  const newInc = exc + (exc * (tax * 100)) / 100;
  if (!isNaN(newInc)) form.setValue("items.0.incTax", parseFloat(newInc.toFixed(2)));

  const selling = inc + (inc * mgn) / 100;

  if (!isNaN(selling)) form.setValue("items.0.sellingPrice", parseFloat(selling.toFixed(2)));
}, [excTax, incTax, taxRate, margin, sellingPriceTaxType, form]);


  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (productSearch.length > 1) {
        const res = await getProductListForDropdown({ query: productSearch });
        setProductOptions(res?.data?.products || []);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [productSearch]);


  const handleSubmit = async (data: z.infer<typeof fullPurchaseSchema>) => {
    
    const totalAmount = data.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const paidAmount = data.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const dueAmount = totalAmount - paidAmount

    form.setValue("totalAmount", totalAmount);
    form.setValue("paidAmount",paidAmount)
    form.setValue("dueAmount",dueAmount);

    const payload = {
      ...data,
      totalAmount,
      paidAmount,
      dueAmount
    };

    if (purchase) {
      await update({ id: purchase.id, ...payload });
      toast.success("Purchase updated successfully");
    } else {
      await create(payload);
      toast.success("Purchase created successfully");
    }

    if (isControlled && openChange) openChange(false);
  };


  return (
    <Sheet open={open} onOpenChange={openChange}>
      {!isControlled && (
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2" />
            New Purchase
          </Button>
        </SheetTrigger>
      )}
      <SheetContent side="top" className="max-h-screen overflow-y-auto p-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <SheetHeader>
              <SheetTitle>{purchase ? "Edit Purchase" : "New Purchase"}</SheetTitle>
            </SheetHeader>

            <Card className="grid md:grid-cols-2 gap-4 p-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Supplier</FormLabel>
                    <Popover open={showSupplierSuggestions} onOpenChange={setShowSupplierSuggestions}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {supplierList.find((s) => s.id === field.value)?.name || "Select supplier..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search supplier..." />
                          <CommandList>
                            <CommandEmpty>No supplier found.</CommandEmpty>
                            <CommandGroup>
                              {supplierList.map((supplier) => (
                                <CommandItem
                                  key={supplier.id}
                                  value={supplier.name}
                                  onSelect={() => {
                                    field.onChange(supplier.id);
                                    setSelectedSupplierOpeningBalance(supplier.openingBalance);
                                    setShowSupplierSuggestions(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      supplier.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {supplier.name}
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

              <FormField
                control={form.control}
                name="referenceNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference No</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {purchaseStatusOption.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Card className="p-4 space-y-4">
              <FormItem className="relative max-w-sm">
                <FormLabel className="mb-1">Add Product</FormLabel>
                <Popover open={productOptions.length > 0} onOpenChange={() => setProductOptions([])}>
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
                    <Command shouldFilter={false}>
                      <CommandInput 
                      placeholder="Search product..." 
                      value={productSearch} 
                      onValueChange={setProductSearch} 
                      />

                      <CommandList>
                        <CommandEmpty>No products found.</CommandEmpty>
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
                                  tax:p.tax,
                                  margin:p.margin,
                                  sellingPrice:p.sellingPrice,
                                  subtotal: p.excTax,
                                  total:p.incTax,
                                });
                                setProductSearch("");
                                setProductOptions([]);
                              }}
                            >
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
                    <TableHead>Product Name</TableHead>
                    <TableHead>Available Stock</TableHead>
                    <TableHead>Available Stock</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Cost(Before Tax)</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Cost (include Tax)</TableHead>
                    <TableHead>Margin(%)</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {fields.map((f, idx) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        {f.product_name || "—"}
                      </TableCell>
                      <TableCell>
                        {f.stock}
                      </TableCell>

                      <TableCell>
                          <FormField control={form.control} name={`items.${idx}.tax`} render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={(value) => {
                                field.onChange(value); 
                                const quantity = Number(form.getValues(`items.${idx}.quantity`));
                                const excTax = Number(form.getValues(`items.${idx}.excTax`));
                                const discount = Number(form.getValues(`items.${idx}.discount`));
                                const margin = Number(form.getValues(`items.${idx}.margin`));

                                const taxRate = Number(value); 

                                const incTax = Math.round(excTax * (1 + taxRate));
                                const subtotal = quantity * excTax;
                                const totalBeforeDiscount = quantity * incTax;
                                const total = totalBeforeDiscount - discount;
                                const sellingPrice = Math.round(incTax * (1 + margin / 100) * 100) / 100;

                                form.setValue(`items.${idx}.incTax`, incTax);
                                form.setValue(`items.${idx}.subtotal`, subtotal);
                                form.setValue(`items.${idx}.total`, total);
                                form.setValue(`items.${idx}.sellingPrice`, sellingPrice);
                              }} 
                              value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full"><SelectValue placeholder="Select Tax Rate" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {taxRateList.map(tax => (
                                    <SelectItem key={tax.id} value={tax.taxRate}>{tax.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </TableCell>

                      {itemFieldKeysWithoutTax.map((key) => (
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
                                      const quantity = Number(form.getValues(`items.${idx}.quantity`));
                                      const excTax = Number(form.getValues(`items.${idx}.excTax`));
                                      const discount = Number(form.getValues(`items.${idx}.discount`));
                                      const incTax = Number(form.getValues(`items.${idx}.incTax`));
                                      const margin = Number(form.getValues(`items.${idx}.margin`));
                                      const sellingPrice = Number(form.getValues(`items.${idx}.sellingPrice`));

                                      const subtotal = quantity * excTax;
                                      const totalBeforeDiscount = quantity * incTax;
                                      const total = totalBeforeDiscount - discount;

                                      form.setValue(`items.${idx}.subtotal`, subtotal);
                                      form.setValue(`items.${idx}.total`, total);

                                      form.setValue(`items.${idx}.sellingPrice`, sellingPrice);
                                      form.setValue(`items.${idx}.margin`, margin);
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
              {selectedSupplierOpeningBalance !== null && (
                <div className="text-sm text-muted-foreground mt-1">
                  Opening Balance: ₹ {selectedSupplierOpeningBalance.toFixed(2)}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payments.0.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Payed</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ""}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payments.0.paidOn"
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full text-left">
                            {field.value
                              ? new Date(field.value).toLocaleDateString()
                              : new Date().toLocaleDateString()}
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
                  name="payments.0.paymentMethod"
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
                          {['cash', 'card', 'bank'].map((method) => (
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
                  name="payments.0.paymentNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Note</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
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
                    ₹{" "}
                    {(
                      form.watch("items").reduce((sum, item) => sum + (Number(item.total) || 0), 0) -
                      form.watch("payments").reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
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

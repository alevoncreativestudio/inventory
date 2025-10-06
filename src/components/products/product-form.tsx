"use client";

import { Product } from "@/types/product";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { productSchema } from "@/schemas/product-schema";
import z from "zod";
import { useForm, FormProvider, useWatch } from "react-hook-form";
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
import { Card } from "@/components/ui/card";
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
import { getTaxRateListForDropdown } from "@/actions/taxrate-actions";
import {Table ,TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { nanoid } from "nanoid";
import { getAllBranches } from "@/actions/auth";

interface ProductFormProps {
  product?: Product;
  open?: boolean;
  openChange?: (open: boolean) => void;
}

export const ProductFormSheet = ({ product, open, openChange }: ProductFormProps) => {
  const isControlled = typeof open !== "undefined" && typeof openChange === "function";

  const { execute: createProject, isExecuting: isCreating } = useAction(createProduct);
  const { execute: updateProject, isExecuting: isUpdating } = useAction(updateProduct);

  const [brandList, setBrandList] = useState<{ name: string; id: string }[]>([]);
  const [categoryList, setCategoryList] = useState<{ name: string; id: string }[]>([]);
  const [taxRateList, setTaxRateList] = useState<{ name: string; taxRate: string; id: string }[]>([]);
  const [baranchList, setBranchList] = useState<{ name: string; id: string;}[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const brandRes = await getBrandlistForDropdown();
      const categoryRes = await getCategorylistForDropdown();
      const taxRateRes = await getTaxRateListForDropdown();
      const branches = await getAllBranches()
      setBrandList(brandRes);
      setCategoryList(categoryRes);
      setTaxRateList(taxRateRes);
      setBranchList(branches);
    };
    fetchOptions();
  }, []);

  console.log(baranchList);
  

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_name: product?.product_name || "",
      sku: product?.sku || "",
      branchId: product?.branchId || "",
      unit: product?.unit || "",
      stock:product?.stock ?? 0,
      brandId: product?.brandId || "",
      categoryId: product?.categoryId || "",
      tax: product?.tax ?? "",
      sellingPriceTaxType:product?.sellingPriceTaxType || "",
      excTax: product?.excTax ?? undefined,
      incTax: product?.incTax ?? undefined,
      margin: product?.margin ?? 25,
      sellingPrice: product?.sellingPrice ?? undefined,
    },
  });

  useEffect(() => {
  if (!product) {
    form.setValue("sku", `SKU-${nanoid(6).toUpperCase()}`);
  }
}, [form, product]);


const excTax = useWatch({ control: form.control, name: "excTax" });
const incTax = useWatch({ control: form.control, name: "incTax" });
const taxRate = useWatch({ control: form.control, name: "tax" });
const margin = useWatch({ control: form.control, name: "margin" });
const sellingPriceTaxType = useWatch({ control: form.control, name: "sellingPriceTaxType" });

useEffect(() => {
  const exc = Number(excTax) || 0;
  const inc = Number(incTax) || 0;
  const tax = Number(taxRate) || 0;
  const mgn = Number(margin) || 0;
  const type = sellingPriceTaxType;

  const newInc = exc + (exc * (tax * 100)) / 100;
  if (!isNaN(newInc)) form.setValue("incTax", parseFloat(newInc.toFixed(2)));

  const base = type === "inclusive" ? inc : exc;
  const selling = base + (base * mgn) / 100;

  if (!isNaN(selling)) form.setValue("sellingPrice", parseFloat(selling.toFixed(2)));
}, [excTax, incTax, taxRate, margin, sellingPriceTaxType, form]);


  const handleSubmit = async (data: z.infer<typeof productSchema>) => {
    console.log("Form data submitted:", data);
    
    if (product) {
      await updateProject({ id: product.id, ...data });
      toast.success("Product updated successfully");
    } else {
      await createProject(data);
      toast.success("Product created successfully");
    }
    if (isControlled && openChange) openChange(false);
  };

  return (
    <Sheet open={isControlled ? open : undefined} onOpenChange={isControlled ? openChange : undefined}>
      {!isControlled && (
        <SheetTrigger asChild>
          <Button>
            <Plus className="size-4 mr-2" />
            New Product
          </Button>
        </SheetTrigger>
      )}

      <SheetContent side="top" className="w-full overflow-y-scroll max-h-screen p-5">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <SheetHeader>
                <SheetTitle>{product ? "Edit Product" : "New Product"}</SheetTitle>
                <SheetDescription>Fill out the product details. Click save when done.</SheetDescription>
              </SheetHeader>

              <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="product_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl><Input placeholder="Product Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

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

                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select Unit" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                        <SelectItem value="pkt">Packets (pkts)</SelectItem>
                        <SelectItem value="box">Boxes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="brandId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select Brand" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brandList.map(brand => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryList.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} /> 
              </Card>

              <Card className="p-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="tax" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicable Tax</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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

                  <FormField control={form.control} name="sellingPriceTaxType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price Tax Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Select Type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="exclusive">Exclusive</SelectItem>
                          <SelectItem value="inclusive">Inclusive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Table className="border">
                  <TableHeader>
                    <TableRow className="bg-green-600 hover:bg-green-600 text-white">
                      <TableHead className="text-white" colSpan={2}>Default Purchase Price</TableHead>
                      <TableHead className="text-white">x Margin(%)</TableHead>
                      <TableHead className="text-white">Default Selling Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {/* Exc. Tax */}
                      <TableCell>
                      <FormLabel>Exc.Tax</FormLabel>
                        <FormField control={form.control} name="excTax" render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input type="number" placeholder="Exc. tax" 
                              {...field} 
                              value={field.value ?? ""}/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TableCell>

                      <TableCell>
                        <FormLabel>Inc.Tax</FormLabel>
                        <FormField control={form.control} name="incTax" render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input type="number" placeholder="Inc. tax" 
                              {...field} 
                              value={field.value ?? ""}/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TableCell>

                      {/* Margin (%) */}
                      <TableCell>
                        <FormField control={form.control} name="margin" render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input type="number" placeholder="Margin (%)" 
                              {...field} 
                              value={field.value ?? ""}/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TableCell>

                      {/* Selling Price */}
                      <TableCell>
                        <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                          <FormItem className="mb-0">
                            <FormControl>
                              <Input type="number" placeholder="Selling Price" 
                              {...field} 
                              value={field.value ?? ""}/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
              <SheetFooter>
              <div className="mt-4 flex justify-end gap-2">
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
              </SheetFooter>
            </form>
          </FormProvider>
      </SheetContent>
    </Sheet>
  );
};

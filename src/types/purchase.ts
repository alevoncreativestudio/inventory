import { 
  Branch,
  Purchase as PrismaPurchase,
  PurchaseItem as PrismaPurchaseItem,
  PurchasePayment} from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export interface PurchaseItem extends PrismaPurchaseItem {
  product?: {
    product_name: string;
  };
}

export interface Purchase extends PrismaPurchase {
  supplier: { name: string };
  items: PurchaseItem[];
  payments:PurchasePayment[];
  branch?:Branch | null;
}

export interface PurchaseFormProps {
  purchase?: Purchase;
  open?: boolean;
  openChange?: (open: boolean) => void;
}

export interface PurchaseTableProps<TValue> {
  columns: ColumnDef<Purchase, TValue>[];
  data: Purchase[];
}

export type PurchaseItemField =
  | "quantity"
  | "excTax"
  | "incTax"
  | "tax"
  | "margin"
  | "sellingPrice"
  | "discount"
  | "subtotal"
  | "total";

export type PaymentField =
  | "amount"
  | "paidOn"
  | "paymentMethod"
  | "paymentAccount"
  | "paymentNote";


export interface PurchaseCount {
  grandTotal?: number;
  paymentDue?: number;
  paymentStatus?: string;
}

export type RawPurchaseItem = {
  productId: string;
  product_name?: string;
  quantity: number;
  excTax: number;
  incTax:number;
  tax:string;
  margin:number;
  sellingPrice:number;
  discount: number;
  subtotal: number;
  total: number;
};

export interface RawPurchasePayment {
  amount: number;
  paidOn: Date;
  paymentMethod: string;
  paymentNote?: string | null;
}


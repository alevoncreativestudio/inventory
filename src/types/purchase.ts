import { Purchase } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

export interface PurchaseFormProps {
  purchase?: Purchase;
  open?: boolean;
  openChange?: (open: boolean) => void;
}

export interface PurchaseTableProps<TValue> {
  columns: ColumnDef<Purchase, TValue>[];
  data: Purchase[];
}
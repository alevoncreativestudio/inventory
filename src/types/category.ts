import { CustomerInput } from "@/schemas/customer-schema";
import { Category } from "@prisma/client";
import { ReactNode } from "react";

export type CategoryModalProps = {
  isEdit?: boolean;
  initialData?: CustomerInput & { id: string };
  triggerLabel?: ReactNode;
};

export interface CategoryFormProps {
  category?: Category;
  open?: boolean;
  openChange?: (open: boolean) => void;
}
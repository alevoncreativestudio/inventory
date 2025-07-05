import { CategoryInput } from "@/schemas/category-schema";
import { Category } from "@prisma/client";
import { ReactNode } from "react";

export type CategoryModalProps = {
  isEdit?: boolean;
  initialData?: CategoryInput & { id: string };
  triggerLabel?: ReactNode;
};

export interface CategoryFormProps {
  category?: Category;
  open?: boolean;
  openChange?: (open: boolean) => void;
}
import { TaxRateInput } from "@/schemas/taxrates-schema";
import { TaxRates } from "@prisma/client";
import { ReactNode } from "react";


export type TaxRateModalProps = {
  isEdit?: boolean;
  initialData?: TaxRateInput & { id: string };
  triggerLabel?: ReactNode;
};

export interface TaxRateFormProps {
  tax?:  TaxRates ;
  open?: boolean;
  openChange?: (open: boolean) => void;
}
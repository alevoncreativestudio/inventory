"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FC } from "react";
import { TaxRates } from "@prisma/client";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { deleteTaxRate } from "@/actions/taxrate-actions";
import { useRouter } from "next/navigation";



export const TaxRateDeleteDialog:FC<{
  taxRate: TaxRates,
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({taxRate, open, setOpen}) => {
    const router = useRouter()
  const handleDelete = async () => {
    try{
        await deleteTaxRate({ id : taxRate.id});
        toast.success(`Tax Rates "${taxRate.name}" deleted.`)
        setOpen(!open)
        router.refresh()
    }catch(error){
        toast.error("Failed to delete Tax Rates.")
        console.log(error,"Error on deleting Tax Rates");
        
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-bold">{taxRate.name}</span> tax rates
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
            variant="destructive"
            onClick={handleDelete}>Delete</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

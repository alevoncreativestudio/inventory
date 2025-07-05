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
import { Category } from "@prisma/client";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { deleteCategory } from "@/actions/category-actions";
import { useRouter } from "next/navigation";



export const CategoryDeleteDialog:FC<{
  category: Category,
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({category, open, setOpen}) => {
    const router = useRouter()
  const handleDelete = async () => {
    try{
        await deleteCategory({ id : category.id});
        toast.success(`Category "${category.name}" deleted.`)
        setOpen(!open)
        router.refresh()
    }catch(error){
        toast.error("Failed to delete category.")
        console.log(error,"Error on deleting categories");
        
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            <span className="font-bold">{category.name}</span> category
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

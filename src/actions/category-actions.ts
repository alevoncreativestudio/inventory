"use server"
import {prisma} from '@/lib/prisma'
import { actionClient } from "@/lib/safeAction";
import { categorySchema, categoryUpdateSchema, getCategoryById } from '@/schemas/category-schema';
import { ObjectId } from "mongodb";
import { revalidatePath } from 'next/cache';

export const createCategory = actionClient.inputSchema(categorySchema)
    .action(async (values) => {
        try{
            const category = await prisma.category.create({
                data : values.parsedInput,
            })
            revalidatePath("/categories ")
            return {data : category}
        }catch(error){
            console.log("Created Category Error :", error)
            return {error: "Something went wrong"}   
        }
    })


export const getCategoryList = actionClient.action(async () => {
    try{
        const category = await prisma.category.findMany({
            orderBy: {name : "desc"}
        })
        revalidatePath("/categories")
        return { data: category}
    }catch(error){
        console.log("Get Category Error :", error)
    }
})



export const getCategorylistForDropdown = async () => {
    return await prisma.category.findMany({
        select : { id: true , name: true}
    })
}


export const updateCategory = actionClient.inputSchema(categoryUpdateSchema).action( async (values) => {
    const {id, ...data} = values.parsedInput;
    try{
        const category = await prisma.category.update({
            where :{id},
            data
        })
        revalidatePath("/categories")
        return { data : category}
    }catch(error){
        console.log("Error on Updating Category :", error);
        return {error: "Something went wrong"}
    }   
    })



export const deleteCategory = actionClient.inputSchema(getCategoryById).action(async (values) => {
    const { id } = values.parsedInput
    if(!ObjectId.isValid(id)) {
        return null
    }
    return await prisma.category.delete({
        where : { id },
    })
})

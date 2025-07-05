"use server"
import {prisma} from '@/lib/prisma'
import { actionClient } from "@/lib/safeAction";
import { brandSchema, deleteBrandSchema, updateBrandSchema } from '@/schemas/brand-schema';
import { ObjectId } from "mongodb";
import { revalidatePath } from 'next/cache';


export const createBrand = actionClient.inputSchema(brandSchema)
    .action(async (values) => {
        try{
            const brand = await prisma.brand.create({
                data : values.parsedInput,
            })
            revalidatePath('/brands')
            return {data : brand}
        }catch(error){
            console.log("Created Brand Error :", error)
            return {error: "Something went wrong"}   
        }
    })


export const getBrandList = actionClient.action(async () => {
    try{
        const brand = await prisma.brand.findMany({
            orderBy: {name : "desc"}
        })
        revalidatePath("/brands")
        return { data: brand}
    }catch(error){
        console.log("Get Brand Error :", error)
    }
})

export const getBrandlistForDropdown = async () => {
        return await prisma.brand.findMany({
            select : { id: true , name: true}
        })
}

export const updateBrand = actionClient.inputSchema(updateBrandSchema).action( async (values) => {
    const {id, ...data} = values.parsedInput;
    try{
        const brand = await prisma.brand.update({
            where :{id},
            data
        })
        revalidatePath('/brands')
        return { data : brand}
    }catch(error){
        console.log("Error on Brand Updating :", error);
        return {error: "Something went wrong"}
    }   
    })

export const deleteBrand = actionClient.inputSchema(deleteBrandSchema).action(async (values) => {
    const { id } = values.parsedInput
    if(!ObjectId.isValid(id)) {
        return null
    }
    return await prisma.brand.delete({
        where : { id },
    })
    
    
})

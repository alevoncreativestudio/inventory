"use server"
import {prisma} from '@/lib/prisma'
import { actionClient } from "@/lib/safeAction";
import { branchSchema, deleteBranchSchema, updateBranchSchema } from '@/schemas/branch-schema';
import { ObjectId } from "mongodb";
import { revalidatePath } from 'next/cache';


export const createBranch = actionClient.inputSchema(branchSchema)
    .action(async (values) => {
        try{
            const branch = await prisma.branch.create({
                data : values.parsedInput,
            })
            revalidatePath('/branch')
            return {data : branch}
        }catch(error){
            console.log("Created Branch Error :", error)
            return {error: "Something went wrong"}   
        }
    })


export const getBranchList = actionClient.action(async () => {
    try{
        const branch = await prisma.branch.findMany({
            orderBy: {name : "desc"}
        })
        revalidatePath("/branch")
        return { data: branch}
    }catch(error){
        console.log("Get Branch Error :", error)
    }
})

export const getBranchlistForDropdown = async () => {
        return await prisma.branch.findMany({
            select : { id: true , name: true}
        })
}

export const updateBranch = actionClient.inputSchema(updateBranchSchema).action( async (values) => {
    const {id, ...data} = values.parsedInput;
    try{
        const branch = await prisma.branch.update({
            where :{id},
            data
        })
        revalidatePath('/branch')
        return { data : branch}
    }catch(error){
        console.log("Error on Branch Updating :", error);
        return {error: "Something went wrong"}
    }   
    })

export const deleteBranch = actionClient.inputSchema(deleteBranchSchema).action(async (values) => {
    const { id } = values.parsedInput
    if(!ObjectId.isValid(id)) {
        return null
    }
    return await prisma.branch.delete({
        where : { id },
    })
    
    
})

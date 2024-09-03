'use server'
 
import { revalidatePath, revalidateTag } from 'next/cache'
 
export async function revalidatePathAction(paths: string[]) {
  console.log(`${paths} revalidated.`)
  paths.forEach((path) => {
    revalidatePath(`/${path}`)
  })
  return;
}


export async function revalidateTagsAction(tags: string[]) {
  console.log(`${tags} revalidated.`)
  tags.forEach((tag) => {
    revalidateTag(tag)
  })
  return;
}
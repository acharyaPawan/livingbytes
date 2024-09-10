import { cache } from "react"
import { getRandomNo } from "./db-query"
import { unstable_cache } from "next/cache"



export const TestPage = async () => {
  const getCachedRandom = unstable_cache(getRandomNo, [])
  const randomNo = getCachedRandom()
  return (
    <div>
      <h1>Hello World!</h1>
      <span>Random no is: {randomNo}</span>
    </div>
  )
}


export default TestPage
"use client"
import { useState } from "react"

 

export const WrapperComponent = (props: {randomNo: Number}) => {
  const [isCollapsed, setCollapsed] = useState<boolean>(true)
  return (
    <div >
      <h1>{isCollapsed}</h1>
      <span>Random no is: {String(randomNo)}</span>
    </div>
  )
}
"use server"


export const getRandomNo = async () => {
  const computedValue = Math.random()
  console.log("Computed value is : ", computedValue)
  return computedValue
}
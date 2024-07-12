import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeDifference(dateString: string): string {
  // Convert the input string to a Date object
  const createdAt: Date = new Date(dateString);

  // Get the current time
  const currentTime: Date = new Date();

  // Calculate the time difference in milliseconds
  const timeDifference: number = currentTime.getTime() - createdAt.getTime();

  // Calculate days, hours, and minutes
  const days: number = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours: number = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes: number = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  // Format the result
  if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
}

export function getEndOfDayISOString(): string {
  // Get the current date in UTC
  const currentDate = new Date();

  // Set the time to the end of the day
  currentDate.setUTCHours(23, 59, 59, 999);

  // Format the date as an ISO 8601 string
  const endOfDayISOString = currentDate.toISOString();

  return endOfDayISOString;
}

export function getEndOfDay(): Date {
  // Get the current date in UTC
  const currentDate = new Date();

  // Set the time to the end of the day
  currentDate.setUTCHours(23, 59, 59, 999);

  // Format the date as an ISO 8601 string
  // const endOfDayISOString = currentDate.toISOString();

  return currentDate;
}


export function getStartOfDay(): Date {
  // Get the current date in UTC
  const currentDate = new Date();

  // Set the time to the start of the day
  currentDate.setUTCHours(0, 0, 0, 0);

  // Return the date
  return currentDate;
}



export function formatTimeUntilExpiry(expiryDateString: string): string {
  // Convert the expiry date string to a Date object
  const expiryDate = new Date(expiryDateString);

  // Get the current time
  const currentTime = new Date();

  // Calculate the time difference in milliseconds
  const timeDifference = expiryDate.getTime() - currentTime.getTime();

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  // Format the result
  const formattedResult = `${hours} ${hours === 1 ? 'hour' : 'hours'}, ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}, ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;

  return formattedResult;
}
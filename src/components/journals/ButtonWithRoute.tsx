'use client';


// ButtonWithRoute.js

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export default function ButtonWithRoute({ href, children }: {href: string, children: React.ReactNode}) {
 const router = useRouter();

 const handleClick = () => {
  console.log('Routing to /today')
    router.push(href);
 };

 return <Button onClick={handleClick}>{children}</Button>;
}
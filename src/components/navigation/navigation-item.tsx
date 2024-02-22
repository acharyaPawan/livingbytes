"use client"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { CSSRuleObject } from "tailwindcss/types/config";

const NavItem = ({
    address,
    name,
    className
}: {
    address: Url,
    name: string,
    className?: React.CSSProperties
}) => {
    return (
        <NavigationMenuItem>
            <Link href={address} legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {name}
                </NavigationMenuLink>
            </Link>
        </NavigationMenuItem>

    );
}

export default NavItem;
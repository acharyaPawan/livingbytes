import DashboardNav from "@/components/dashboard/dashboard-nav";
import { Separator } from "@/components/ui/separator";

export default function RoutePage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

<div className="px-4 h-full">
      <DashboardNav />
      <Separator orientation="horizontal"  className="w-full h-[1px] bg-primary"/>
          {children}
      </div>
  );
}
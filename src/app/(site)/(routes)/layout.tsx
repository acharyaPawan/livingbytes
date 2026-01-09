import DashboardNav from "@/components/dashboard/dashboard-nav";
import { Separator } from "@/components/ui/separator";

export default function RoutePage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden px-4">
      <DashboardNav />
      <Separator orientation="horizontal" className="h-[1px] w-full" />
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
}

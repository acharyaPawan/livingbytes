import DashboardNav from "@/components/dashboard/dashboard-nav";
import { Separator } from "@/components/ui/separator";

export default function RoutePage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden px-4 bg-slate-50/80 dark:bg-[#0b0f14]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/10" />
        <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.08),_transparent_60%)]" />
      </div>
      <div className="relative flex h-full flex-col overflow-hidden">
        <DashboardNav />
        <Separator orientation="horizontal" className="h-[1px] w-full" />
        <div className="flex-1 min-h-0 overflow-y-auto pb-8">{children}</div>
      </div>
    </div>
  );
}

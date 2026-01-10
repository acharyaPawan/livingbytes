import Link from "next/link";

const quickLinks = [
  {
    title: "Journals",
    description: "Reflect on today and link it to your work.",
    href: "/journals",
  },
  {
    title: "Tasks",
    description: "See what is live, what is scheduled, and what is overdue.",
    href: "/tasks",
  },
  {
    title: "Events",
    description: "Keep milestones and deadlines in one timeline.",
    href: "/events",
  },
  {
    title: "Trackers",
    description: "Stay consistent with habits and streaks.",
    href: "/trackers",
  },
];

const comingSoon = [
  {
    title: "Readings",
    description: "Curate what you are learning and revisiting.",
  },
  {
    title: "Writings",
    description: "Draft essays, notes, and long-form ideas.",
  },
  {
    title: "Public",
    description: "Share selected pieces or progress updates.",
  },
];

const Home = () => {
  return (
    <div className="space-y-10 py-8">
      <section className="grid gap-6 rounded-3xl border border-white/40 bg-white/70 p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overview</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Welcome back to LivingByte.
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Open a workspace module below to continue your flow.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="rounded-2xl border border-white/40 bg-white/80 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-white/70 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {link.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Coming Soon</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            The next chapters
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {comingSoon.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-5 text-left dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-300">
                  Soon
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

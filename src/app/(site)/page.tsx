import Link from "next/link";
import Navbar from "@/components/navigation/navigation-bar";
import { Separator } from "@/components/ui/separator";
import { getServerAuthSession } from "@/server/auth";

const modules = [
  {
    title: "Journals",
    description: "Capture daily reflection, attach context, and anchor progress.",
    href: "/journals",
  },
  {
    title: "Tasks",
    description: "Move from intention to execution with focused task lanes.",
    href: "/tasks",
  },
  {
    title: "Events",
    description: "Track milestones, timelines, and what is next on the horizon.",
    href: "/events",
  },
  {
    title: "Trackers",
    description: "Build streaks, habits, and accountability loops.",
    href: "/trackers",
  },
];

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/80 dark:bg-[#0b0f14]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
        <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.08),_transparent_65%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16">
        <Navbar />
        <Separator className="absolute left-0 w-full bg-neutral-950/10 dark:bg-neutral-50/10" />

        <section
          id="home"
          className="mt-12 grid gap-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center"
        >
          <div className="space-y-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/40 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              LivingByte
              <span className="h-1 w-1 rounded-full bg-slate-400" />
              Daily Operating System
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-white md:text-5xl">
              A calm workspace for focus, reflection, and momentum.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Build a living record of your days, connect tasks to reflection, and
              keep your personal operating rhythm in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {session ? (
                <>
                  <Link
                    href="/tasks"
                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Open workspace
                  </Link>
                  <Link
                    href="/journals"
                    className="rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    Review journals
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/api/auth/signin"
                    className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Sign in to begin
                  </Link>
                  <Link
                    href="#learnmore"
                    className="rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    Explore modules
                  </Link>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div>
                <p className="text-xs uppercase tracking-[0.2em]">Anchor</p>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Daily reflection
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em]">Flow</p>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Task orchestration
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em]">Rhythm</p>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Habit tracking
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {modules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="group rounded-2xl border border-white/40 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-white/80 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {module.title}
                  </h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-500 dark:text-slate-500">
                    Open
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {module.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="onboarding"
          className="mt-16 grid gap-6 rounded-3xl border border-white/40 bg-white/70 p-8 shadow-sm dark:border-white/10 dark:bg-white/5"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">How it works</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Keep your day in one loop.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Log</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Capture what happened, how it felt, and what you learned.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Plan</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Organize tasks with urgency and clear next actions.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Track</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Maintain streaks and stay aware of your long-term direction.
              </p>
            </div>
          </div>
        </section>

        <section id="learnmore" className="mt-16 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Modules</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Your daily stack
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((module) => (
              <div
                key={`${module.title}-detail`}
                className="rounded-2xl border border-white/40 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {module.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {module.description}
                </p>
                <Link
                  href={module.href}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-slate-700 transition hover:text-slate-900 dark:text-slate-200"
                >
                  Go to {module.title}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="faqs" className="mt-16 grid gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">FAQs</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Common questions
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/40 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Is LivingByte a planner or a journal?
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                It is both. Journals capture the story, tasks run the day, and
                trackers keep your rhythm intact.
              </p>
            </div>
            <div className="rounded-2xl border border-white/40 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Can I use it just for tasks?
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Yes. Start where you need the most structure, then expand into
                journals and events when you are ready.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

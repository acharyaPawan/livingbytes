import Link from "next/link";

const ReadingPage = () => {
  return (
    <div className="space-y-6 py-10">
      <section className="rounded-3xl border border-white/40 bg-white/70 p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Readings</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
          Coming soon
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          A personal reading desk is on the way. Soon you will be able to collect highlights, notes, and reviews in one calm place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/journals"
            className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            Go to Journals
          </Link>
          <Link
            href="/tasks"
            className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            Open Tasks
          </Link>
          <Link
            href="/home"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Back to Overview
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ReadingPage;

import Link from "next/link";
import Navbar from "@/components/navigation/navigation-bar";
import { Separator } from "@/components/ui/separator";
import { getServerAuthSession } from "@/server/auth";
// import { api } from "@/trpc/server";

export default async function Home() {
  const session = await getServerAuthSession();
  if (session) console.log(session)

  return (
    <div>
      <div className="w-full overflow-hidden">
        <div className={`flex items-center justify-center px-6 sm:px-16`}>
          <div className={`w-full xl:max-w-[1280px]`}>
            <Navbar />
            <Separator className="absolute left-0 w-full bg-neutral-950 dark:bg-neutral-50" />
            {/* Introduction Section Component  */}
            <section className="mt-8">
              <h1>
                <span className="text-2xl leading-5">W</span>elcome to Your
                Daily Journaling Companion{" "}
                <span className="font-bold">LivingByte</span>
              </h1>
              <p>Your Daily Journey to Reflection and Growth</p>
              <p>
                Embrace the power of daily reflections with a supportive virtual
                companion designed to enhance your self-discovery.
              </p>
            </section>
            {session ? (
              <p>
                Lets continue our ongoing journey.Click here to reach{" "}
                <span className="cursor-default text-lg capitalize leading-tight text-zinc-600">
                  <Link href="/tasks">TaskMaster.</Link>
                </span>
              </p>
            ) : (
              <p>
                If you are ready, join LivingByte with{" "}
                <span className="cursor-default text-lg capitalize leading-tight text-zinc-600">
                  <Link href="/api/auth/signin">SignIn</Link>
                </span>
                .
              </p>
            )}
            <div>Quick Links</div>
            <Link href={"/tasks"}>TaskMaster</Link>
            <Link href={"/events"}>Events</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

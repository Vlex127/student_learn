"use client";

import { motion } from "framer-motion";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import dynamic from "next/dynamic";
const BabylonScene = dynamic(() => import("../components/BabylonScene"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-2xl" />
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center gap-6 py-20 px-4 md:px-10">
        <BabylonScene />
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Learn{" "}
            <span className="bg-gradient-to-b from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent">
              Smarter
            </span>
            , Not Harder.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Practice for exams, get instant feedback, and track your progress
            with real-time analytics. Whether you&apos;re in high school,
            university, or self-paced learning — we help you succeed.
          </p>
        </motion.div>

        <motion.div
          animate={{ opacity: 1 }}
          className="flex gap-4 flex-wrap justify-center mt-6"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
              class: "text-base px-6 py-3",
            })}
            href="/auth"
          >
            Start Practicing
          </Link>
          <Link
            isExternal
            className={buttonStyles({
              variant: "bordered",
              radius: "full",
              class: "text-base px-6 py-3",
            })}
            href="https://github.com/your-repo"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                clipRule="evenodd"
                d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
                fillRule="evenodd"
              />
            </svg>
            GitHub
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-black/20 py-16 px-6 md:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            {
              title: "Smart Practice",
              desc: "Our AI adapts to your learning style and gives you the right questions at the right time.",
            },
            {
              title: "Instant Feedback",
              desc: "Know where you stand instantly after every practice session with score breakdowns.",
            },
            {
              title: "Progress Tracking",
              desc: "Visualize your improvement over time and get suggestions on what to study next.",
            },
          ].map((f, idx) => (
            <motion.div
              key={idx}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md"
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-semibold text-primary">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-zinc-950 px-4 md:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold">Student Reviews</h2>
          <p className="text-muted-foreground mt-2">
            Hear what learners are saying about our platform.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Fatima",
              review:
                "I used this platform every day for a month and passed my entrance exam! The practice mode is amazing.",
            },
            {
              name: "Tunde",
              review:
                "The UI is clean, fast and I love how I can track my weekly improvement. It feels like a real classroom.",
            },
            {
              name: "Chinedu",
              review:
                "Honestly, I wish I found this earlier. Way better than cramming notes. 10/10 would recommend.",
            },
          ].map((t, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, scale: 1 }}
            >
              <p className="text-muted-foreground italic mb-4">
                &ldquo;{t.review}&rdquo;
              </p>
              <p className="text-sm font-semibold text-primary">– {t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call To Action Footer */}
      <section className="text-center py-20 px-4 md:px-10 bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Ace Your Next Exam?
          </h2>
          <p className="mt-4 text-lg">
            Join thousands of students leveling up every day.
          </p>
          <Link
            className="inline-block mt-6 bg-white text-black font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition"
            href="/auth"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* Footer Note */}
      <div className="text-center py-4 text-sm text-muted-foreground">
 
        <Snippet
          hideCopyButton
          hideSymbol
          className="mt-2 mx-auto w-fit"
          variant="bordered"
        >
          <span>
            Edit <Code color="primary">app/page.tsx</Code> to customize this
            page.
          </span>
        </Snippet>
      </div>
    </main>
  );
}

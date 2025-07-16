'use client'

import { motion } from 'framer-motion'
import { Link } from '@heroui/link'
import { Snippet } from '@heroui/snippet'
import { Code } from '@heroui/code'
import { button as buttonStyles } from '@heroui/theme'

import { title, subtitle } from '@/components/primitives'
import { GithubIcon } from '@/components/icons'

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center gap-6 py-20 px-4 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          <h1 className={title()}>
            Learn&nbsp;
            <span className={title({ color: 'violet' })}>Smarter</span>, Not Harder.
          </h1>
          <p className={subtitle({ class: 'mt-6 text-lg md:text-xl' })}>
            Practice for exams, get instant feedback, and track your progress with real-time analytics. Whether you're in high school, university, or self-paced learning — we help you succeed.
          </p>
        </motion.div>

        <motion.div
          className="flex gap-4 flex-wrap justify-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/auth"
            className={buttonStyles({
              color: 'primary',
              radius: 'full',
              variant: 'shadow',
              class: 'text-base px-6 py-3',
            })}
          >
            Start Practicing
          </Link>
          <Link
            isExternal
            className={buttonStyles({
              variant: 'bordered',
              radius: 'full',
              class: 'text-base px-6 py-3',
            })}
            href="https://github.com/your-repo"
          >
            <GithubIcon size={20} />
            GitHub
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-black/20 py-16 px-6 md:px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            {
              title: 'Smart Practice',
              desc: 'Our AI adapts to your learning style and gives you the right questions at the right time.',
            },
            {
              title: 'Instant Feedback',
              desc: 'Know where you stand instantly after every practice session with score breakdowns.',
            },
            {
              title: 'Progress Tracking',
              desc: 'Visualize your improvement over time and get suggestions on what to study next.',
            },
          ].map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md"
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
              name: 'Fatima',
              review:
                'I used this platform every day for a month and passed my entrance exam! The practice mode is amazing.',
            },
            {
              name: 'Tunde',
              review:
                'The UI is clean, fast and I love how I can track my weekly improvement. It feels like a real classroom.',
            },
            {
              name: 'Chinedu',
              review:
                'Honestly, I wish I found this earlier. Way better than cramming notes. 10/10 would recommend.',
            },
          ].map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-xl shadow-lg"
            >
              <p className="text-muted-foreground italic mb-4">“{t.review}”</p>
              <p className="text-sm font-semibold text-primary">– {t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call To Action Footer */}
      <section className="text-center py-20 px-4 md:px-10 bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Ace Your Next Exam?</h2>
          <p className="mt-4 text-lg">Join thousands of students leveling up every day.</p>
          <Link
            href="/signup"
            className="inline-block mt-6 bg-white text-black font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* Footer Note */}
      <div className="text-center py-4 text-sm text-muted-foreground">
        Built with ❤️ using HeroUI, Tailwind, shadcn, and Next.js
        <Snippet hideCopyButton hideSymbol variant="bordered" className="mt-2 mx-auto w-fit">
          <span>
            Edit <Code color="primary">app/page.tsx</Code> to customize this page.
          </span>
        </Snippet>
      </div>
    </main>
  )
}

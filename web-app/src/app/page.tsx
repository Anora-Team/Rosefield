export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="max-w-xl px-8 py-24 text-center sm:text-left">
        <p className="mb-6 text-xs uppercase tracking-[0.2em] text-zinc-500">
          Rosefield
        </p>
        <h1 className="mb-6 text-3xl font-light leading-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          A hotel that <em className="not-italic font-normal">understands</em>.
        </h1>
        <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Cultural Resonance Concierge — sensing the moment, the person, and the
          cultural fabric they live in, then responding with just-enough
          resonance.
        </p>
      </div>
    </main>
  );
}

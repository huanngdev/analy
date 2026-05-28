import { APP_NAME, formatGreeting } from "@repo/shared";

export function App() {
  return (
    <main className="min-h-dvh bg-slate-950 px-6 py-16 text-white">
      <section className="mx-auto flex max-w-3xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur">
        <p className="text-sm font-medium tracking-[0.35em] text-cyan-300 uppercase">
          {APP_NAME}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          {formatGreeting("web")}
        </h1>
        <p className="max-w-2xl text-lg text-pretty text-slate-300">
          Vite, React, TypeScript, Tailwind CSS, shared packages, and
          Bun-powered Turborepo scripts are ready.
        </p>
      </section>
    </main>
  );
}

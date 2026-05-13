"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-screen max-w-xl content-center px-5">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-black text-ink">Er ging iets mis</h1>
        <p className="mt-2 text-slateblue">De weerprovider is tijdelijk niet beschikbaar of de app kon de gevraagde pagina niet laden.</p>
        <button className="mt-5 rounded-md bg-rain px-4 py-3 font-bold text-white" onClick={reset}>
          Opnieuw proberen
        </button>
      </section>
    </main>
  );
}

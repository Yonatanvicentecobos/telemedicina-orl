import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-clinic-bg flex flex-col items-center justify-center p-6 text-center gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-clinic-text">
          Telemedicina Otorrinolaringología
        </h1>
        <p className="text-clinic-muted mt-2 max-w-md">
          Consulta online con el Dr. Cobos. Agenda tu videoconsulta en minutos.
        </p>
      </div>
      <Link
        href="/booking"
        className="rounded-lg bg-clinic-primary hover:bg-clinic-primaryDark text-white text-sm font-medium px-6 py-3 transition-colors"
      >
        Agendar consulta
      </Link>
    </main>
  );
}

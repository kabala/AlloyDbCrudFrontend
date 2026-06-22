export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.58fr)]">
      <section className="hidden border-r bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase">Retail textil</p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight">
            CRM/POS operacional para ventas, inventario y clientes.
          </h1>
        </div>
        <div className="grid max-w-2xl grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg border border-white/20 p-4">
            <p className="text-2xl font-semibold">POS</p>
            <p className="mt-2 text-white/75">Ventas con stock y descuentos.</p>
          </div>
          <div className="rounded-lg border border-white/20 p-4">
            <p className="text-2xl font-semibold">CRM</p>
            <p className="mt-2 text-white/75">Clientes y trazabilidad comercial.</p>
          </div>
          <div className="rounded-lg border border-white/20 p-4">
            <p className="text-2xl font-semibold">BI</p>
            <p className="mt-2 text-white/75">Datos operativos listos para analitica.</p>
          </div>
        </div>
      </section>
      <section className="grid place-items-center p-6">{children}</section>
    </main>
  );
}

export default function DashboardPage() {
  const highlights = [
    {
      title: "Ringkasan saldo",
      value: "Akan dihubungkan di fase 4",
      note: "Total saldo, pemasukan, dan pengeluaran bulanan",
    },
    {
      title: "Transaksi terbaru",
      value: "5 transaksi terakhir",
      note: "Disiapkan untuk daftar cepat di dashboard",
    },
    {
      title: "Kategori",
      value: "CRUD di fase 5",
      note: "Kategori pemasukan dan pengeluaran personal",
    },
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {highlights.map((item) => (
        <article
          key={item.title}
          className="retro-panel rounded-[24px] p-6"
        >
          <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.22em] text-[#ffcf82]">
            {item.title}
          </p>
          <h3 className="relative z-10 mt-3 text-2xl font-bold text-[#fff0ca]">
            {item.value}
          </h3>
          <p className="relative z-10 mt-2 text-sm leading-6 text-[#c9b08b]">
            {item.note}
          </p>
        </article>
      ))}

      <article className="retro-panel xl:col-span-3 rounded-[24px] p-6">
        <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.22em] text-[#ffcf82]">
          Next step
        </p>
        <h3 className="relative z-10 mt-3 text-2xl font-bold text-[#fff0ca]">
          Fase 2 selesai, struktur navigasi siap.
        </h3>
        <p className="relative z-10 mt-2 max-w-3xl text-sm leading-6 text-[#c9b08b]">
          Login page, proteksi middleware, dan shell dashboard sudah tersedia
          untuk fase berikutnya.
        </p>
      </article>
    </section>
  );
}

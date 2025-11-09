export const metadata = {
  title: "Підтримка",
};

export default function SupportPage() {
  return (
    <div className="container space-y-6 py-16">
      <h1 className="text-3xl font-semibold text-white md:text-4xl">
        Центр підтримки
      </h1>
      <p className="max-w-3xl text-sm text-slate-300 md:text-base">
        Ми на зв’язку щодня з 08:00 до 21:00. Оберіть зручний канал
        комунікації або надішліть запит напряму з платформи.
      </p>
      <ul className="grid gap-4 md:grid-cols-2">
        <li className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Email</h2>
          <p className="mt-2 text-sm text-slate-300">help@volunteer.ua</p>
        </li>
        <li className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Гаряча лінія</h2>
          <p className="mt-2 text-sm text-slate-300">+38 (044) 000-00-00</p>
        </li>
      </ul>
    </div>
  );
}



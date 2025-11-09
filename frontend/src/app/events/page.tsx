export const metadata = {
  title: "Навчальні події",
};

const EVENTS = [
  {
    title: "Практикум: Організація складу гуманітарної допомоги",
    date: "2025-11-22",
    format: "Онлайн",
  },
  {
    title: "Воркшоп для координаторів: робота з волонтерами",
    date: "2025-12-01",
    format: "Офлайн · Київ",
  },
  {
    title: "Серія вебінарів з аналітики волонтерських кампаній",
    date: "2025-12-10",
    format: "Онлайн",
  },
];

export default function EventsPage() {
  return (
    <div className="container space-y-6 py-16">
      <h1 className="text-3xl font-semibold text-white md:text-4xl">
        Навчальні події
      </h1>
      <p className="max-w-3xl text-sm text-slate-300 md:text-base">
        Регулярно проводимо сесії для координаторів, волонтерів та партнерів.
        Оберіть подію та заплануйте участь.
      </p>
      <ul className="grid gap-4 md:grid-cols-3">
        {EVENTS.map((event) => (
          <li
            key={event.title}
            className="rounded-3xl border border-white/10 bg-slate-900/60 p-6"
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">
              {event.format}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              {event.title}
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Дата:{" "}
              {new Date(event.date).toLocaleDateString("uk-UA", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}



export const metadata = {
  title: "Бібліотека ресурсів",
};

const RESOURCES = [
  {
    title: "Шаблон плану кампанії",
    description:
      "Структурований документ для координації задач, зміни та відповідальних.",
  },
  {
    title: "Інструкція з безпеки для волонтерів",
    description:
      "Перевірені правила поведінки під час виїздів, логістики та роботи на складах.",
  },
  {
    title: "Короткий посібник з кризової комунікації",
    description:
      "Покрокові рекомендації щодо інформування волонтерів та отримувачів допомоги.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="container space-y-6 py-16">
      <h1 className="text-3xl font-semibold text-white md:text-4xl">
        Бібліотека ресурсів
      </h1>
      <p className="max-w-3xl text-sm text-slate-300 md:text-base">
        Зібрали найважливіші матеріали для координаторів та волонтерів. Невдовзі
        додамо можливість завантаження безпосередньо з платформи.
      </p>
      <ul className="grid gap-4 md:grid-cols-3">
        {RESOURCES.map((resource) => (
          <li
            key={resource.title}
            className="rounded-3xl border border-white/10 bg-slate-900/60 p-6"
          >
            <h2 className="text-lg font-semibold text-white">
              {resource.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300">{resource.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}



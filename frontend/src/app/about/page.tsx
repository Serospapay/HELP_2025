export const metadata = {
  title: "Про платформу",
};

export default function AboutPage() {
  return (
    <div className="container space-y-6 py-16">
      <h1 className="text-3xl font-semibold text-white md:text-4xl">
        Про платформу
      </h1>
      <p className="max-w-3xl text-sm text-slate-300 md:text-base">
        Ми створили платформу для волонтерів, координаторів та отримувачів
        допомоги. Наша мета — об’єднати команди з усієї України, пришвидшити
        процеси реагування та забезпечити прозорість на кожному етапі.
      </p>
      <p className="max-w-3xl text-sm text-slate-300 md:text-base">
        Команда складається з розробників, фахівців з гуманітарного реагування,
        аналітиків та комунікаційників, що працюють з 2014 року і мають досвід
        підтримки організацій у різних регіонах.
      </p>
    </div>
  );
}



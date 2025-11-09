"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/campaigns", label: "Усі кампанії" },
  { href: "/donations/new", label: "Пожертвувати" },
  { href: "/about", label: "Про проєкт" },
  { href: "/support", label: "Підтримка" },
];

export function AppFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/95">
      <div className="container grid gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-semibold text-white">
            Платформа волонтерських проєктів
          </p>
          <p className="mt-3 max-w-md text-sm text-slate-300">
            Єдине місце для координації волонтерів, донорів та отримувачів
            допомоги. Прозорість, швидкість і підтримка 24/7.
          </p>
        </div>
        <nav aria-label="Швидкі посилання">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Навігація
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Контакти
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>
              <a
                href="mailto:help@volunteer.ua"
                className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                help@volunteer.ua
              </a>
            </li>
            <li>Телефон: +38 (044) 000-00-00</li>
            <li>Графік: Пн-Нд 08:00 – 21:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Платформа волонтерських проєктів. Усі права
        захищені.
      </div>
    </footer>
  );
}



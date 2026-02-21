"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { authStatusAtom, currentUserAtom, logoutAtom } from "@/lib/auth";
import { useSetAtom } from "jotai";

const NAV_LINKS_PUBLIC = [
  { href: "/", label: "Головна" },
  { href: "/campaigns", label: "Кампанії" },
  { href: "/donations/new", label: "Зробити внесок" },
  { href: "/about", label: "Про платформу" },
];

export function MainNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const authStatus = useAtomValue(authStatusAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const logout = useSetAtom(logoutAtom);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="container flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
            onClick={closeMenu}
          >
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-500 font-display text-base font-bold text-white shadow-lg shadow-brand-500/30">
              ВП
            </span>
            <span>Волонтерська платформа</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-2 md:flex" aria-label="Головна навігація">
          {NAV_LINKS_PUBLIC.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                  isActive
                    ? "bg-white text-slate-900"
                    : "text-slate-200 hover:bg-white/10",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {authStatus === "authenticated" ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                  pathname.startsWith("/dashboard")
                    ? "bg-white text-slate-900"
                    : "text-slate-200 hover:bg-white/10",
                )}
              >
                Кабінет
              </Link>
              <span className="text-sm text-slate-200">
                {currentUser?.first_name || currentUser?.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Вийти
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Увійти
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Зареєструватися
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/20 p-2 text-slate-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            aria-label="Меню"
            aria-expanded={isOpen}
            onClick={toggleMenu}
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      <nav
        className={cn(
          "md:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-label="Мобільна навігація"
      >
        <ul className="space-y-1 border-t border-white/10 bg-slate-900/95 px-4 py-3 shadow-lg backdrop-blur transition">
          {NAV_LINKS_PUBLIC.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-4 py-3 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                    isActive
                      ? "bg-brand-500 text-white"
                      : "text-slate-200 hover:bg-white/10",
                  )}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {authStatus === "authenticated" && (
            <li>
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className={cn(
                  "block rounded-lg px-4 py-3 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                  pathname.startsWith("/dashboard")
                    ? "bg-brand-500 text-white"
                    : "text-slate-200 hover:bg-white/10",
                )}
              >
                Кабінет
              </Link>
            </li>
          )}
        </ul>
        <div className="border-t border-white/10 pt-3">
          {authStatus === "authenticated" ? (
            <button
              type="button"
              onClick={() => {
                logout();
                closeMenu();
              }}
              className="flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Вийти
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="flex items-center justify-center rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Увійти
              </Link>
              <Link
                href="/auth/register"
                onClick={closeMenu}
                className="flex items-center justify-center rounded-full bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Зареєструватися
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}



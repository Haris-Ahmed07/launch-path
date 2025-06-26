'use client';

import { ThemeSwitcher } from './theme-switcher';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold">Launch Path</h1>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-accent/10 p-1">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}

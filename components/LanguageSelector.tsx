'use client';

import { LANGUAGES } from '@/lib/languages';
import { useIDEStore } from '@/store/ide-store';
import type { LanguageId } from '@/types/ide';

export function LanguageSelector() {
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const setLanguage = useIDEStore((state) => state.setLanguage);

  return (
    <label className="flex items-center gap-2 text-sm text-slate-300">
      <span className="hidden font-medium md:inline">Language</span>
      <select
        value={selectedLanguage}
        onChange={(event) => setLanguage(event.target.value as LanguageId)}
        className="h-10 rounded-xl border border-slate-700 bg-slate-950/80 px-3 text-sm font-semibold text-slate-100 outline-none transition focus:border-sky-400"
      >
        {LANGUAGES.map((language) => (
          <option key={language.id} value={language.id}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}

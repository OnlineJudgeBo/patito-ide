'use client';

import { getLanguageAllowedState, isLanguageId } from '@/lib/language-options';
import { COLOR_THEMES, isColorTheme } from '@/lib/ui-config';
import { useIDEStore } from '@/store/ide-store';

const selectClass =
  'h-9 rounded-lg border border-slate-700 bg-slate-950/80 px-3 text-sm font-semibold text-slate-100 outline-none transition focus:border-sky-400';

export function LanguageSelector() {
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const availableLanguages = useIDEStore((state) => state.availableLanguages);
  const colorTheme = useIDEStore((state) => state.ui.colorTheme);
  const setLanguage = useIDEStore((state) => state.setLanguage);
  const allowedLanguages = useIDEStore((state) => state.allowedLanguages);
  const setColorTheme = useIDEStore((state) => state.setColorTheme);

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
      <label className="flex items-center gap-2">
        <span className="hidden font-medium md:inline">Lenguaje</span>
        <select
          value={selectedLanguage}
          onChange={(event) => {
            if (isLanguageId(event.target.value)) setLanguage(event.target.value);
          }}
          className={selectClass}
        >
          {availableLanguages.map((language) => {
            const disabled = getLanguageAllowedState(language, allowedLanguages) === false;
            return (
              <option key={language.id} value={language.id} disabled={disabled}>
                {disabled ? `${language.label} (no disponible)` : language.label}
              </option>
            );
          })}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="hidden font-medium md:inline">Tema</span>
        <select
          value={colorTheme}
          onChange={(event) => {
            if (isColorTheme(event.target.value)) setColorTheme(event.target.value);
          }}
          className={selectClass}
        >
          {COLOR_THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

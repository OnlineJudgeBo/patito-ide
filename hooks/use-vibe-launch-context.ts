'use client';

import { useEffect } from 'react';
import { fetchVibeLaunchContext } from '@/services/vibe-context-api';
import { findLanguageByAllowedValue, firstAllowedLanguage, getLanguageAllowedState, inferLanguageId, isLanguageId, mergeApiLanguages } from '@/lib/language-options';
import { testcasesFromProblem } from '@/lib/problem-testcases';
import { useIDEStore } from '@/store/ide-store';
import type { LanguageId } from '@/types/ide';

export function useVibeLaunchContext(notify: (message: string) => void) {
  const setLaunchToken = useIDEStore((state) => state.setLaunchToken);
  const setProblem = useIDEStore((state) => state.setProblem);
  const setContextIdentifiers = useIDEStore((state) => state.setContextIdentifiers);
  const setStdin = useIDEStore((state) => state.setStdin);
  const setLanguage = useIDEStore((state) => state.setLanguage);
  const selectedLanguage = useIDEStore((state) => state.selectedLanguage);
  const setAvailableLanguages = useIDEStore((state) => state.setAvailableLanguages);
  const setAllowedLanguages = useIDEStore((state) => state.setAllowedLanguages);
  const setJudgeLanguageIds = useIDEStore((state) => state.setJudgeLanguageIds);
  const setTestcases = useIDEStore((state) => state.setTestcases);
  const setContextStatus = useIDEStore((state) => state.setContextStatus);
  const setJudgeFeatures = useIDEStore((state) => state.setJudgeFeatures);
  const addLog = useIDEStore((state) => state.addLog);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') ?? undefined;

    if (!token) {
      setContextStatus('demo');
      return;
    }

    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);

    setLaunchToken(token);
    setContextStatus('loading');

    fetchVibeLaunchContext({ token })
      .then((context) => {
        const allowed = context.allowedLanguages ?? [];
        const availableLanguages = mergeApiLanguages(context.languageDefinitions);
        const judgeLanguageIds = Object.fromEntries(
          availableLanguages
            .filter((language) => language.judgeLanguageId !== undefined && isLanguageId(language.id))
            .map((language) => [language.id, language.judgeLanguageId]),
        ) as Partial<Record<LanguageId, number>>;

        setAvailableLanguages(availableLanguages);
        setAllowedLanguages(allowed);
        setJudgeLanguageIds(judgeLanguageIds);
        setJudgeFeatures({ run: true, submit: true, polling: true, websocket: false, lsp: true, ...context.features });
        setContextIdentifiers(context.identifiers);

        const requestedLanguage = context.identifiers?.languageId ?? context.identifiers?.languageName;
        const selectedByRequest =
          findLanguageByAllowedValue(availableLanguages, requestedLanguage)?.id ??
          (typeof requestedLanguage === 'string' ? inferLanguageId(requestedLanguage) : undefined);
        const currentLanguage = selectedByRequest ?? selectedLanguage;
        const currentDefinition = availableLanguages.find((language) => language.id === currentLanguage);
        const currentAllowedState = currentDefinition ? getLanguageAllowedState(currentDefinition, allowed) : undefined;

        if (currentAllowedState === false) {
          const firstAllowed = firstAllowedLanguage(availableLanguages, allowed);
          if (firstAllowed) setLanguage(firstAllowed.id);
        } else if (selectedByRequest) {
          setLanguage(selectedByRequest);
        }
        setProblem(context.problem);
        setTestcases(testcasesFromProblem(context.problem));
        setContextStatus('ready');
        setStdin(context.problem.example.input ? `${context.problem.example.input}\n` : '');
        notify('Problema cargado desde la API.');
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'No se pudo cargar el contexto del problema.';
        addLog(message);
        setContextStatus('error', message);
        notify('No se pudo cargar el problema desde la API.');
      });
  }, [addLog, notify, selectedLanguage, setAllowedLanguages, setAvailableLanguages, setContextIdentifiers, setContextStatus, setJudgeFeatures, setJudgeLanguageIds, setLanguage, setTestcases, setLaunchToken, setProblem, setStdin]);
}

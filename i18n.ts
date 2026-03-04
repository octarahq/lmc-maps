import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import localeIndex from "./locales";

type Translations = Record<string, unknown>;

const DEFAULT_LANG = "fr";

void i18n.use(initReactI18next).init({
  resources: {},
  lng: DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG,
  interpolation: { escapeValue: false },
  initImmediate: false,
  react: { useSuspense: false },
});

const loadedNamespaces: Record<string, Set<string>> = {};

function normalizeLang(lng: string) {
  return (lng || DEFAULT_LANG).toLowerCase();
}

function getLangCandidates(lng: string) {
  const normalized = normalizeLang(lng);
  const base = normalized.split("-")[0];
  const candidates = [normalized];
  if (base && !candidates.includes(base)) candidates.push(base);
  if (!candidates.includes(DEFAULT_LANG)) candidates.push(DEFAULT_LANG);
  return candidates;
}

function ensureSetForLang(lng: string) {
  if (!loadedNamespaces[lng]) loadedNamespaces[lng] = new Set<string>();
}

function tryLoadNamespaceForLang(ns: string, lng: string) {
  const candidates = getLangCandidates(lng);

  for (const candidate of candidates) {
    ensureSetForLang(candidate);
    if (loadedNamespaces[candidate].has(ns)) continue;

    const translations: Translations | undefined = (localeIndex as any)?.[
      candidate
    ]?.[ns] as Translations | undefined;

    if (translations) {
      i18n.addResourceBundle(candidate, ns, translations, true, true);
      loadedNamespaces[candidate].add(ns);
    }
  }
}

function loadNamespace(ns: string) {
  const lng = i18n.language || DEFAULT_LANG;
  tryLoadNamespaceForLang(ns, lng);

  const fallback = i18n.options.fallbackLng;
  if (typeof fallback === "string") {
    tryLoadNamespaceForLang(ns, fallback);
  }
}

i18n.on("languageChanged", (lng: string) => {
  const known = Object.keys(loadedNamespaces);
  for (const lang of known) {
    for (const ns of Array.from(loadedNamespaces[lang])) {
      tryLoadNamespaceForLang(ns, lng);
    }
  }
});

export function createTranslator(ns: string) {
  loadNamespace(ns);

  return {
    t: (key: string, options?: any) =>
      i18n.t(`${ns}:${key}`, options) as string,
  };
}

export async function setLanguage(lng: string) {
  await i18n.changeLanguage(lng);

  const known = Object.keys(loadedNamespaces);
  for (const lang of known) {
    for (const ns of Array.from(loadedNamespaces[lang])) {
      tryLoadNamespaceForLang(ns, lng);
    }
  }

  return;
}

export default i18n;

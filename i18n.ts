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

function ensureSetForLang(lng: string) {
  if (!loadedNamespaces[lng]) loadedNamespaces[lng] = new Set<string>();
}

function tryLoadNamespaceForLang(ns: string, lng: string) {
  ensureSetForLang(lng);
  if (loadedNamespaces[lng].has(ns)) return;

  const translations: Translations | undefined = (localeIndex as any)?.[lng]?.[
    ns
  ] as Translations | undefined;

  if (translations) {
    i18n.addResourceBundle(lng, ns, translations, true, true);
    loadedNamespaces[lng].add(ns);
  }
}

function loadNamespace(ns: string) {
  const lng = i18n.language || DEFAULT_LANG;
  tryLoadNamespaceForLang(ns, lng);
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

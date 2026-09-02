import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ptPT from "./locales/pt-PT.json";
import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import zh from "./locales/zh.json";
import hi from "./locales/hi.json";
import ar from "./locales/ar.json";
import bn from "./locales/bn.json";
import ru from "./locales/ru.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import tr from "./locales/tr.json";
import it from "./locales/it.json";
import nl from "./locales/nl.json";
import pl from "./locales/pl.json";
import uk from "./locales/uk.json";
import vi from "./locales/vi.json";
import th from "./locales/th.json";
import id from "./locales/id.json";
import ms from "./locales/ms.json";
import he from "./locales/he.json";
import fa from "./locales/fa.json";
import sv from "./locales/sv.json";
import da from "./locales/da.json";
import fi from "./locales/fi.json";
import no from "./locales/no.json";
import el from "./locales/el.json";
import cs from "./locales/cs.json";
import ro from "./locales/ro.json";
import hu from "./locales/hu.json";
import sk from "./locales/sk.json";
import bg from "./locales/bg.json";
import hr from "./locales/hr.json";
import sr from "./locales/sr.json";
import sl from "./locales/sl.json";
import lt from "./locales/lt.json";
import lv from "./locales/lv.json";
import et from "./locales/et.json";
import ca from "./locales/ca.json";
import sq from "./locales/sq.json";
import tl from "./locales/tl.json";
import sw from "./locales/sw.json";
import af from "./locales/af.json";
import is from "./locales/is.json";
import ga from "./locales/ga.json";
import mt from "./locales/mt.json";
import cy from "./locales/cy.json";
import eu from "./locales/eu.json";
import cvST from "./locales/cv.json";
import kmb from "./locales/kmb.json";
import umb from "./locales/umb.json";
import kg from "./locales/kg.json";

export const SUPPORTED_LANGUAGES = [
  { code: "pt-PT", nativeName: "🇵🇹 Português (Portugal)" },
  { code: "en", nativeName: "🇬🇧 English" },
  { code: "pt-BR", nativeName: "🇧🇷 Português (Brasil)" },
  { code: "cv", nativeName: "🇨🇻 Crioulo (Cabo Verde)" },
  { code: "kmb", nativeName: "🇦🇴 Kimbundu (Angola)" },
  { code: "umb", nativeName: "🇦🇴 Umbundu (Angola)" },
  { code: "kg", nativeName: "🇦🇴 Kikongo (Angola)" },
  { code: "es", nativeName: "🇪🇸 Español" },
  { code: "fr", nativeName: "🇫🇷 Français" },
  { code: "de", nativeName: "🇩🇪 Deutsch" },
  { code: "zh", nativeName: "🇨🇳 中文" },
  { code: "hi", nativeName: "🇮🇳 हिन्दी" },
  { code: "ar", nativeName: "🇸🇦 العربية" },
  { code: "bn", nativeName: "🇧🇩 বাংলা" },
  { code: "ru", nativeName: "🇷🇺 Русский" },
  { code: "ja", nativeName: "🇯🇵 日本語" },
  { code: "ko", nativeName: "🇰🇷 한국어" },
  { code: "tr", nativeName: "🇹🇷 Türkçe" },
  { code: "it", nativeName: "🇮🇹 Italiano" },
  { code: "nl", nativeName: "🇳🇱 Nederlands" },
  { code: "pl", nativeName: "🇵🇱 Polski" },
  { code: "uk", nativeName: "🇺🇦 Українська" },
  { code: "vi", nativeName: "🇻🇳 Tiếng Việt" },
  { code: "th", nativeName: "🇹🇭 ไทย" },
  { code: "id", nativeName: "🇮🇩 Bahasa Indonesia" },
  { code: "ms", nativeName: "🇲🇾 Bahasa Melayu" },
  { code: "he", nativeName: "🇮🇱 עברית" },
  { code: "fa", nativeName: "🇮🇷 فارسی" },
  { code: "sv", nativeName: "🇸🇪 Svenska" },
  { code: "da", nativeName: "🇩🇰 Dansk" },
  { code: "fi", nativeName: "🇫🇮 Suomi" },
  { code: "no", nativeName: "🇳🇴 Norsk" },
  { code: "el", nativeName: "🇬🇷 Ελληνικά" },
  { code: "cs", nativeName: "🇨🇿 Čeština" },
  { code: "ro", nativeName: "🇷🇴 Română" },
  { code: "hu", nativeName: "🇭🇺 Magyar" },
  { code: "sk", nativeName: "🇸🇰 Slovenčina" },
  { code: "bg", nativeName: "🇧🇬 Български" },
  { code: "hr", nativeName: "🇭🇷 Hrvatski" },
  { code: "sr", nativeName: "🇷🇸 Српски" },
  { code: "sl", nativeName: "🇸🇮 Slovenščina" },
  { code: "lt", nativeName: "🇱🇹 Lietuvių" },
  { code: "lv", nativeName: "🇱🇻 Latviešu" },
  { code: "et", nativeName: "🇪🇪 Eesti" },
  { code: "ca", nativeName: "🇪🇸 Català" },
  { code: "sq", nativeName: "🇦🇱 Shqip" },
  { code: "tl", nativeName: "🇵🇭 Tagalog" },
  { code: "sw", nativeName: "🇹🇿 Kiswahili" },
  { code: "af", nativeName: "🇿🇦 Afrikaans" },
  { code: "is", nativeName: "🇮🇸 Íslenska" },
  { code: "ga", nativeName: "🇮🇪 Gaeilge" },
  { code: "mt", nativeName: "🇲🇹 Malti" },
  { code: "cy", nativeName: "🏴󠁧󠁢󠁷󠁬󠁳󠁿 Cymraeg" },
  { code: "eu", nativeName: "🇪🇸 Euskara" },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: SupportedLocale = "pt-PT";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "pt-PT": { translation: ptPT },
      en: { translation: en },
      "pt-BR": { translation: ptBR },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      cv: { translation: cvST }, // renamed file cv.json
      kmb: { translation: kmb },
      umb: { translation: umb },
      kg: { translation: kg },
      zh: { translation: zh },
      hi: { translation: hi },
      ar: { translation: ar },
      bn: { translation: bn },
      ru: { translation: ru },
      ja: { translation: ja },
      ko: { translation: ko },
      tr: { translation: tr },
      it: { translation: it },
      nl: { translation: nl },
      pl: { translation: pl },
      uk: { translation: uk },
      vi: { translation: vi },
      th: { translation: th },
      id: { translation: id },
      ms: { translation: ms },
      he: { translation: he },
      fa: { translation: fa },
      sv: { translation: sv },
      da: { translation: da },
      fi: { translation: fi },
      no: { translation: no },
      el: { translation: el },
      cs: { translation: cs },
      ro: { translation: ro },
      hu: { translation: hu },
      sk: { translation: sk },
      bg: { translation: bg },
      hr: { translation: hr },
      sr: { translation: sr },
      sl: { translation: sl },
      lt: { translation: lt },
      lv: { translation: lv },
      et: { translation: et },
      ca: { translation: ca },
      sq: { translation: sq },
      tl: { translation: tl },
      sw: { translation: sw },
      af: { translation: af },
      is: { translation: is },
      ga: { translation: ga },
      mt: { translation: mt },
      cy: { translation: cy },
      eu: { translation: eu },
    },
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
      convertDetectedLanguage: (lng: string) => {
        const supported = SUPPORTED_LANGUAGES.map((l) => l.code) as string[];
        if (supported.includes(lng)) return lng as SupportedLocale;

        const lang = lng.split("-")[0];
        if (supported.includes(lang)) return lang as SupportedLocale;
        if (lang === "pt") return lng.includes("BR") ? "pt-BR" : "pt-PT";

        return DEFAULT_LANGUAGE;
      },
    },
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;

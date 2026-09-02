import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Search, ChevronDown } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/i18n/index";
import { motion, AnimatePresence } from "framer-motion";
import { Flag } from "@/components/ui/Flag";

const parseNativeName = (nativeName: string) => {
  const match = nativeName.match(
    /^([\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF])\s+(.*)/,
  );
  if (match) {
    const emoji = match[1];
    const name = match[2];
    const alpha2 = (
      String.fromCharCode(emoji.codePointAt(0)! - 0x1f1e6 + 65) +
      String.fromCharCode(emoji.codePointAt(2)! - 0x1f1e6 + 65)
    ).toLowerCase();
    return { alpha2, name };
  }
  return { alpha2: null, name: nativeName };
};

interface LanguageSelectorProps {
  currentLanguage: string;
  onChange: (lang: string) => void;
}

export function LanguageSelector({
  currentLanguage,
  onChange,
}: LanguageSelectorProps): React.ReactElement {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Scroll to selected language when dropdown opens
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector(
        '[aria-selected="true"]',
      ) as HTMLElement | null;
      if (selectedEl) {
        setTimeout(
          () =>
            selectedEl.scrollIntoView({ block: "center", behavior: "instant" }),
          50,
        );
      }
    }
  }, [isOpen]);

  const sortedLanguages = useMemo(() => {
    return [...SUPPORTED_LANGUAGES].sort((a, b) => {
      // Remove emojis and symbols to sort alphabetically by language name
      const cleanA = a.nativeName.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
      const cleanB = b.nativeName.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
      return cleanA.localeCompare(cleanB);
    });
  }, []);

  const filteredLanguages = useMemo(() => {
    if (!search) return sortedLanguages;
    const s = search.toLowerCase();
    return sortedLanguages.filter((lang) =>
      lang.nativeName.toLowerCase().includes(s),
    );
  }, [search, sortedLanguages]);

  const currentLangObj = SUPPORTED_LANGUAGES.find(
    (l) => l.code === currentLanguage,
  );
  const currentParsed = currentLangObj
    ? parseNativeName(currentLangObj.nativeName)
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        id="language-selector-label"
        className="block text-xs font-medium text-slate-400 mb-1.5"
      >
        {t("settings.language")}
      </label>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="language-selector-label"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm bg-surface-800 border border-slate-700/60 rounded-xl text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 hover:bg-surface-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          {currentParsed?.alpha2 ? (
            <div className="w-5 h-3.5 rounded-[3px] overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center bg-slate-800">
              <Flag
                countryId={currentParsed.alpha2}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <Globe className="w-4 h-4 text-accent-400" aria-hidden="true" />
          )}
          <span className="truncate">
            {currentParsed?.name || currentLanguage}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-surface-800 border border-slate-700/80 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-slate-700/60 bg-surface-900/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder={t("settings.searchLanguage")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all"
                />
              </div>
            </div>

            {/* List */}
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-[220px] overflow-y-auto overscroll-contain py-1"
            >
              {filteredLanguages.length === 0 ? (
                <li className="px-4 py-3 text-xs text-center text-slate-500">
                  Nenhum resultado
                </li>
              ) : (
                filteredLanguages.map((lang) => {
                  const { alpha2, name } = parseNativeName(lang.nativeName);
                  return (
                    <li
                      key={lang.code}
                      role="option"
                      aria-selected={currentLanguage === lang.code}
                      onClick={() => {
                        onChange(lang.code);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                        currentLanguage === lang.code
                          ? "bg-accent-500/20 text-accent-300 font-medium"
                          : "text-slate-300 hover:bg-surface-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {alpha2 ? (
                          <div className="w-5 h-3.5 rounded-[3px] overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center bg-slate-800">
                            <Flag
                              countryId={alpha2}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : null}
                        <span>{name}</span>
                      </div>
                      {currentLanguage === lang.code && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-400"></div>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

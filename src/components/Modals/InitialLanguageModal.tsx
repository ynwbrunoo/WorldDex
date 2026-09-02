import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface InitialLanguageModalProps {
  onComplete: () => void;
}

export function InitialLanguageModal({
  onComplete,
}: InitialLanguageModalProps): React.ReactElement {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || "pt-PT");

  const handleConfirm = () => {
    i18n.changeLanguage(selectedLang);
    localStorage.setItem("worlddex_lang_selected", "true");
    onComplete();
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {}} 
      closeOnBackdrop={false}
      title={
        selectedLang.startsWith("pt") || selectedLang === "cv" || selectedLang === "kmb" || selectedLang === "umb" || selectedLang === "kg"
          ? "Bem-vindo! Seleciona o teu idioma"
          : "Welcome! Select your language"
      }
    >
      <div className="flex flex-col gap-6 mt-2">
        <p className="text-slate-300 text-sm text-center">
          {selectedLang.startsWith("pt") || selectedLang === "cv" || selectedLang === "kmb" || selectedLang === "umb" || selectedLang === "kg"
            ? "Podes alterar o idioma mais tarde nas Definições."
            : "You can change this later in Settings."}
        </p>

        <div className="flex flex-col gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full bg-surface-800 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleConfirm}
          className="w-full py-3"
          variant="primary"
        >
          {selectedLang.startsWith("pt") || selectedLang === "cv" || selectedLang === "kmb" || selectedLang === "umb" || selectedLang === "kg" 
            ? "Continuar" 
            : "Continue"}
        </Button>
      </div>
    </Modal>
  );
}

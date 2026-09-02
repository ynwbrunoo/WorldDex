/**
 * InitialLanguageModal Component
 * 
 * A blocking modal shown to first-time users to select their preferred language.
 * Leverages the rich LanguageSelector component and defaults to the browser locale.
 */
﻿import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LanguageSelector } from "@/components/Settings/LanguageSelector";

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
        selectedLang.startsWith("pt") ||
        selectedLang === "cv" ||
        selectedLang === "kmb" ||
        selectedLang === "umb" ||
        selectedLang === "kg"
          ? "Bem-vindo! Seleciona o teu idioma"
          : "Welcome! Select your language"
      }
    >
      <div className="flex flex-col gap-6 mt-2">
        <p className="text-slate-300 text-sm text-center">
          {selectedLang.startsWith("pt") ||
          selectedLang === "cv" ||
          selectedLang === "kmb" ||
          selectedLang === "umb" ||
          selectedLang === "kg"
            ? "Podes alterar o idioma mais tarde nas Definições."
            : "You can change this later in Settings."}
        </p>

        <div className="flex flex-col gap-2">
          <LanguageSelector
            currentLanguage={selectedLang}
            onChange={(lang) => setSelectedLang(lang)}
          />
        </div>

        <Button
          onClick={handleConfirm}
          className="w-full py-3"
          variant="primary"
        >
          {selectedLang.startsWith("pt") ||
          selectedLang === "cv" ||
          selectedLang === "kmb" ||
          selectedLang === "umb" ||
          selectedLang === "kg"
            ? "Continuar"
            : "Continue"}
        </Button>
      </div>
    </Modal>
  );
}

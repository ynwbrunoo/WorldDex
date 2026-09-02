import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw, Download, Upload, Eye, Info, Shield } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LanguageSelector } from "./LanguageSelector";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  onResetProgress: () => void;
  onExportProgress: () => void;
  onImportProgress: () => void;
  onShowTutorial: () => void;
  onShowAboutData: () => void;
  onShowPrivacy: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  onResetProgress,
  onExportProgress,
  onImportProgress,
  onShowTutorial,
  onShowAboutData,
  onShowPrivacy,
}: SettingsModalProps): React.ReactElement {
  const { t } = useTranslation();

  const handleLanguageChange = useCallback(
    (lang: string) => {
      onLanguageChange(lang);
    },
    [onLanguageChange],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("settings.title")}
      maxWidth="max-w-sm"
    >
      <div className="space-y-5">
        {/* Language */}
        <section aria-labelledby="settings-language-heading">
          <h3
            id="settings-language-heading"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3"
          >
            {t("settings.language")}
          </h3>
          <LanguageSelector
            currentLanguage={currentLanguage}
            onChange={handleLanguageChange}
          />
        </section>

        <hr className="border-slate-700/50" />

        {/* Tutorial */}
        <section>
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              onShowTutorial();
              onClose();
            }}
            icon={<Eye className="w-4 h-4" />}
            className="w-full justify-start"
          >
            {t("settings.restartTutorial")}
          </Button>
        </section>

        <hr className="border-slate-700/50" />

        {/* Data */}
        <section aria-labelledby="settings-data-heading">
          <h3
            id="settings-data-heading"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3"
          >
            {t("settings.data")}
          </h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="md"
              onClick={onExportProgress}
              icon={<Download className="w-4 h-4" />}
              className="w-full justify-start"
            >
              {t("settings.exportProgress")}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={onImportProgress}
              icon={<Upload className="w-4 h-4" />}
              className="w-full justify-start"
            >
              {t("settings.importProgress")}
            </Button>
          </div>
        </section>

        <hr className="border-slate-700/50" />

        {/* Info */}
        <section>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                onShowAboutData();
                onClose();
              }}
              icon={<Info className="w-4 h-4" />}
              className="w-full justify-start"
            >
              {t("settings.aboutData")}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                onShowPrivacy();
                onClose();
              }}
              icon={<Shield className="w-4 h-4" />}
              className="w-full justify-start"
            >
              {t("settings.privacy")}
            </Button>
          </div>
        </section>

        <hr className="border-slate-700/50" />

        {/* Danger zone */}
        <section>
          <Button
            variant="danger"
            size="md"
            onClick={onResetProgress}
            icon={<RotateCcw className="w-4 h-4" />}
            className="w-full"
          >
            {t("settings.resetProgress")}
          </Button>
        </section>
      </div>
    </Modal>
  );
}

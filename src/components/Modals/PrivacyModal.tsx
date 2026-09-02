import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({
  isOpen,
  onClose,
}: PrivacyModalProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modals.privacy.title")}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-sm text-slate-300">
        {/* Key privacy statements */}
        <div className="space-y-3">
          {[
            "modals.privacy.project",
            "modals.privacy.noData",
            "modals.privacy.localStorage",
            "modals.privacy.noCookies",
            "modals.privacy.noTracking",
            "modals.privacy.borders",
            "modals.privacy.license",
          ].map((key) => (
            <p key={key} className="leading-relaxed text-slate-400 flex gap-2">
              <span className="text-accent-500 flex-shrink-0 mt-0.5">•</span>
              {t(key)}
            </p>
          ))}
        </div>

        <section aria-labelledby="privacy-attribution">
          <h3
            id="privacy-attribution"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
          >
            {t("modals.privacy.attribution")}
          </h3>
          <div className="text-xs text-slate-500 space-y-1">
            <p>• world-atlas (TopoJSON) — Mike Bostock — ISC License</p>
            <p>• Natural Earth — Public Domain</p>
            <p>• React — MIT License</p>
            <p>• D3.js — ISC License</p>
            <p>• Framer Motion — MIT License</p>
            <p>• i18next — MIT License</p>
            <p>• Tailwind CSS — MIT License</p>
            <p>• Lucide Icons — ISC License</p>
          </div>
        </section>

        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            {t("modals.privacy.close")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

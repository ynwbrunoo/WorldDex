import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface AboutDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutDataModal({
  isOpen,
  onClose,
}: AboutDataModalProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modals.aboutData.title")}
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-sm text-slate-300">
        <p className="leading-relaxed">{t("modals.aboutData.intro")}</p>

        <section aria-labelledby="about-methodology">
          <h3
            id="about-methodology"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
          >
            {t("modals.aboutData.methodology")}
          </h3>
          <p className="leading-relaxed text-slate-400">
            {t("modals.aboutData.methodologyText")}
          </p>
        </section>

        <section aria-labelledby="about-sensitivity">
          <h3
            id="about-sensitivity"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
          >
            {t("modals.aboutData.sensitivity")}
          </h3>
          <p className="leading-relaxed text-slate-400">
            {t("modals.aboutData.sensitivityText")}
          </p>
        </section>

        <section aria-labelledby="about-updates">
          <h3
            id="about-updates"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
          >
            {t("modals.aboutData.updates")}
          </h3>
          <p className="leading-relaxed text-slate-400">
            {t("modals.aboutData.updatesText")}
          </p>
        </section>

        <section aria-labelledby="about-sources">
          <h3
            id="about-sources"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
          >
            {t("modals.aboutData.sources")}
          </h3>
          <ul className="space-y-1.5">
            {(
              t("modals.aboutData.sourcesList", {
                returnObjects: true,
              }) as string[]
            ).map((source, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-400">
                <span className="text-accent-500 mt-0.5 flex-shrink-0">•</span>
                {source}
              </li>
            ))}
          </ul>
        </section>

        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            {t("modals.aboutData.close")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetModal({
  isOpen,
  onClose,
  onConfirm,
}: ResetModalProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modals.reset.title")}
      maxWidth="max-w-sm"
    >
      <div className="space-y-5">
        <p className="text-sm text-slate-300 leading-relaxed">
          {t("modals.reset.message")}
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            {t("modals.reset.cancel")}
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={onConfirm}
            className="flex-1"
          >
            {t("modals.reset.confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

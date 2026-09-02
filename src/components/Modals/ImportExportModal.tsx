import React, { useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { exportSaveAsJson, importSaveFromJson } from "@/store/storage";
import type { SaveData } from "@/store/types";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveData: SaveData;
  onImport: (data: SaveData) => void;
  onAddToast: (message: string, type: "success" | "error") => void;
}

export function ImportExportModal({
  isOpen,
  onClose,
  saveData,
  onImport,
  onAddToast,
}: ImportExportModalProps): React.ReactElement {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const json = exportSaveAsJson(saveData);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `onde-nascerias-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [saveData]);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result;
        if (typeof text !== "string") {
          onAddToast(t("modals.importExport.importError"), "error");
          return;
        }

        const imported = importSaveFromJson(text);
        if (imported) {
          onImport(imported);
          onClose();
          onAddToast(t("modals.importExport.importSuccess"), "success");
        } else {
          onAddToast(t("modals.importExport.importError"), "error");
        }
      };
      reader.readAsText(file);

      // Reset input so the same file can be re-imported
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onImport, onClose, onAddToast, t],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modals.importExport.title")}
      maxWidth="max-w-sm"
    >
      <div className="space-y-5">
        {/* Export */}
        <section aria-labelledby="export-heading">
          <h3
            id="export-heading"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
          >
            {t("modals.importExport.exportTitle")}
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            {t("modals.importExport.exportDescription")}
          </p>
          <Button
            variant="secondary"
            size="md"
            onClick={handleExport}
            icon={<Download className="w-4 h-4" />}
            className="w-full"
          >
            {t("modals.importExport.exportButton")}
          </Button>
        </section>

        <hr className="border-slate-700/50" />

        {/* Import */}
        <section aria-labelledby="import-heading">
          <h3
            id="import-heading"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
          >
            {t("modals.importExport.importTitle")}
          </h3>
          <p className="text-sm text-slate-400 mb-2">
            {t("modals.importExport.importDescription")}
          </p>
          <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 mb-3">
            <AlertTriangle
              className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-xs text-amber-300">
              {t("modals.importExport.importWarning")}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="sr-only"
            id="import-file-input"
            aria-label={t("modals.importExport.importButton")}
          />
          <Button
            variant="ghost"
            size="md"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-4 h-4" />}
            className="w-full border border-slate-600/40"
          >
            {t("modals.importExport.importButton")}
          </Button>
        </section>
      </div>
    </Modal>
  );
}

import React from "react";
import { useTranslation } from "react-i18next";
import {
  HelpCircle,
  Database,
  Settings,
  HardDrive,
  Coffee,
  Volume2,
  VolumeX,
  Trophy,
  Repeat,
} from "lucide-react";
import type { GameAction } from "@/store/types";

interface HeaderProps {
  dispatch: React.Dispatch<GameAction>;
  isMuted: boolean;
  toggleMute: () => void;
  isGameCompleted?: boolean;
  onPlayReplay?: () => void;
}

export function Header({
  dispatch,
  isMuted,
  toggleMute,
  isGameCompleted,
  onPlayReplay,
}: HeaderProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-surface-900/80 backdrop-blur-sm border-b border-slate-800/80 z-20 relative">
      {/* Logo / Title */}
      <div className="flex items-center gap-3 select-none cursor-default">
        <div
          className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-600 via-cyan-500 to-blue-600 shadow-glow-accent ring-2 ring-surface-900 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
          <span className="text-xl font-bold text-white drop-shadow-md">W</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            {t("app.title")}
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-accent-400 mt-0.5">
            {t("app.subtitle")}
          </p>
        </div>
        {/* Mobile */}
        <div className="sm:hidden">
          <h1 className="text-base font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            {t("app.title")}
          </h1>
        </div>
        
        {isGameCompleted && (
          <button
            onClick={onPlayReplay}
            className="ml-1 sm:ml-2 px-2 py-1 bg-amber-500/20 border border-amber-500/50 rounded-lg flex items-center gap-1.5 hover:bg-amber-500/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title={t("completion.replay", "Ver Replay")}
            aria-label={t("completion.replay", "Ver Replay")}
          >
             <Trophy className="w-3.5 h-3.5 text-amber-400" />
             <span className="text-[10px] sm:text-xs font-bold tracking-wide text-amber-400">100%</span>
             <Repeat className="w-3 h-3 text-amber-400/80 ml-0.5 hidden sm:block" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Privacy notice — subtle */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 mr-3">
          <HardDrive className="w-3 h-3" aria-hidden="true" />
          <span>{t("header.localStorageNotice")}</span>
        </div>

        {/* Buy Me a Coffee */}
        <a
          href="https://buymeacoffee.com/ynwbrunoo"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 mr-2 px-3 py-1.5 bg-[#FFDD00]/10 hover:bg-[#FFDD00]/20 text-[#FFDD00] rounded-lg transition-colors border border-[#FFDD00]/20 text-xs font-bold font-sans tracking-wide shadow-[0_0_10px_rgba(255,221,0,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDD00]"
        >
          <Coffee className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Buy me a coffee</span>
        </a>

        <NavButton
          icon={<HelpCircle className="w-4 h-4" />}
          label={t("header.howToPlay")}
          onClick={() => dispatch({ type: "SHOW_TUTORIAL" })}
        />
        <NavButton
          icon={<Database className="w-4 h-4" />}
          label={t("header.aboutData")}
          onClick={() => dispatch({ type: "TOGGLE_ABOUT_DATA" })}
        />
        <NavButton
          icon={
            isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )
          }
          label={isMuted ? "Unmute" : "Mute"}
          onClick={toggleMute}
        />
        <NavButton
          icon={<Settings className="w-4 h-4" />}
          label={t("nav.settings")}
          onClick={() => dispatch({ type: "TOGGLE_IMPORT_EXPORT" })}
        />
      </div>
    </header>
  );
}

function NavButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

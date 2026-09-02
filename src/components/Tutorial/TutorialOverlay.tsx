import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface TutorialOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

export function TutorialOverlay({
  isOpen,
  onComplete,
}: TutorialOverlayProps): React.ReactElement | null {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;

    const tour = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
      allowKeyboardControl: true, // Let them use arrows, but escape is blocked by allowClose: false
      overlayColor: "rgba(0,0,0,0.85)",
      nextBtnText: t("tour.next", "Próximo ➔"),
      prevBtnText: t("tour.prev", "⬅ Anterior"),
      doneBtnText: t("tour.done", "Terminar ✓"),
      progressText: t("tour.progress", "Passo {{current}} de {{total}}"),
      onDestroyStarted: () => {
        tour.destroy();
        onComplete();
      },
      onPopoverRender: (popover) => {
        // Applying our nice dark theme over driver.js
        popover.wrapper.style.borderRadius = "16px";
        popover.wrapper.style.backgroundColor = "#1e293b";
        popover.wrapper.style.color = "#f8fafc";
        popover.wrapper.style.border = "1px solid #334155";

        const title = popover.title;
        if (title) {
          title.style.color = "#22d3ee";
          title.style.fontSize = "1.25rem";
          title.style.fontWeight = "700";
        }

        const desc = popover.description;
        if (desc) {
          desc.style.color = "#cbd5e1";
          desc.style.fontSize = "0.95rem";
          desc.style.lineHeight = "1.5";
        }

        const footer = popover.footer;
        if (footer) {
          footer.style.display = "flex";
          footer.style.alignItems = "center";
          footer.style.justifyContent = "space-between";
          footer.style.flexWrap = "wrap";
          footer.style.gap = "12px";

          // Add skip button
          let skipBtn = footer.querySelector(
            ".tour-skip-btn",
          ) as HTMLButtonElement;
          if (!skipBtn) {
            skipBtn = document.createElement("button");
            skipBtn.className = "tour-skip-btn";
            skipBtn.innerText = t("tour.skip", "Pular Tutorial");
            skipBtn.style.backgroundColor = "transparent";
            skipBtn.style.color = "#94a3b8"; // slate-400
            skipBtn.style.border = "none";
            skipBtn.style.padding = "0";
            skipBtn.style.textDecoration = "underline";
            skipBtn.style.fontSize = "0.85rem";
            skipBtn.style.fontWeight = "500";
            skipBtn.style.cursor = "pointer";
            skipBtn.style.whiteSpace = "nowrap";

            skipBtn.onclick = () => {
              tour.destroy();
              onComplete();
            };
            footer.insertBefore(skipBtn, footer.firstChild);
          }
          
          // Prevent the progress text from wrapping awkwardly
          const progressText = footer.querySelector('.driver-popover-progress-text') as HTMLElement;
          if (progressText) {
            progressText.style.whiteSpace = "nowrap";
            progressText.style.fontSize = "0.85rem";
          }
          
          const navBtns = footer.querySelector('.driver-popover-navigation-btns') as HTMLElement;
          if (navBtns) {
            navBtns.style.display = "flex";
            navBtns.style.gap = "8px";
            navBtns.style.flexWrap = "wrap";
            navBtns.style.justifyContent = "flex-end";
          }
        }

        const buttons = popover.footer?.querySelectorAll(
          "button:not(.tour-skip-btn)",
        );
        if (buttons) {
          buttons.forEach((b) => {
            const btn = b as HTMLButtonElement;
            btn.style.backgroundColor = "#334155";
            btn.style.color = "#f8fafc";
            btn.style.textShadow = "none";
            btn.style.border = "none";
            btn.style.borderRadius = "8px";
            btn.style.whiteSpace = "nowrap";
            btn.style.flex = "1"; // Allow buttons to flex if needed
            btn.style.textAlign = "center";
            if (btn.classList.contains("driver-popover-next-btn")) {
              btn.style.backgroundColor = "#0891b2";
            }
          });
        }
      },
      steps: [
        {
          popover: {
            title: t("tour.step1.title", "👋 Bem-vindo ao WorldDex!"),
            description: t(
              "tour.step1.desc",
              "Aqui vais colecionar todos os países do mundo através de sorteios baseados na verdadeira taxa de natalidade global. Vamos ver como funciona?",
            ),
          },
        },
        {
          element: "#tour-roll",
          popover: {
            title: t("tour.step2.title", "🎰 Rolar Pelo Mundo"),
            description: t(
              "tour.step2.desc",
              "Clica neste botão (ou pressiona Espaço) para girares. A probabilidade de te calhar um país é **exatamente igual à probabilidade de nasceres lá** no mundo real. Quanto mais nascimentos, mais comum!",
            ),
            side: "top",
            align: "center",
          },
        },
        {
          element: "#tour-map",
          popover: {
            title: t("tour.step3.title", "🌍 O Teu Mapa"),
            description: t(
              "tour.step3.desc",
              "Sempre que desbloqueares um país novo, ele será pintado no mapa com a cor da sua raridade (Comum, Incomum, Raro, Épico ou Lendário).",
            ),
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "#tour-pity",
          popover: {
            title: t("tour.step4.title", "🍀 Sistema de Pity"),
            description: t(
              "tour.step4.desc",
              "Cada vez que te calha um duplicado, a barra de sorte sobe. Quando chegar ao máximo, o próximo giro é **100% garantido** de ser um país que ainda não tens!",
            ),
            side: "top",
            align: "center",
          },
        },
        {
          element: "#tab-shop",
          popover: {
            title: t("tour.step5.title", "🛒 Loja & Economia"),
            description: t(
              "tour.step5.desc",
              "Não te preocupes com os duplicados. Cada país repetido dá-te **moedas** (dependendo da sua raridade). Podes usar moedas nesta Loja para **comprar países em falta** ou **Upgrades** (como o Autoclicker ou multiplicadores).",
            ),
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tab-collection",
          popover: {
            title: t("tour.step6.title", "📚 A Tua Coleção"),
            description: t(
              "tour.step6.desc",
              "Nesta aba podes ver todos os países que já tiraste e quantos te faltam. Podes clicar neles para veres detalhes e curiosidades.",
            ),
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tab-achievements",
          popover: {
            title: t("tour.step7.title", "🏆 Conquistas"),
            description: t(
              "tour.step7.desc",
              "Completa continentes, forma grupos de países específicos (como a CPLP ou União Europeia) e alcança metas para desbloquear estas conquistas únicas.",
            ),
            side: "bottom",
            align: "start",
          },
        },
        {
          popover: {
            title: t("tour.step8.title", "🚀 Pronto a Jogar!"),
            description: t(
              "tour.step8.desc",
              "Agora é contigo! Boa sorte na tua jornada para desbloquear o mundo inteiro, um nascimento de cada vez.",
            ),
          },
        },
      ],
    });

    tour.drive();

    return () => {
      tour.destroy();
    };
  }, [isOpen, onComplete, t]);

  return null;
}

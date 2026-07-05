import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  X,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Lightbulb,
  CheckCircle,
  SkipForward,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
   TutorialTour
   Props:
     steps   – array of { target: "#css-id", title, content, placement? }
     onClose – called when tour ends or is skipped
     storageKey – localStorage key to remember "seen" state
─────────────────────────────────────────────────────────── */
const TutorialTour = ({ steps = [], onClose, storageKey }) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [rect, setRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  const step = steps[current];
  const isLast = current === steps.length - 1;

  // Highlight the target element
  const highlight = useCallback(() => {
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (!el) { setRect(null); return; }

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      });
    }, 350);
  }, [step]);

  useEffect(() => { highlight(); }, [highlight]);

  // Position tooltip relative to highlighted element
  useEffect(() => {
    if (!rect || !tooltipRef.current) return;
    const tip = tooltipRef.current.getBoundingClientRect();
    const padding = 18;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight + window.scrollY;
    const placement = step?.placement || "bottom";

    let top, left;

    if (placement === "top") {
      top = rect.top - tip.height - padding;
      left = rect.left + rect.width / 2 - tip.width / 2;
    } else if (placement === "left") {
      top = rect.top + rect.height / 2 - tip.height / 2;
      left = rect.left - tip.width - padding;
    } else if (placement === "right") {
      top = rect.top + rect.height / 2 - tip.height / 2;
      left = rect.left + rect.width + padding;
    } else {
      // bottom (default)
      top = rect.top + rect.height + padding;
      left = rect.left + rect.width / 2 - tip.width / 2;
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, viewW - tip.width - 8));
    top = Math.max(8, Math.min(top, viewH - tip.height - 8));

    setTooltipPos({ top, left });
  }, [rect, step]);

  const handleNext = () => {
    if (isLast) handleFinish();
    else setCurrent((p) => p + 1);
  };

  const handlePrev = () => setCurrent((p) => Math.max(0, p - 1));

  const handleFinish = () => {
    if (storageKey) localStorage.setItem(storageKey, "done");
    onClose?.();
  };

  if (!step) return null;

  return createPortal(
    <>
      {/* Dark overlay with cutout */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{
          background: rect
            ? `radial-gradient(ellipse ${rect.width + 32}px ${rect.height + 32}px at ${
                rect.left + rect.width / 2 - window.scrollX
              }px ${rect.top + rect.height / 2 - window.scrollY}px, transparent 95%, rgba(0,0,0,0.6) 100%)`
            : "rgba(0,0,0,0.55)",
          backdropFilter: "blur(1px)",
          transition: "background 0.35s",
        }}
      />

      {/* Click-blocker overlay (except cutout area) */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={handleFinish}
        style={{ cursor: "default" }}
      />

      {/* Highlight ring around target */}
      {rect && (
        <div
          className="absolute z-[9999] pointer-events-none rounded-xl ring-4 ring-indigo-400 ring-offset-2 shadow-[0_0_0_4px_rgba(99,102,241,0.25)] transition-all duration-350"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="absolute z-[10000] w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-indigo-100 dark:border-zinc-700 overflow-hidden"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          transition: "top 0.3s, left 0.3s",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-300 shrink-0" />
            <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">
              {t("Tutorial")}
            </span>
          </div>
          <button
            onClick={handleFinish}
            className="text-indigo-200 hover:text-white transition-colors cursor-pointer rounded-full p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 px-5 pt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-indigo-600 flex-[2]"
                  : i < current
                  ? "bg-indigo-300 flex-1"
                  : "bg-gray-200 dark:bg-zinc-700 flex-1"
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            {isLast && current > 0 && (
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            )}
            {step.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {step.content}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex items-center justify-between gap-3">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {current + 1} / {steps.length}
          </span>

          <div className="flex gap-2">
            {current > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                {t("Back")}
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg font-semibold transition-all cursor-pointer shadow-sm ${
                isLast
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isLast ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t("Got it!")}
                </>
              ) : (
                <>
                  {t("Next")}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip link */}
        {!isLast && (
          <div className="border-t border-gray-100 dark:border-zinc-800 px-5 py-2 flex justify-center">
            <button
              onClick={handleFinish}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
            >
              <SkipForward className="w-3 h-3" />
              {t("Skip tutorial")}
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

/* ──────────────────────────────────────────────────────────
   TutorialButton — floating "?" button to restart the tour
─────────────────────────────────────────────────────────── */
export const TutorialButton = ({ onClick, label = "Help" }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      title={t(label)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-all cursor-pointer shadow-sm"
    >
      <BookOpen className="w-3.5 h-3.5" />
      {t(label)}
    </button>
  );
};

export default TutorialTour;

"use client";

import React, { useState } from "react";

import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  PenTool,
  Send,
  Sparkles,
} from "lucide-react";

import { playTurn, startGame } from "../../services/storyService";
import { PageData } from "../../shared/types/types";

// --- UI Komponenten (Flowbite-Simulation) ---

/**
 * Props für die Button-Komponente.
 */
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  color?: "blue" | "gray" | "dark";
}

/**
 * Ein flexibler Button mit verschiedenen Stil-Varianten.
 *
 * @param props - Die Button-Eigenschaften.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  className = "",
  color = "blue",
}) => {
  const baseStyle =
    "group flex items-center justify-center p-0.5 text-center font-medium relative focus:z-10 focus:outline-none transition-all duration-200";
  const colorStyles = {
    blue: "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-lg",
    gray: "text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 rounded-lg",
    dark: "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${colorStyles[color]} ${className} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span className="flex items-center gap-2 px-5 py-2.5">{children}</span>
    </button>
  );
};

/**
 * Props für das TextInput-Feld.
 */
interface TextInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

/**
 * Ein einfaches Texteingabefeld.
 */
const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  value,
  onChange,
  disabled,
}) => (
  <input
    type="text"
    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
  />
);

/**
 * Props für das TextArea-Feld.
 */
interface TextAreaProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

/**
 * Ein mehrzeiliges Texteingabefeld.
 */
const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  value,
  onChange,
  rows = 4,
}) => (
  <textarea
    rows={rows}
    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
);

// --- Hauptanwendung ---

/**
 * Die Hauptseite der Anwendung (Sub-Route).
 * Ermöglicht dem Benutzer, eine neue Geschichte zu starten oder eine bestehende fortzusetzen.
 * Verwaltet den Status der Geschichte, die Seiten und die Interaktion mit dem Backend.
 */
export default function WelcomePage() {
  // --- State ---

  /** Der aktuelle Modus der Anzeige: 'setup' für Startbildschirm, 'reading' für das Buch. */
  const [mode, setMode] = useState<"setup" | "reading">("setup");

  /** Die aktuelle Eingabe des Benutzers (Start-Prompt oder Fortsetzung). */
  const [prompt, setPrompt] = useState("");

  /** Zeigt an, ob gerade eine Anfrage an das Backend läuft. */
  const [isGenerating, setIsGenerating] = useState(false);

  /** Der Index der aktuell angezeigten Seite (0-basiert). */
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  /** Die Sitzungs-ID der aktuellen Geschichte, erhalten vom Backend. */
  const [sessionId, setSessionId] = useState<string | null>(null);

  /** Fehlermeldungen für die Anzeige. */
  const [error, setError] = useState<string | null>(null);

  // Story Daten
  /** Der Titel der Geschichte (wird aus dem ersten Prompt generiert). */
  const [storyTitle, setStoryTitle] = useState("");

  /** Die Liste der bisher generierten Seiten der Geschichte. */
  const [pages, setPages] = useState<PageData[]>([]);

  // --- Daten aus echtem Backend ---

  /**
   * Hilfsfunktion zum Konvertieren von Backend-Antwortdaten in ein PageData-Objekt.
   *
   * @param lastNarrative - Der Text der Geschichte.
   * @param imageUrl - Die URL des generierten Bildes (oder null).
   * @param turn - Die Nummer der Runde/Seite.
   */
  const mapResponseToPage = (
    lastNarrative: string,
    imageUrl: string | null,
    turn: number
  ): PageData => ({
    text: lastNarrative ?? "",
    imageUrl: imageUrl ?? null,
    turn: turn ?? pages.length + 1,
  });

  /**
   * Erstellt die initialen Seiten basierend auf der Start-Antwort des Backends.
   * Behandelt den Fall, dass bereits eine History existiert oder eine frische Geschichte gestartet wird.
   *
   * @param response - Die Antwort von startGame.
   */
  const buildInitialPages = (
    response: Awaited<ReturnType<typeof startGame>>
  ): PageData[] => {
    if (Array.isArray(response.history) && response.history.length > 0) {
      return response.history.map((text, index) =>
        mapResponseToPage(
          text,
          index === response.history.length - 1 ? response.image_url : null,
          index + 1
        )
      );
    }
    return [
      mapResponseToPage(
        response.last_narrative,
        response.image_url,
        response.turn_count ?? 1
      ),
    ];
  };

  /**
   * Startet eine neue Geschichte basierend auf dem 'prompt'.
   * Ruft 'startGame' auf und initialisiert den State für den Lesemodus.
   */
  const handleStart = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await startGame(prompt.trim());
      const initialPages = buildInitialPages(response);

      setPages(initialPages);
      setStoryTitle(prompt.trim().split(" ").slice(0, 4).join(" ") + "...");
      setSessionId(response.session_id ?? null);
      setMode("reading");
      setCurrentPageIndex(0);
      setPrompt("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unbekannter Fehler beim Starten der Geschichte."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Setzt die Geschichte fort, basierend auf der Benutzereingabe.
   * Sendet die Entscheidung an das Backend ('playTurn') und fügt die neue Seite hinzu.
   */
  const handleContinue = async () => {
    if (!prompt.trim() || !sessionId) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await playTurn(sessionId, prompt.trim());
      const nextPage = mapResponseToPage(
        response.last_narrative,
        response.image_url,
        response.turn_count ?? pages.length + 1
      );

      setPages((prev) => [...prev, nextPage]);
      setCurrentPageIndex((prev) => prev + 1);
      setPrompt("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unbekannter Fehler beim Fortsetzen der Geschichte."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /** Blättert zur nächsten Seite, falls vorhanden. */
  const nextPage = () => {
    if (currentPageIndex < pages.length - 1) setCurrentPageIndex((p) => p + 1);
  };

  /** Blättert zur vorherigen Seite, falls möglich. */
  const prevPage = () => {
    if (currentPageIndex > 0) setCurrentPageIndex((p) => p - 1);
  };

  const currentPage = pages[currentPageIndex];

  // --- Render ---
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 font-sans text-slate-800">
      {/* Navigation Header */}
      <nav className="mb-6 flex w-full max-w-6xl items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xl font-bold text-blue-700">
          <BookOpen className="size-6" />
          <span>AI StoryBuilder</span>
        </div>
        {mode === "reading" && (
          <div className="flex items-center gap-2">
            <span className="mr-2 hidden text-sm text-gray-500 sm:inline-block">
              {storyTitle}
            </span>
            <Button
              color="gray"
              onClick={() => {
                setMode("setup");
              }}
            >
              Neues Buch
            </Button>
          </div>
        )}
      </nav>

      {error && (
        <div className="mb-4 w-full max-w-6xl rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700">
          {error}
        </div>
      )}

      {/* Mode: Setup */}
      {mode === "setup" && (
        <div className="animate-fade-in w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
          <div className="flex h-32 items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
            <Sparkles className="size-12 text-white opacity-80" />
          </div>
          <div className="p-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Erschaffe deine Welt
            </h2>
            <p className="mb-6 text-gray-500">
              Beschreibe kurz das Szenario, das Genre oder die Hauptfigur, um
              deine Geschichte zu beginnen.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Dein Szenario
                </label>
                <TextArea
                  placeholder="Z.B.: Ein Cyberpunk-Detektiv sucht im Jahr 2099 nach einer verlorenen Androiden-Katze..."
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                  }}
                />
              </div>
              <Button
                onClick={handleStart}
                disabled={isGenerating || !prompt}
                className="w-full"
              >
                {isGenerating ? "Initiiere Geschichte..." : "Buch öffnen"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mode: Reading */}
      {mode === "reading" && pages.length > 0 && (
        <div className="flex h-[85vh] w-full max-w-6xl flex-col gap-4">
          {/* Buch Container */}
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-l-md rounded-r-2xl border-l-[12px] border-l-blue-900 bg-white shadow-2xl md:flex-row">
            {/* Schatteneffekt für Buchfalz */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-black/20 to-transparent" />

            {/* LINKE SEITE: Text */}
            <div className="relative flex w-full flex-col overflow-y-auto bg-[#fdfbf7] p-8 text-gray-800 md:w-1/2 md:p-12">
              <div className="flex-1">
                <div className="mb-6 flex items-center justify-between border-b border-gray-300 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Seite {currentPageIndex + 1}
                  </span>
                  <PenTool className="size-4 text-gray-400" />
                </div>

                {/* Story Text */}
                <div className="prose prose-lg animate-fade-in whitespace-pre-wrap text-justify font-serif leading-relaxed">
                  {currentPage.text}
                </div>
              </div>

              {/* Interaktion (Nur letzte Seite) */}
              {currentPageIndex === pages.length - 1 && (
                <div className="mt-8 border-t border-gray-200 bg-[#fdfbf7] pt-6">
                  <label className="mb-2 block text-sm font-medium text-gray-500">
                    Wie geht die Geschichte weiter?
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <TextInput
                        placeholder="Der Held entscheidet sich für..."
                        value={prompt}
                        onChange={(e) => {
                          setPrompt(e.target.value);
                        }}
                        disabled={isGenerating}
                      />
                    </div>
                    <Button
                      onClick={handleContinue}
                      disabled={isGenerating || !prompt}
                    >
                      {isGenerating ? (
                        <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* RECHTE SEITE: Bild */}
            <div className="relative flex w-full items-center justify-center overflow-hidden border-l border-gray-200 bg-gray-100 md:w-1/2">
              {/* Lade-Overlay */}
              {isGenerating && currentPageIndex === pages.length - 1 && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm">
                  <Sparkles className="mb-4 size-12 animate-pulse text-blue-600" />
                  <p className="rounded-full bg-white/50 px-4 py-1 font-medium text-blue-900 backdrop-blur-md">
                    Illustriere Szene...
                  </p>
                </div>
              )}

              <img
                src={
                  currentPage.imageUrl ||
                  "https://placehold.co/600x800?text=Bild+wird+geladen..."
                }
                alt="Story Illustration"
                className="size-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://placehold.co/600x800?text=Bild+wird+geladen...";
                }}
              />

              <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-gray-600 shadow-sm backdrop-blur">
                <ImageIcon className="size-3" />
                <span>AI Generated</span>
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="mx-auto flex w-full max-w-md items-center justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
            <Button
              color="gray"
              onClick={prevPage}
              disabled={currentPageIndex === 0}
              className="!border-0"
            >
              <ChevronLeft className="mr-1 size-5" /> Zurück
            </Button>

            <span className="font-mono text-sm text-gray-500">
              {currentPageIndex + 1} / {pages.length}
            </span>

            <Button
              color="gray"
              onClick={nextPage}
              disabled={currentPageIndex === pages.length - 1}
              className="!border-0"
            >
              Weiter <ChevronRight className="ml-1 size-5" />
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Custom Scrollbar für die Buchseite */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1; 
        }
        ::-webkit-scrollbar-thumb {
          background: #d1d5db; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; 
        }
      `}</style>
    </div>
  );
}

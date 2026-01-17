"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PenTool, Image as ImageIcon, Send, Sparkles, BookOpen } from 'lucide-react';

import { startGame, playTurn } from "../../services/storyService";
import { PageData } from "../../shared/types/types";

// --- UI Komponenten (Flowbite-Simulation) ---

const Button = ({ children, onClick, disabled, className = "", color = "blue" }) => {
  const baseStyle = "group flex items-center justify-center p-0.5 text-center font-medium relative focus:z-10 focus:outline-none transition-all duration-200";
  const colorStyles = {
    blue: "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-lg",
    gray: "text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 rounded-lg",
    dark: "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded-lg"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyle} ${colorStyles[color]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="flex items-center gap-2 px-5 py-2.5">
        {children}
      </span>
    </button>
  );
};

const TextInput = ({ placeholder, value, onChange, disabled }) => (
  <input
    type="text"
    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
  />
);

const TextArea = ({ placeholder, value, onChange, rows = 4 }) => (
  <textarea
    rows={rows}
    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
);

// --- Hauptanwendung ---

export default function WelcomePage() {
  // --- State ---
  const [mode, setMode] = useState<'setup' | 'reading'>('setup');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Story Daten
  const [storyTitle, setStoryTitle] = useState('');
  const [pages, setPages] = useState<PageData[]>([]);

  // --- Daten aus echtem Backend ---
  const mapResponseToPage = (lastNarrative: string, imageUrl: string | null, turn: number): PageData => ({
    text: lastNarrative ?? '',
    imageUrl: imageUrl ?? null,
    turn: turn ?? pages.length + 1,
  });

  const buildInitialPages = (response: Awaited<ReturnType<typeof startGame>>): PageData[] => {
    if (Array.isArray(response.history) && response.history.length > 0) {
      return response.history.map((text, index) => mapResponseToPage(text, index === response.history.length - 1 ? response.image_url : null, index + 1));
    }
    return [mapResponseToPage(response.last_narrative, response.image_url, response.turn_count ?? 1)];
  };

  const handleStart = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await startGame(prompt.trim());
      const initialPages = buildInitialPages(response);

      setPages(initialPages);
      setStoryTitle(prompt.trim().split(' ').slice(0, 4).join(' ') + '...');
      setSessionId(response.session_id ?? null);
      setMode('reading');
      setCurrentPageIndex(0);
      setPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler beim Starten der Geschichte.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = async () => {
    if (!prompt.trim() || !sessionId) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await playTurn(sessionId, prompt.trim());
      const nextPage = mapResponseToPage(response.last_narrative, response.image_url, response.turn_count ?? pages.length + 1);

      setPages(prev => [...prev, nextPage]);
      setCurrentPageIndex(prev => prev + 1);
      setPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler beim Fortsetzen der Geschichte.');
    } finally {
      setIsGenerating(false);
    }
  };

  const nextPage = () => {
    if (currentPageIndex < pages.length - 1) setCurrentPageIndex(p => p + 1);
  };

  const prevPage = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(p => p - 1);
  };

  const currentPage = pages[currentPageIndex];

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      
      {/* Navigation Header */}
      <nav className="w-full max-w-6xl mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 text-blue-700 font-bold text-xl">
          <BookOpen className="w-6 h-6" />
          <span>AI StoryBuilder</span>
        </div>
        {mode === 'reading' && (
          <div className="flex gap-2 items-center">
            <span className="hidden sm:inline-block text-sm text-gray-500 mr-2">
              {storyTitle}
            </span>
            <Button color="gray" onClick={() => setMode('setup')}>Neues Buch</Button>
          </div>
        )}
      </nav>

      {error && (
        <div className="w-full max-w-6xl mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Mode: Setup */}
      {mode === 'setup' && (
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="text-white w-12 h-12 opacity-80" />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Erschaffe deine Welt</h2>
            <p className="text-gray-500 mb-6">Beschreibe kurz das Szenario, das Genre oder die Hauptfigur, um deine Geschichte zu beginnen.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">Dein Szenario</label>
                <TextArea 
                  placeholder="Z.B.: Ein Cyberpunk-Detektiv sucht im Jahr 2099 nach einer verlorenen Androiden-Katze..." 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <Button onClick={handleStart} disabled={isGenerating || !prompt} className="w-full">
                {isGenerating ? 'Initiiere Geschichte...' : 'Buch öffnen'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mode: Reading */}
      {mode === 'reading' && pages.length > 0 && (
        <div className="flex flex-col w-full max-w-6xl h-[85vh] gap-4">
          
          {/* Buch Container */}
          <div className="flex-1 bg-white rounded-r-2xl rounded-l-md shadow-2xl overflow-hidden flex flex-col md:flex-row border-l-[12px] border-l-blue-900 relative">
            {/* Schatteneffekt für Buchfalz */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10"></div>
            
            {/* LINKE SEITE: Text */}
            <div className="w-full md:w-1/2 p-8 md:p-12 bg-[#fdfbf7] text-gray-800 overflow-y-auto relative flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6 border-b border-gray-300 pb-2">
                  <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Seite {currentPageIndex + 1}</span>
                  <PenTool className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Story Text */}
                <div className="prose prose-lg font-serif leading-relaxed text-justify whitespace-pre-wrap animate-fade-in">
                  {currentPage.text}
                </div>
              </div>

              {/* Interaktion (Nur letzte Seite) */}
              {currentPageIndex === pages.length - 1 && (
                <div className="mt-8 pt-6 border-t border-gray-200 bg-[#fdfbf7]">
                  <label className="block mb-2 text-sm font-medium text-gray-500">Wie geht die Geschichte weiter?</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <TextInput 
                        placeholder="Der Held entscheidet sich für..." 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isGenerating}
                      />
                    </div>
                    <Button onClick={handleContinue} disabled={isGenerating || !prompt}>
                      {isGenerating ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* RECHTE SEITE: Bild */}
            <div className="w-full md:w-1/2 bg-gray-100 relative overflow-hidden flex items-center justify-center border-l border-gray-200">
              {/* Lade-Overlay */}
              {isGenerating && currentPageIndex === pages.length - 1 && (
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <Sparkles className="w-12 h-12 text-blue-600 animate-pulse mb-4" />
                  <p className="text-blue-900 font-medium bg-white/50 px-4 py-1 rounded-full backdrop-blur-md">Illustriere Szene...</p>
                </div>
              )}
              
              <img 
                src={currentPage.imageUrl || 'https://placehold.co/600x800?text=Bild+wird+geladen...'} 
                alt="Story Illustration" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/600x800?text=Bild+wird+geladen...';
                }}
              />
              
              <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                <span>AI Generated</span>
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center px-4 py-2 bg-white rounded-lg shadow-sm mx-auto w-full max-w-md">
            <Button 
              color="gray" 
              onClick={prevPage} 
              disabled={currentPageIndex === 0}
              className="!border-0"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Zurück
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
              Weiter <ChevronRight className="w-5 h-5 ml-1" />
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

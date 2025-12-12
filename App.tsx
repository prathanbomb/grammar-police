import React, { useState } from 'react';
import { Tone, Dialect, GrammarResponse } from './types';
import { correctGrammar } from './services/geminiService';
import { ToneSelector } from './components/ToneSelector';
import { DialectSelector } from './components/DialectSelector';
import { ResultView } from './components/ResultView';
import { RichTextEditor } from './components/RichTextEditor';
import { BookOpen, PenTool, Eraser, Search, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedTone, setSelectedTone] = useState<Tone>(Tone.ORIGINAL);
  const [selectedDialect, setSelectedDialect] = useState<Dialect>(Dialect.BRITISH);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrammarResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCorrect = async () => {
    // Strip HTML tags to check if empty
    const plainText = inputText.replace(/<[^>]*>/g, '').trim();
    if (!plainText) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await correctGrammar(inputText, selectedTone, selectedDialect);
      setResult(response);
    } catch (err) {
      setError("The connection to Scotland Yard failed. Please ensure your API key is correct and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  const hasContent = inputText.replace(/<[^>]*>/g, '').trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-royal-200 selection:text-royal-900 pb-12">
      
      {/* Header */}
      <header className="bg-royal-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-guardsman-600 via-white to-royal-500 opacity-80"></div>
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="bg-royal-800 p-3 rounded-full mb-4 ring-4 ring-royal-700/50 shadow-lg">
               <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight mb-2">
              The Royal <span className="text-royal-200">Grammar Police</span>
            </h1>
            <p className="text-royal-100 text-lg max-w-2xl font-light">
              Refining your prose with elegance and strict adherence to the Queen's (or Uncle Sam's) English.
            </p>
          </div>
        </div>
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-guardsman-600 opacity-10 rounded-full blur-3xl"></div>
      </header>

      <main className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input - Sticky on Desktop */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8 transition-all">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                 <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <PenTool className="w-5 h-5 text-royal-600" />
                  Your Text
                 </h2>
                 <div className="flex items-center gap-3">
                   {hasContent && (
                      <button onClick={handleClear} className="text-sm text-gray-500 hover:text-guardsman-600 flex items-center gap-1 transition-colors">
                        <Eraser className="w-4 h-4" /> Clear
                      </button>
                   )}
                   <div className="w-px h-4 bg-gray-200 mx-1 hidden sm:block"></div>
                   <DialectSelector 
                      selectedDialect={selectedDialect}
                      onSelect={setSelectedDialect}
                      disabled={loading}
                   />
                 </div>
              </div>

              <RichTextEditor
                value={inputText}
                onChange={setInputText}
                placeholder="Type or paste your text here to be inspected..."
                disabled={loading}
                className="h-64 lg:h-96"
              />
              
              <div className="mt-6">
                <ToneSelector 
                  selectedTone={selectedTone} 
                  onSelect={setSelectedTone}
                  disabled={loading}
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={handleCorrect}
                  disabled={!hasContent || loading}
                  className={`
                    w-full py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-md
                    ${!hasContent || loading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-royal-800 hover:bg-royal-700 text-white hover:shadow-lg hover:-translate-y-0.5'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Inspecting...
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6" />
                      Inspect & Improve
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Mobile-only hint */}
            <p className="text-center text-xs text-gray-400 lg:hidden">
              Scroll down for results after inspection
            </p>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 w-full">
             {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-start gap-3 mb-6 animate-pulse">
                  <span className="font-bold text-xl">!</span>
                  <p>{error}</p>
                </div>
             )}

             {result ? (
               <ResultView result={result} dialect={selectedDialect} />
             ) : (
               <div className="h-full min-h-[300px] lg:min-h-[600px] flex flex-col items-center justify-center text-center p-8 bg-white/50 border-2 border-dashed border-gray-200 rounded-xl">
                 <div className="bg-royal-50 p-6 rounded-full mb-4">
                    <img 
                      src="https://picsum.photos/200/200?grayscale" 
                      alt="Placeholder" 
                      className="w-24 h-24 object-cover rounded-full opacity-20 mix-blend-multiply" 
                    />
                 </div>
                 <h3 className="text-xl font-serif text-gray-400 font-medium">Awaiting Inspection</h3>
                 <p className="text-gray-400 mt-2 max-w-sm">
                   Submit your text to receive the {selectedDialect === Dialect.BRITISH ? "Chief Inspector's" : "Sheriff's"} corrections and remarks.
                 </p>
               </div>
             )}
          </div>

        </div>
      </main>
      
      <footer className="mt-12 text-center text-gray-400 text-sm font-light">
        <p>© {new Date().getFullYear()} The Royal Grammar Police. God Save the Text.</p>
      </footer>
    </div>
  );
};

export default App;
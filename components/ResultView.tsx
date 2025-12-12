import React from 'react';
import { GrammarResponse, Dialect } from '../types';
import { Check, Copy, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface ResultViewProps {
  result: GrammarResponse;
  dialect: Dialect;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, dialect }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Create a temporary element to extract text while preserving line breaks somewhat gracefully
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = result.rewrittenText;
    const text = tempDiv.innerText;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reportTitle = dialect === Dialect.BRITISH 
    ? "Chief Inspector's Report" 
    : "Sheriff's Report";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Feedback Banner */}
      <div className="bg-royal-50 border-l-4 border-royal-600 p-4 rounded-r-lg shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-royal-100 p-2 rounded-full">
             <Sparkles className="w-5 h-5 text-royal-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-royal-900 uppercase tracking-wider mb-1">
              {reportTitle}
            </h3>
            <p className="text-royal-800 italic font-serif text-lg">"{result.feedback}"</p>
          </div>
        </div>
      </div>

      {/* Main Rewritten Text */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-royal-400 via-royal-600 to-guardsman-600"></div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-serif font-bold text-gray-900">Improved Version</h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-royal-700 bg-gray-50 hover:bg-royal-50 rounded-md transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          
          <RichTextEditor 
            value={result.rewrittenText}
            onChange={() => {}} 
            readOnly={true}
            className="h-[400px]"
            placeholder="Result will appear here..."
          />
        </div>
      </div>

      {/* Changes List */}
      {result.corrections.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
           <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-guardsman-600" />
            Corrections & Improvements
          </h3>
          <div className="space-y-4">
            {result.corrections.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 p-5 rounded-lg bg-gray-50 border border-gray-100 hover:border-royal-200 transition-colors">
                
                {/* Left Side: What changed */}
                <div className="md:w-1/3 flex-shrink-0">
                   <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {item.type}
                      </span>
                   </div>
                   <div className="flex flex-col gap-1.5">
                      <div className="line-through text-guardsman-600/80 text-sm break-words">{item.original}</div>
                      <div className="font-bold text-royal-800 text-base break-words flex items-center gap-2">
                        {item.correction}
                      </div>
                   </div>
                </div>

                {/* Right Side: Why and Examples */}
                <div className="md:w-2/3 border-l-2 border-royal-200 pl-4 md:pl-6 flex flex-col justify-center">
                  <p className="text-sm text-gray-700 italic mb-3">
                    "{item.explanation}"
                  </p>
                  
                  {item.examples && item.examples.length > 0 && (
                    <div className="bg-white rounded-md p-3 border border-royal-100">
                      <h4 className="flex items-center gap-1.5 text-xs font-bold text-royal-600 uppercase tracking-wide mb-2">
                        <BookOpen className="w-3 h-3" /> Correct Usage Examples
                      </h4>
                      <ul className="space-y-1.5">
                        {item.examples.map((ex, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-royal-400 mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0"></span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
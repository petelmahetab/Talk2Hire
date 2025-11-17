import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { LANGUAGE_CONFIG } from "../data/problems";
import { useEffect, useState } from "react";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
}) {
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    console.log('📝 CodeEditorPanel updated:', {
      selectedLanguage,
      codeLength: code?.length || 0,
      hasCode: !!code,
      isEditorReady,
    });
  }, [selectedLanguage, code, isEditorReady]);

  // ✅ Fallback empty code for testing
  const displayCode = code || `// ${LANGUAGE_CONFIG[selectedLanguage]?.name || 'Code'} Editor
// Write your solution here
console.log("Hello, World!");`;

  return (
    <div className="h-full bg-base-300 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-t border-base-300">
        <div className="flex items-center gap-3">
          <img
            src={LANGUAGE_CONFIG[selectedLanguage]?.icon}
            alt={LANGUAGE_CONFIG[selectedLanguage]?.name}
            className="size-6"
          />
          <select 
            className="select select-sm" 
            value={selectedLanguage} 
            onChange={onLanguageChange}
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          className="btn btn-primary btn-sm gap-2" 
          disabled={isRunning} 
          onClick={onRunCode}
        >
          {isRunning ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayIcon className="size-4" />
              Run Code
            </>
          )}
        </button>
      </div>

      <div className="flex-1 relative">
        {!isEditorReady && code && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-300 z-10">
            <div className="text-center">
              <Loader2Icon className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-base-content/60">Loading editor...</p>
            </div>
          </div>
        )}
        
        <Editor
          height={"100%"}
          language={LANGUAGE_CONFIG[selectedLanguage]?.monacoLang}
          value={displayCode}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 16,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
          }}
          onMount={() => {
            console.log('✅ Editor mounted');
            setIsEditorReady(true);
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditorPanel;
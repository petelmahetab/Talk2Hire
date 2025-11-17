import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon } from "lucide-react";

function ProblemDescription({ problemData, session, isHost, isParticipant, isEndingSession, onEndSession, onLeaveSession }) {
  // ✅ Safety checks
  if (!problemData || !session) {
    return (
      <div className="h-full flex items-center justify-center bg-base-200">
        <div className="text-center">
          <Loader2Icon className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
          <p className="text-base-content/60">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-base-200">
      {/* HEADER SECTION */}
      <div className="p-6 bg-base-100 border-b border-base-300">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-base-content">
              {problemData.title}
            </h1>
            {problemData.category && (
              <p className="text-base-content/60 mt-1">{problemData.category}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge badge-lg ${getDifficultyBadgeClass(problemData.difficulty)}`}>
              {problemData.difficulty?.charAt(0).toUpperCase() + problemData.difficulty?.slice(1)}
            </span>
            
            {/* ✅ HOST: END SESSION BUTTON */}
            {isHost && session?.status === "active" && (
              <button
                onClick={onEndSession}
                disabled={isEndingSession}
                className="btn btn-error btn-sm gap-2"
              >
                {isEndingSession ? (
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOutIcon className="w-4 h-4" />
                )}
                End Session
              </button>
            )}
            
            {/* ✅ PARTICIPANT: LEAVE SESSION BUTTON */}
            {isParticipant && session?.status === "active" && (
              <button
                onClick={onLeaveSession}
                className="btn btn-warning btn-sm gap-2"
              >
                <LogOutIcon className="w-4 h-4" />
                Leave Session
              </button>
            )}
            
            {session?.status === "completed" && (
              <span className="badge badge-ghost badge-lg">Completed</span>
            )}
          </div>
        </div>

        {/* Session Info */}
        <p className="text-base-content/60 mt-2">
          Host: {session?.host?.name || "Loading..."} •{" "}
          {session?.participant ? 2 : 1}/2 participants
        </p>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-6 space-y-6">
        {/* DESCRIPTION */}
        {problemData.description && (
          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
            <h2 className="text-xl font-bold text-base-content mb-3">Description</h2>
            <div className="space-y-3 text-base leading-relaxed">
              {/* Handle both string and object descriptions */}
              {typeof problemData.description === "string" ? (
                <p className="text-base-content/90">{problemData.description}</p>
              ) : (
                <>
                  <p className="text-base-content/90">{problemData.description.text}</p>
                  {problemData.description.notes && problemData.description.notes.length > 0 && (
                    problemData.description.notes.map((note, idx) => (
                      <p key={idx} className="text-base-content/90">
                        {note}
                      </p>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* EXAMPLES SECTION */}
        {problemData.examples && problemData.examples.length > 0 && (
          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
            <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>
            <div className="space-y-4">
              {problemData.examples.map((example, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-sm">{idx + 1}</span>
                    <p className="font-semibold text-base-content">Example {idx + 1}</p>
                  </div>
                  <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                    <div className="flex gap-2">
                      <span className="text-primary font-bold min-w-[70px]">Input:</span>
                      <span className="text-base-content">{example.input}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-secondary font-bold min-w-[70px]">Output:</span>
                      <span className="text-base-content">{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div className="pt-2 border-t border-base-300 mt-2">
                        <span className="text-base-content/60 font-sans text-xs">
                          <span className="font-semibold">Explanation:</span> {example.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONSTRAINTS SECTION */}
        {problemData.constraints && problemData.constraints.length > 0 && (
          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
            <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
            <ul className="space-y-2 text-base-content/90">
              {problemData.constraints.map((constraint, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <code className="text-sm">{constraint}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* LOADING STATE */}
        {!problemData.description && !problemData.examples && (
          <div className="text-center py-8">
            <Loader2Icon className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
            <p className="text-base-content/60">Loading problem details...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemDescription;
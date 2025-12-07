// src/pages/ProblemsPage.jsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PROBLEMS } from "../data/problems";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Code2Icon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const problems = Object.values(PROBLEMS);

  // Filters & Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

  // Filter problems based on search + difficulty
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesDifficulty =
        selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;

      const matchesSearch =
        searchQuery === "" ||
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDifficulty && matchesSearch;
    });
  }, [problems, selectedDifficulty, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProblems = filteredProblems.slice(startIndex, endIndex);

  // Reset page when filters change
  const resetPage = () => setCurrentPage(1);

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
    resetPage();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    resetPage();
  };

  // Stats
  const stats = {
    total: problems.length,
    easy: problems.filter((p) => p.difficulty === "Easy").length,
    medium: problems.filter((p) => p.difficulty === "Medium").length,
    hard: problems.filter((p) => p.difficulty === "Hard").length,
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
          <p className="text-base-content/70">
            Master coding interviews with {problems.length} hand-picked problems
          </p>
        </div>

        {/* Search + Filters */}
        <div className="card bg-base-100 shadow-lg mb-8">
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Search by title or category..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>

              {/* Difficulty Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleDifficultyChange("All")}
                  className={`btn btn-sm ${
                    selectedDifficulty === "All" ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  All ({filteredProblems.length})
                </button>
                <button
                  onClick={() => handleDifficultyChange("Easy")}
                  className={`btn btn-sm ${
                    selectedDifficulty === "Easy" ? "btn-success" : "btn-ghost"
                  }`}
                >
                  Easy ({stats.easy})
                </button>
                <button
                  onClick={() => handleDifficultyChange("Medium")}
                  className={`btn btn-sm ${
                    selectedDifficulty === "Medium" ? "btn-warning" : "btn-ghost"
                  }`}
                >
                  Medium ({stats.medium})
                </button>
                <button
                  onClick={() => handleDifficultyChange("Hard")}
                  className={`btn btn-sm ${
                    selectedDifficulty === "Hard" ? "btn-error" : "btn-ghost"
                  }`}
                >
                  Hard ({stats.hard})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        {currentProblems.length === 0 ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center py-20">
              <Code2Icon className="w-20 h-20 mx-auto text-base-content/20 mb-4" />
              <h3 className="text-2xl font-bold mb-2">No problems found</h3>
              <p className="text-base-content/60">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {currentProblems.map((problem) => (
                <Link
                  key={problem.id}
                  to={`/problem/${problem.id}`}
                  className="block card bg-base-100 hover:scale-[1.01] hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  <div className="card-body">
                    <div className="flex items-center justify-between gap-6">
                      {/* Left Side */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Code2Icon className="size-8 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h2 className="text-2xl font-bold text-base-content">
                                {problem.title}
                              </h2>
                              <span
                                className={`badge badge-lg ${getDifficultyBadgeClass(
                                  problem.difficulty
                                )}`}
                              >
                                {problem.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-base-content/60">
                              {problem.category}
                            </p>
                          </div>
                        </div>
                        <p className="text-base-content/80 line-clamp-2">
                          {problem.description.text}
                        </p>
                      </div>

                      {/* Right Side - Arrow */}
                      <div className="flex items-center gap-3 text-primary">
                        <span className="font-semibold text-lg hidden sm:block">
                          Solve Now
                        </span>
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-base-content/70">
                      Showing {startIndex + 1}–{Math.min(endIndex, filteredProblems.length)} of{" "}
                      {filteredProblems.length} problems
                    </p>

                    <div className="join">
                      <button
                        className="join-item btn btn-sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          className={`join-item btn btn-sm ${
                            currentPage === i + 1 ? "btn-primary" : ""
                          }`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        className="join-item btn btn-sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats Footer */}
        <div className="mt-12 card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-6 text-center">Problem Stats</h3>
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
              <div className="stat place-items-center">
                <div className="stat-title">Total Problems</div>
                <div className="stat-value text-primary">{stats.total}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Easy</div>
                <div className="stat-value text-success">{stats.easy}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Medium</div>
                <div className="stat-value text-warning">{stats.medium}</div>
              </div>
              <div className="stat place-items-center">
                <div className="stat-title">Hard</div>
                <div className="stat-value text-error">{stats.hard}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemsPage;
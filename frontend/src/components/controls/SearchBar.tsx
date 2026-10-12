"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Sparkles, X, ChevronRight } from "lucide-react";
import { SearchResultItem } from "@/lib/types";

interface SearchBarProps {
  searchQuery: string;
  searchResults: SearchResultItem[];
  isSearching: boolean;
  onSearch: (q: string) => void;
  onSelectHotspot: (item: SearchResultItem) => void;
}

export function SearchBar({
  searchQuery,
  searchResults,
  isSearching,
  onSearch,
  onSelectHotspot,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResultItem) => {
    onSelectHotspot(item);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-accent-cyan pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by event ('shrinking lakes', 'deforestation') or location..."
          className="w-full pl-10 pr-10 py-2.5 bg-surface/90 border border-border/80 focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan rounded-xl text-sm placeholder-slate-400 text-slate-100 transition-all shadow-lg backdrop-blur-md"
        />
        {searchQuery ? (
          <button
            onClick={() => {
              onSearch("");
              setIsOpen(false);
            }}
            className="absolute right-3 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span className="absolute right-3 hidden sm:flex items-center gap-1 text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
            <Sparkles className="w-3 h-3 text-accent-cyan" /> 50+ Presets
          </span>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-surface/95 border border-border rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-[420px] overflow-y-auto">
          <div className="p-2 border-b border-border/50 text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>REVERSE "FIND-THE-CHANGE" HOTSPOTS</span>
            {isSearching && (
              <span className="text-accent-cyan flex items-center gap-1">
                Searching...
              </span>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">
              No matching hotspots found. Try "water", "forest", "urban", or a city name.
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-3 hover:bg-slate-800/80 transition-colors flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-slate-800/60 text-accent-cyan border border-slate-700 group-hover:border-accent-cyan/50 mt-0.5 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-100 truncate group-hover:text-accent-cyan transition-colors">
                        {item.name}
                      </span>
                      <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {item.default_index}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                      <span className="font-mono text-accent-emerald font-semibold">
                        {item.preview_delta}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{item.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 self-center shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

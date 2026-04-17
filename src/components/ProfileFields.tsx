import React, { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function CategorySelector({ value, onChange, error, required }: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex justify-between">
        Мэргэжлийн ангилал {required && <span className="text-danger">*</span>}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-slate-50 border rounded-xl py-3 px-4 text-left flex justify-between items-center transition-all",
          isOpen ? "border-aurora-blue ring-4 ring-aurora-blue/5" : "border-slate-200",
          error && "border-danger ring-danger/5"
        )}
      >
        <span className={cn("text-sm", !value && "text-slate-400")}>
          {value || "Ангилал сонгох"}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {error && <p className="text-[10px] text-danger mt-1">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="Хайх..."
                  className="w-full bg-slate-50 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:ring-0 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onChange(cat);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex justify-between items-center transition-colors"
                  >
                    <span className={cn(value === cat && "text-aurora-blue font-bold")}>{cat}</span>
                    {value === cat && <Check className="w-4 h-4 text-aurora-blue" />}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">Илэрц олдсонгүй</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SkillsInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  suggestions?: string[];
}

export function SkillsInput({ skills, onChange, suggestions = [] }: SkillsInputProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(input.toLowerCase()) && !skills.includes(s)
  ).slice(0, 5);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && skills.length < 5 && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter(s => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(input);
    } else if (e.key === 'Backspace' && !input && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  return (
    <div className="space-y-2 relative">
      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex justify-between">
        Ур чадвар / Үйлчилгээ (Макс 5)
        <span className="text-slate-300">{skills.length}/5</span>
      </label>

      <div className={cn(
        "flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:border-aurora-blue focus-within:ring-4 focus-within:ring-aurora-blue/5",
        skills.length >= 5 && "opacity-80"
      )}>
        {skills.map((skill) => (
          <span 
            key={skill}
            className="flex items-center gap-1.5 bg-aurora-blue/10 text-aurora-blue px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            {skill}
            <button 
              type="button"
              onClick={() => removeSkill(skill)}
              className="hover:text-danger hover:scale-110 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        {skills.length < 5 && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={skills.length === 0 ? "Жишээ: React, Logo Design..." : ""}
            className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] py-1"
          />
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && input && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          >
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { XCircle } from 'lucide-react';

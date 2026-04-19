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
    <div className="space-y-4 relative group" ref={containerRef}>
      <label className="text-[14px] font-semibold text-[#888]">
        Мэргэжлийн ангилал {required && <span className="text-red-500">*</span>}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-[#fafafa]/50 border rounded-xl py-3 px-4 text-left flex justify-between items-center transition-all duration-200",
          isOpen ? "border-[#6366f1] ring-2 ring-[#6366f1]/10 bg-white" : "border-[#f0f0f0] hover:border-[#ddd]",
          error && "border-red-500 ring-red-500/10"
        )}
      >
        <span className={cn("text-[15px] font-medium", !value ? "text-[#bbb]" : "text-[#111]")}>
          {value || "Ангилал сонгох"}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-[#888] transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            className="absolute z-50 w-full mt-2 bg-white border border-[#f0f0f0] rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-[#f0f0f0]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
                <input
                  type="text"
                  placeholder="Хайх..."
                  className="w-full bg-[#fafafa] border-none rounded-lg py-1.5 pl-9 pr-4 text-[13px] focus:ring-0 outline-none placeholder:text-[#bbb]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
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
                    className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#f4f4f0] rounded-md flex justify-between items-center transition-colors font-medium text-[#555] hover:text-[#111]"
                  >
                    <span className={cn(value === cat && "text-[#6366f1] font-semibold")}>{cat}</span>
                    {value === cat && <Check className="w-4 h-4 text-[#6366f1]" />}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-[12px] text-[#bbb]">Илэрц олдсонгүй</div>
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
    <div className="space-y-4 relative group">
      <label className="text-[14px] font-semibold text-[#888]">
        Чадвар (хамгийн ихдээ 5)
      </label>
      <div className={cn(
        "flex flex-wrap gap-2.5 p-4 bg-white border border-[#f0f0f0] rounded-xl transition-all duration-200 focus-within:border-[#6366f1] focus-within:ring-2 focus-within:ring-[#6366f1]/10 min-h-[56px]",
        skills.length >= 5 && "cursor-not-allowed"
      )}>
        {skills.map((skill) => (
          <motion.span 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={skill}
            className="flex items-center gap-2 bg-[#f0f2ff] text-[#6366f1] px-3 py-1.5 rounded-lg text-[13px] font-bold"
          >
            {skill}
            <button 
              type="button"
              onClick={() => removeSkill(skill)}
              className="hover:scale-110 transition-transform opacity-60 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.span>
        ))}
        {skills.length < 5 && (
          <div className="flex-1 flex items-center min-w-[140px]">
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
              placeholder={skills.length === 0 ? "Жишээ: Web Design, AI..." : "нэмэх..."}
              className="w-full bg-transparent border-none outline-none text-[14px] font-medium py-1 placeholder:text-[#bbb]"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-medium text-[#bbb] px-1">
        <span>Enter дарж нэмнэ</span>
        <span className={cn(skills.length >= 5 ? "text-red-500" : "")}>{skills.length} / 5</span>
      </div>

      <AnimatePresence>
        {showSuggestions && input && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            className="absolute z-50 w-full mt-2 bg-white border border-[#f0f0f0] rounded-xl shadow-xl overflow-hidden p-1"
          >
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="w-full text-left px-3 py-2 text-[12px] hover:bg-[#f4f4f0] rounded-md transition-colors font-medium text-[#555]"
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

import { X } from 'lucide-react';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một mục...',
  label,
  id,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

  const reactId = useId();
  const selectId = id || `select-${reactId.replace(/[:]/g, '')}`;
  const listboxId = `${selectId}-listbox`;
  const labelId = `${selectId}-label`;

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  // Sync optionsRef length
  optionsRef.current = optionsRef.current.slice(0, options.length);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll active option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [isOpen, highlightedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        } else {
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : options.length - 1);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      }
      case 'Home': {
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;
      }
      case 'End': {
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(options.length - 1);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
            setHighlightedIndex(-1);
            triggerRef.current?.focus();
          }
        } else {
          setIsOpen(true);
          setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
        }
        break;
      }
      case 'Escape': {
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          triggerRef.current?.focus();
        }
        break;
      }
      case 'Tab': {
        if (isOpen) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label
          id={labelId}
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-300 mb-1.5 block"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-labelledby={label ? `${labelId} ${selectId}` : undefined}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0
            ? `${listboxId}-opt-${highlightedIndex}`
            : undefined
        }
        onClick={() => {
          if (disabled) return;
          if (!isOpen) {
            setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
          } else {
            setHighlightedIndex(-1);
          }
          setIsOpen(!isOpen);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full px-4 py-2.5 rounded-xl bg-surface-light border transition-all flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isOpen
            ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/30'
            : 'border-border-subtle hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {selectedOption?.icon && (
            <span className="text-primary flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className={`text-xs font-semibold flex-shrink-0 ${selectedOption ? 'text-white' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.subLabel && (
            <span className="text-[11px] text-slate-400 truncate">
              • {selectedOption.subLabel}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={label ? labelId : undefined}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined
          }
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-surface/95 backdrop-blur-xl border border-border-subtle shadow-2xl p-1.5 scrollbar-none animate-fade-in focus:outline-none"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;
            return (
              <div
                key={option.value}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                ref={(el) => (optionsRef.current[index] = el)}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setHighlightedIndex(-1);
                  triggerRef.current?.focus();
                }}
                className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors text-xs ${
                  isSelected
                    ? 'bg-primary/15 text-primary font-bold'
                    : isHighlighted
                    ? 'bg-slate-800 text-white ring-1 ring-primary/40'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                } ${isHighlighted && isSelected ? 'ring-1 ring-primary/70' : ''}`}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon && (
                    <span className="flex-shrink-0">{option.icon}</span>
                  )}
                  <span className="truncate">{option.label}</span>
                  {option.subLabel && (
                    <span className="text-[10px] text-slate-400 truncate">
                      • {option.subLabel}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 ml-2" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

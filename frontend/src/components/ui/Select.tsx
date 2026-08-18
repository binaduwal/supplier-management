import { ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: ReadonlyArray<SelectOption>;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
}

export function Select({
  label,
  value,
  onChange,
  onBlur,
  options,
  error,
  placeholder = "Select an option",
  disabled = false,
  name,
}: SelectProps) {
  const generatedId = useId();
  const inputId = name ?? generatedId;
  const listId = `${inputId}-list`;
  const errorId = error ? `${inputId}-error` : undefined;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(term),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery("");
        onBlur?.();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onBlur]);

  const selectOption = (option: SelectOption) => {
    onChange(option.value);
    setQuery("");
    setOpen(false);
    onBlur?.();
  };

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          disabled={disabled}
          placeholder={placeholder}
          value={open ? query : (selected?.label ?? "")}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
              setQuery("");
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) =>
                Math.min(index + 1, Math.max(filtered.length - 1, 0)),
              );
              return;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
              return;
            }
            if (event.key === "Enter" && open && filtered[activeIndex]) {
              event.preventDefault();
              selectOption(filtered[activeIndex]);
            }
          }}
          className={`min-h-10 w-full cursor-pointer rounded-lg border bg-white py-2 pr-9 pl-3 text-sm text-slate-900 ${
            error ? "border-red-600" : "border-slate-300"
          }`}
        />
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        {open ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute top-full right-0 left-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-md"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">
                No matches found
              </li>
            ) : (
              filtered.map((option, index) => (
                <li key={option.value} role="option" aria-selected={option.value === value}>
                  <button
                    type="button"
                    className={`flex w-full cursor-pointer px-3 py-2 text-left text-sm ${
                      index === activeIndex
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

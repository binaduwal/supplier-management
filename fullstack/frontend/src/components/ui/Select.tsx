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
  const inputId = generatedId;
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

    const startsWithTerm: SelectOption[] = [];
    const wordStartsWith: SelectOption[] = [];
    const containsTerm: SelectOption[] = [];

    for (const option of options) {
      const label = option.label.toLowerCase();
      if (label.startsWith(term)) {
        startsWithTerm.push(option);
      } else if (label.split(/[\s-]+/).some((word) => word.startsWith(term))) {
        wordStartsWith.push(option);
      } else if (label.includes(term)) {
        containsTerm.push(option);
      }
    }

    return [...startsWithTerm, ...wordStartsWith, ...containsTerm];
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
    <div className="field" ref={containerRef}>
      <label htmlFor={inputId}>{label}</label>
      <div className="select">
        <input
          id={inputId}
          name={name ? `${name}-search` : undefined}
          className={error ? "select__input select__input--error" : "select__input"}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
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
        />
        <span className="select__chevron" aria-hidden="true" />
        {open ? (
          <ul id={listId} role="listbox" className="select__list">
            {filtered.length === 0 ? (
              <li className="select__empty">No matches found</li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <button
                    type="button"
                    className={
                      index === activeIndex
                        ? "select__option select__option--active"
                        : "select__option"
                    }
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
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

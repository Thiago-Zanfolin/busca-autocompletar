import { useState, useRef, useId } from "react";
import { useSuggestions } from "./useSuggestions";
import { splitMatch } from "./highlight";
import "./App.css";

function Suggestion({ text, term }) {
  const [match, rest] = splitMatch(text, term);
  return (
    <>
      <strong>{match}</strong>
      {rest}
    </>
  );
}

export default function App() {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { suggestions, error } = useSuggestions(term);
  const inputRef = useRef(null);
  const listId = useId();

  const visible = open ? suggestions : [];

  function select(value) {
    setTerm(value);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleChange(event) {
    setTerm(event.target.value);
    setOpen(true);
    setActiveIndex(-1);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (visible.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % visible.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? visible.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      select(visible[activeIndex]);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Busca com Autocompletar</h1>
        <p className="subtitle">Digite no campo abaixo para exibir as sugestões</p>

        <div className="search-row">
          <div className="field">
            <input
              ref={inputRef}
              type="text"
              value={term}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ex.: direito do"
              autoComplete="off"
              role="combobox"
              aria-expanded={visible.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
            />

            {/* Requisito: se não há sugestões, nada é renderizado abaixo. */}
            {visible.length > 0 && (
              <ul className="suggestions" id={listId} role="listbox">
                {visible.map((item, index) => (
                  <li
                    key={item}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={index === activeIndex ? "is-active" : ""}
                    // onMouseDown em vez de onClick: o clique dispara antes
                    // do blur do input, evitando que a lista feche antes.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      select(item);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className="icon" aria-hidden="true">⌕</span>
                    <span className="text">
                      <Suggestion text={item} term={term} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="button" className="submit">BUSCAR</button>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
      </section>
    </main>
  );
}

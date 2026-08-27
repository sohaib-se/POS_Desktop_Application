import { useState, useRef, useEffect } from "react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import en from "react-phone-number-input/locale/en.json";
import { ChevronDown, Search } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface CountryEntry {
  code: Country;
  name: string;
  dial: string;
  Flag: React.ComponentType<{ title: string }>;
}

// ── Build sorted country list from package data ──────────────────────────────

const ALL_COUNTRIES: CountryEntry[] = getCountries()
  .map((code) => ({
    code,
    name: (en as Record<string, string>)[code] ?? code,
    dial: `+${getCountryCallingCode(code)}`,
    Flag: flags[code]!,
  }))
  .filter((c) => c.Flag) // skip entries with no flag asset
  .sort((a, b) => a.name.localeCompare(b.name));

// ── Parse an existing stored value like "+92 3001234567" ─────────────────────

export function parseStored(value: string): { country: Country; number: string } {
  const safeValue = value || "";
  // Try to match a dial code prefix
  for (const c of ALL_COUNTRIES) {
    if (safeValue.startsWith(c.dial + " ")) {
      return { country: c.code, number: safeValue.slice(c.dial.length + 1) };
    }
  }
  // Default Pakistan
  return { country: "PK", number: safeValue };
}

// ── CountryDropdown ───────────────────────────────────────────────────────────

interface CountryDropdownProps {
  selected: Country;
  onChange: (c: Country) => void;
}

function CountryDropdown({ selected, onChange }: CountryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedEntry = ALL_COUNTRIES.find((c) => c.code === selected);
  const SelectedFlag = selectedEntry?.Flag;

  const filtered = query.trim()
    ? ALL_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.dial.includes(query) ||
          c.code.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_COUNTRIES;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-full px-2.5 bg-gray-50 border-r border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none rounded-l-lg"
        style={{ minWidth: "85px" }}
      >
        {SelectedFlag && (
          <span className="inline-block w-5 h-3.5 rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
            <SelectedFlag title={selectedEntry?.name ?? ""} />
          </span>
        )}
        <span className="text-xs font-medium text-gray-700 leading-none">
          {selectedEntry?.dial}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-gray-500 transition-transform duration-150 ml-auto ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-60 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {/* Search box */}
          <div className="p-2 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full focus-within:border-[#E53935] focus-within:ring-4 focus-within:ring-[#E53935]/20 transition-all">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or code…"
                className="flex-1 text-sm bg-transparent outline-none border-none focus:ring-0 p-0 placeholder-gray-400 text-gray-700"
              />
            </div>
          </div>

          {/* Country list */}
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">
                No results
              </li>
            )}
            {filtered.map((c) => {
              const FlagComp = c.Flag;
              const isSelected = c.code === selected;
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-red-50" : ""
                    }`}
                  >
                    {/* Flag */}
                    <span className="inline-block w-6 h-4 rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
                      <FlagComp title={c.name} />
                    </span>
                    {/* Country name */}
                    <span
                      className={`flex-1 text-sm truncate ${
                        isSelected
                          ? "text-[#E53935] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {c.name}
                    </span>
                    {/* Dial code */}
                    <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                      {c.dial}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  className = "",
}: PhoneInputProps) {
  const parsed = parseStored(value);
  const [selectedCountry, setSelectedCountry] = useState<Country>(parsed.country);
  const [localNumber, setLocalNumber] = useState(parsed.number);

  // Sync internal state when value changes externally
  useEffect(() => {
    const p = parseStored(value);
    setSelectedCountry(p.country);
    setLocalNumber(p.number);
  }, [value]);

  const handleCountryChange = (code: Country) => {
    setSelectedCountry(code);
    const dial = `+${getCountryCallingCode(code)}`;
    onChange(localNumber ? `${dial} ${localNumber}` : dial + " ");
  };

  const handleNumberChange = (val: string) => {
    setLocalNumber(val);
    const dial = `+${getCountryCallingCode(selectedCountry)}`;
    onChange(`${dial} ${val}`);
  };

  return (
    <div
      className={`flex items-stretch border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#E53935] focus-within:border-transparent bg-white ${className}`}
    >
      <CountryDropdown selected={selectedCountry} onChange={handleCountryChange} />
      <input
        type="tel"
        placeholder={placeholder}
        value={localNumber}
        onChange={(e) => handleNumberChange(e.target.value)}
        className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none border-none focus:ring-0 bg-transparent min-w-0 rounded-r-lg"
      />
    </div>
  );
}

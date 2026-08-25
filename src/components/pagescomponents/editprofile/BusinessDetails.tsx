import { useState, useRef, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
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

function parseStored(value: string): { country: Country; number: string } {
  // Try to match a dial code prefix
  for (const c of ALL_COUNTRIES) {
    if (value.startsWith(c.dial + " ")) {
      return { country: c.code, number: value.slice(c.dial.length + 1) };
    }
  }
  // Default Pakistan
  return { country: "PK", number: value };
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
        style={{ minWidth: "92px" }}
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
        <div className="absolute left-0 top-full z-50 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {/* Search box */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code…"
              className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400 text-gray-700"
            />
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

// ── Main BusinessDetails component ────────────────────────────────────────────

interface BusinessDetailsProps {
  businessName: string;
  setBusinessName: Dispatch<SetStateAction<string>>;
  phoneNumber: string;
  setPhoneNumber: Dispatch<SetStateAction<string>>;
  emailId: string;
  setEmailId: Dispatch<SetStateAction<string>>;
  termsConditions: string;
  setTermsConditions: Dispatch<SetStateAction<string>>;
}

export function BusinessDetails({
  businessName,
  setBusinessName,
  phoneNumber,
  setPhoneNumber,
  emailId,
  setEmailId,
  termsConditions,
  setTermsConditions,
}: BusinessDetailsProps) {
  const parsed = parseStored(phoneNumber);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    parsed.country
  );
  const [localNumber, setLocalNumber] = useState(parsed.number);

  // Sync internal state when the parent loads the profile from the API
  // (phoneNumber starts as "" then arrives asynchronously)
  useEffect(() => {
    if (phoneNumber) {
      const p = parseStored(phoneNumber);
      setSelectedCountry(p.country);
      setLocalNumber(p.number);
    }
  }, [phoneNumber]);

  const handleCountryChange = (code: Country) => {
    setSelectedCountry(code);
    const dial = `+${getCountryCallingCode(code)}`;
    setPhoneNumber(`${dial} ${localNumber}`);
  };

  const handleNumberChange = (val: string) => {
    setLocalNumber(val);
    const dial = `+${getCountryCallingCode(selectedCountry)}`;
    setPhoneNumber(`${dial} ${val}`);
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Business Details
      </h2>
      <div className="space-y-4">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name*
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="flex items-stretch border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#E53935] focus-within:border-transparent">
            <CountryDropdown
              selected={selectedCountry}
              onChange={handleCountryChange}
            />
            <input
              type="tel"
              placeholder="Enter phone number"
              value={localNumber}
              onChange={(e) => handleNumberChange(e.target.value)}
              className="flex-1 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none bg-white min-w-0 rounded-r-lg"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email ID
          </label>
          <input
            type="email"
            placeholder="Enter Email ID"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent"
          />
        </div>

        {/* Terms & Conditions */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Terms &amp; Conditions
          </label>
          <textarea
            placeholder="Enter Terms &amp; Conditions"
            value={termsConditions}
            onChange={(e) => setTermsConditions(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E53935] focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
}

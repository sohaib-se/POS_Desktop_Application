import { useRef, useEffect } from "react";
import { BLUE, BLUE_LIGHT, BORDER, TEXT_MUTED } from "./constants";

export function ThemeStrip({
  themes,
  active,
  onSelect,
}: {
  themes: string[];
  active: number;
  onSelect: (i: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // Automatically scroll to make active item visible when it changes
  useEffect(() => {
    if (activeBtnRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const btn = activeBtnRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();

      if (btnRect.left < containerRect.left) {
        container.scrollBy({ left: btnRect.left - containerRect.left - 10, behavior: "smooth" });
      } else if (btnRect.right > containerRect.right) {
        container.scrollBy({ left: btnRect.right - containerRect.right + 10, behavior: "smooth" });
      }
    }
  }, [active]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <button
        onClick={scrollLeft}
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: `1px solid transparent`,
          background: "transparent",
          color: TEXT_MUTED,
          cursor: "pointer",
          flexShrink: 0,
          fontWeight: "bold",
        }}
      >
        &lt;
      </button>
      
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: 10,
          overflowX: "hidden",
          scrollBehavior: "smooth",
          width: 342, // Roughly 4 items of 78px + gaps
        }}
      >
        {themes.map((name, i) => {
          const isActive = i === active;
          return (
            <button
              key={name}
              ref={isActive ? activeBtnRef : null}
              onClick={() => onSelect(i)}
              style={{
                width: 78,
                padding: "8px 6px",
                border: `1.5px solid transparent`,
                background: isActive ? "#e5e7eb" : "transparent",
                borderRadius: 6,
                cursor: "pointer",
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 3,
                  padding: "6px 5px",
                  marginBottom: 6,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ height: 3, background: "#cbd5e1", borderRadius: 1, marginBottom: 3 }} />
                <div style={{ height: 2, background: "#e2e8f0", borderRadius: 1, marginBottom: 2, width: "70%" }} />
                <div style={{ height: 2, background: "#e2e8f0", borderRadius: 1, marginBottom: 2 }} />
                <div style={{ height: 2, background: "#e2e8f0", borderRadius: 1, width: "80%" }} />
              </div>
              <span style={{ fontSize: 9.5, color: TEXT_MUTED, fontWeight: 500 }}>
                {name}
              </span>
            </button>
          );
        })}
      </div>
      
      <button
        onClick={scrollRight}
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: `1px solid transparent`,
          background: "transparent",
          color: TEXT_MUTED,
          cursor: "pointer",
          flexShrink: 0,
          fontWeight: "bold",
        }}
      >
        &gt;
      </button>
    </div>
  );
}

import React from "react";
import type { PurchaseTab } from "./types";

interface PurchaseTabBarProps {
  tabs: PurchaseTab[];
  activeTabId: number;
  setActiveTabId: (id: number) => void;
  addTab: () => void;
  closeTab: (id: number, e: React.MouseEvent) => void;
  onClose?: () => void;
}

export function PurchaseTabBar({
  tabs,
  activeTabId,
  setActiveTabId,
  addTab,
  closeTab,
  onClose,
}: PurchaseTabBarProps) {
  return (
    <div
      style={{
        background: "#c4d3de",
        display: "flex",
        alignItems: "flex-end",
        padding: "2px 10px 0 10px",
        gap: 4,
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 20px",
              background: active ? "#fff" : "#d4dfe9",
              color: active ? "#1f2937" : "#6b7280",
              fontWeight: active ? 500 : 400,
              fontSize: 13,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              cursor: "pointer",
              borderBottom: active ? "2px solid #fff" : "none",
              userSelect: "none",
              boxShadow: active ? "0 -1px 3px rgba(0,0,0,0.06)" : "none",
              minWidth: 225,
              position: "relative",
              overflow: "visible",
            }}
          >
            {active && (
              <>
                <span
                  style={{
                    position: "absolute",
                    left: -10,
                    bottom: 0,
                    width: 10,
                    height: 10,
                    borderBottomRightRadius: 10,
                    boxShadow: "5px 5px 0 5px #fff",
                    pointerEvents: "none",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: -10,
                    bottom: 0,
                    width: 10,
                    height: 10,
                    borderBottomLeftRadius: 10,
                    boxShadow: "-5px 5px 0 5px #fff",
                    pointerEvents: "none",
                  }}
                />
              </>
            )}
            <span>{tab.label}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => closeTab(tab.id, e)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 6px",
                  borderRadius: 4,
                  color: "#9ca3af",
                  fontSize: 12,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  marginLeft: "auto",
                  marginRight: -10,
                }}
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
      <button
        onClick={addTab}
        title="New Purchase"
        style={{
          marginBottom: 0,
          marginLeft: 4,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 300,
          alignSelf: "center",
          flexShrink: 0,
          boxShadow: "0 1px 4px rgba(59,130,246,0.4)",
        }}
      >
        +
      </button>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close add purchase"
          style={{
            marginLeft: "auto",
            marginBottom: 0,
            width: 24,
            height: 24,
            background: "#374151",
            border: "none",
            cursor: "pointer",
            color: "#ffffff",
            padding: 0,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

import { useState } from "react";
import "./App.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/pages/Dashboard";
import { Parties } from "@/components/pages/Parties";
import { Items } from "@/components/pages/Items";
import { AddSale } from "@/components/pages/AddSale";
import { AddPurchase } from "@/components/pages/AddPurchase";
import { AddExpense } from "@/components/pages/AddExpense";
import { SaleInvoices } from "@/components/pages/SaleInvoices";
import { Estimates } from "@/components/pages/Estimates";
import { PaymentIn } from "@/components/pages/PaymentIn";
import { PaymentOut } from "@/components/pages/PaymentOut";
import { PurchaseBills } from "@/components/pages/PurchaseBills";
import { Expenses } from "@/components/pages/Expenses";
import { CashBank } from "@/components/pages/CashBank";
import { BankAccounts } from "@/components/pages/BankAccounts";
import { Reports } from "@/components/pages/Reports";
import { SettingsPage } from "@/components/pages/Settings";
import { Utilities } from "@/components/pages/Utilities";
import { SyncShare } from "@/components/pages/SyncShare";
import { EditProfile } from "@/components/pages/EditProfile";
import { LaimsoftPos } from "@/components/pages/LaimsoftPos";
import type { SaleInvoiceEditData, ViewType } from "@/types";

function App() {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [lastStandardView, setLastStandardView] = useState<ViewType>("home");
  const [editingSaleInvoice, setEditingSaleInvoice] =
    useState<SaleInvoiceEditData | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState<string>("general");

  const isOverlayView = (view: ViewType) =>
    view === "add-sale" ||
    view === "add-purchase" ||
    view === "add-expense" ||
    view === "settings" ||
    view === "pos";

  const handleViewChange = (view: ViewType) => {
    if (!isOverlayView(view)) {
      setLastStandardView(view);
    }

    if (view === "add-sale") {
      setEditingSaleInvoice(null);
    }

    if (view === "settings") {
      setSettingsInitialTab("general");
    }

    setCurrentView(view);
  };

  const handleEditSaleInvoice = (invoice: SaleInvoiceEditData) => {
    setEditingSaleInvoice(invoice);
    setCurrentView("add-sale");
  };

  const handleCloseAddSale = () => {
    setEditingSaleInvoice(null);
    setCurrentView(lastStandardView);
  };

  const handleCloseAddPurchase = () => {
    setCurrentView(lastStandardView);
  };

  const handleCloseAddExpense = () => {
    setCurrentView(lastStandardView);
  };

  const handleCloseSettings = () => {
    setCurrentView(lastStandardView);
  };

  const handleOpenSettings = (tab = "general") => {
    setSettingsInitialTab(tab);
    setCurrentView("settings");
  };

  const handleClosePos = () => {
    setCurrentView(lastStandardView);
  };

  const activeBaseView = isOverlayView(currentView)
    ? lastStandardView
    : currentView;

  const renderContent = (view: ViewType) => {
    switch (view) {
      case "home":
        return <Dashboard />;
      case "parties":
        return <Parties onOpenSettings={handleOpenSettings} />;
      case "items":
        return <Items />;
      case "sale-invoices":
        return (
          <SaleInvoices
            onViewChange={handleViewChange}
            onEditInvoice={handleEditSaleInvoice}
          />
        );
      case "estimates":
        return <Estimates />;
      case "payment-in":
        return <PaymentIn />;
      case "purchase-bills":
        return <PurchaseBills />;
      case "payment-out":
        return <PaymentOut />;
      case "expenses":
        return (
          <Expenses onAddExpense={() => handleViewChange("add-expense")} />
        );

      case "bank-accounts":
        return <BankAccounts />;
      case "cash-in-hand":
        return <CashBank subView={currentView} />;
      case "reports":
        return <Reports />;
      case "sync-share":
        return <SyncShare initialTab="sync-share" />;
      case "sync-auto-backup":
        return <SyncShare initialTab="auto-backup" />;
      case "sync-backup-computer":
        return <SyncShare initialTab="backup-computer" />;
      case "sync-backup-drive":
        return <SyncShare initialTab="backup-drive" />;
      case "sync-restore-backup":
        return <SyncShare initialTab="restore-backup" />;
      case "settings":
        return <SettingsPage initialTab={settingsInitialTab} />;
      case "utilities":
        return <Utilities />;
      case "utilities-import-items":
        return <Utilities initialTab="import-items" />;
      case "utilities-barcode":
        return <Utilities initialTab="barcode" />;
      case "utilities-bulk-update":
        return <Utilities initialTab="bulk-update" />;
      case "utilities-import-parties":
        return <Utilities initialTab="import-parties" />;
      case "utilities-export-tally":
        return <Utilities initialTab="export-tally" />;
      case "utilities-export-items":
        return <Utilities initialTab="export-items" />;
      case "utilities-verify-data":
        return <Utilities initialTab="verify-data" />;
      case "utilities-recycle-bin":
        return <Utilities initialTab="recycle-bin" />;
      case "edit-profile":
        return <EditProfile onBack={() => handleViewChange("home")} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <div className="h-screen flex bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentView={activeBaseView} onViewChange={handleViewChange} />

        {/* Right Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header onViewChange={handleViewChange} />

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {renderContent(activeBaseView)}
          </div>
        </div>
      </div>

      {currentView === "add-sale" && (
        <div className="fixed inset-0 z-[100]">
          <AddSale
            onClose={handleCloseAddSale}
            initialInvoice={editingSaleInvoice}
          />
        </div>
      )}

      {currentView === "add-purchase" && (
        <div className="fixed inset-0 z-[100]">
          <AddPurchase onClose={handleCloseAddPurchase} />
        </div>
      )}

      {currentView === "add-expense" && (
        <div className="fixed inset-0 z-[100]">
          <AddExpense onClose={handleCloseAddExpense} />
        </div>
      )}

      {currentView === "settings" && (
        <div className="fixed inset-0 z-[110]">
          <SettingsPage onClose={handleCloseSettings} initialTab={settingsInitialTab} />
        </div>
      )}

      {currentView === "pos" && (
        <div className="fixed inset-0 z-[120]">
          <LaimsoftPos onClose={handleClosePos} />
        </div>
      )}
    </>
  );
}

export default App;

import { useState } from 'react';
import { Settings, Printer, Percent, MessageSquare, Users, Package, Bell, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [showPrintSettings, setShowPrintSettings] = useState(false);

  const tabs = [
    { id: 'general', label: 'GENERAL', icon: Settings },
    { id: 'transaction', label: 'TRANSACTION', icon: Users },
    { id: 'print', label: 'PRINT', icon: Printer },
    { id: 'taxes', label: 'TAXES', icon: Percent },
    { id: 'message', label: 'TRANSACTION MESSAGE', icon: MessageSquare },
    { id: 'party', label: 'PARTY', icon: Users },
    { id: 'item', label: 'ITEM', icon: Package },
    { id: 'reminders', label: 'SERVICE REMINDERS', icon: Bell },
  ];

  return (
    <div className="h-full flex bg-white">
      {/* Left Sidebar */}
      <div className="w-48 border-r border-gray-200 bg-gray-50">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'print') setShowPrintSettings(true);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'general' && (
          <div className="max-w-4xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Application</h3>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Enable Passcode</label>
                    <p className="text-xs text-gray-500">Secure your app with a passcode</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Business Currency</label>
                  <div className="flex items-center gap-2">
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>Rs</option>
                      <option>$</option>
                      <option>€</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (upto Decimal Places)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value="2" className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    <span className="text-sm text-gray-500">e.g. 0.00</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">TIN Number</label>
                  <input type="checkbox" className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Stop Sale on Negative Stock</label>
                  <input type="checkbox" className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Block New Items from Txn Form</label>
                  <input type="checkbox" className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Block New Parties from Txn Form</label>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">More Transactions</label>
                  <div className="space-y-2">
                    {['Estimate/Quotation', 'Proforma Invoice', 'Sale/Purchase Order', 'Other Income'].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={item === 'Estimate/Quotation'} className="rounded" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Stock Transfer Between Stores</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Manage all your stores/godowns and transfer stock seamlessly between them.
                  </p>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-700">Store management & Stock transfer</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Customize Your View</label>
                  <p className="text-xs text-gray-500 mb-2">Choose Your Screen Zoom/Scale</p>
                  <div className="flex items-center gap-2">
                    {['70%', '80%', '90%', '100%', '110%', '115%', '120%', '130%'].map((scale) => (
                      <button 
                        key={scale}
                        className={`px-2 py-1 text-xs rounded ${scale === '100%' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {scale}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Backup & History */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & History</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto Backup</label>
                    <p className="text-xs text-gray-500">Last Backup 29/01/2026 | 09:01 PM</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Auto Backup every</span>
                  <input type="number" value="2" className="w-16 border border-gray-300 rounded-lg px-3 py-1 text-sm" />
                  <span className="text-sm text-gray-700">days</span>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Transaction History</label>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transaction' && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Transaction Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Cash Sale by default</label>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Show last 5 Sale Invoices</label>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Round Off Total</label>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Free Item Quantity</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Nearest</option>
                  <option>Round Up</option>
                  <option>Round Down</option>
                </select>
                <span className="text-sm text-gray-500">To</span>
                <input type="number" value="1" className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Settings Modal */}
      <Dialog open={showPrintSettings} onOpenChange={setShowPrintSettings}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Print Settings</span>
              <button onClick={() => setShowPrintSettings(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <PrintSettings />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PrintSettings() {
  const [activePrinter, setActivePrinter] = useState<'regular' | 'thermal'>('regular');
  const [activeTab, setActiveTab] = useState<'layout' | 'colors'>('layout');

  return (
    <div className="space-y-6">
      {/* Printer Type Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActivePrinter('regular')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activePrinter === 'regular' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-500 border-transparent'
          }`}
        >
          REGULAR PRINTER
        </button>
        <button
          onClick={() => setActivePrinter('thermal')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activePrinter === 'thermal' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-500 border-transparent'
          }`}
        >
          THERMAL PRINTER
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'layout' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          CHANGE LAYOUT
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'colors' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          CHANGE COLORS
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Panel - Options */}
        <div className="space-y-4">
          {activeTab === 'layout' && (
            <>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <label className="text-sm text-gray-700">Total Item Quantity</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <label className="text-sm text-gray-700">Amount with Decimal e.g. 0.00</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <label className="text-sm text-gray-700">Received Amount</label>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Print Company Info / Header</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-sm text-gray-700">Make Regular Printer Default</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-sm text-gray-700">Print entry header on all pages</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-sm text-gray-700">Company Logo</label>
                    <button className="text-blue-600 text-sm">(Change)</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-sm text-gray-700">Print repeat header in all pages</label>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'colors' && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: 'Tax Theme 6', color: 'bg-purple-500' },
                { name: 'Double Divine', color: 'bg-gray-700' },
                { name: 'French Elite', color: 'bg-amber-600' },
                { name: 'Theme 1', color: 'bg-blue-600' },
              ].map((theme) => (
                <button key={theme.name} className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                  <div className={`w-full h-12 ${theme.color} rounded mb-2`}></div>
                  <span className="text-xs text-gray-600">{theme.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="bg-blue-600 text-white text-center py-2 mb-4">
              <h3 className="font-bold">TAX INVOICE</h3>
            </div>
            <div className="flex justify-between text-xs mb-4">
              <div>
                <p className="font-bold">Laimsoft</p>
                <p>Phone: 3198224949</p>
                <p>Email:</p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">A</span>
                </div>
              </div>
            </div>
            <div className="border-t border-b border-gray-200 py-2 mb-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p><span className="text-gray-500">Invoice No:</span> #1</p>
                  <p><span className="text-gray-500">Invoice Date:</span> 29/05/2020</p>
                </div>
                <div>
                  <p><span className="text-gray-500">Bill To:</span></p>
                  <p className="font-medium">Classic Enterprises Pvt Ltd.</p>
                </div>
              </div>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-2 py-1 text-left">#</th>
                  <th className="px-2 py-1 text-left">Item name</th>
                  <th className="px-2 py-1 text-right">Qty</th>
                  <th className="px-2 py-1 text-right">Price/unit</th>
                  <th className="px-2 py-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-2 py-1">1</td>
                  <td className="px-2 py-1">Sample Item</td>
                  <td className="px-2 py-1 text-right">2</td>
                  <td className="px-2 py-1 text-right">Rs 1,568.00</td>
                  <td className="px-2 py-1 text-right">Rs 3,136.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

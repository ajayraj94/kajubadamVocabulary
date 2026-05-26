"use client";

import { useState, useEffect, useCallback } from "react";
import { PRODUCT_IDS, PRODUCTS, getProductLabel, getProductBadgeClasses, getProduct } from "@/lib/products";

interface Purchase {
  id: string;
  email: string;
  products: string[];
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  email: string;
  product: string;
  transaction_id: string;
  payment_id: string | null;
  amount: number | null;
  status: string;
  created_at: string;
}

const ADMIN_TOKEN_KEY = "kv_admin_token";

export default function AdminPage() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Data state
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add user form
  const [newEmail, setNewEmail] = useState("");
  const [newProduct, setNewProduct] = useState<string>(PRODUCT_IDS[0] || "part1");
  const [addLoading, setAddLoading] = useState(false);
  const [addMessage, setAddMessage] = useState<string | null>(null);

  // Create test account
  const [testAcctLoading, setTestAcctLoading] = useState(false);
  const [testAcctResult, setTestAcctResult] = useState<any>(null);

  // Remove product
  const [removing, setRemoving] = useState<string | null>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<"purchases" | "transactions">("purchases");

  // Check for existing token on mount
  useEffect(() => {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      setIsLoggedIn(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getToken = useCallback(() => {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();

      const [purchasesRes, transactionsRes] = await Promise.all([
        fetch("/api/admin/purchases", {
          headers: { "x-admin-token": token },
        }),
        fetch("/api/admin/transactions", {
          headers: { "x-admin-token": token },
        }),
      ]);

      if (!purchasesRes.ok || !transactionsRes.ok) {
        throw new Error("Failed to fetch data. Check that SUPABASE_SERVICE_ROLE_KEY is configured.");
      }

      const purchasesData = await purchasesRes.json();
      const transactionsData = await transactionsRes.json();

      if (purchasesData.success) setPurchases(purchasesData.purchases || []);
      if (transactionsData.success) setTransactions(transactionsData.transactions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!data.success) {
        setAuthError(data.error || "Invalid password");
        return;
      }

      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setIsLoggedIn(true);
      fetchData();
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong");
    } finally {
      setAuthLoading(false);
    }
  };

  // Add purchase
  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMessage(null);

    try {
      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": getToken(),
        },
        body: JSON.stringify({ email: newEmail, product: newProduct }),
      });

      const data = await res.json();

      if (!data.success) {
        setAddMessage(`❌ ${data.error}`);
        return;
      }

      setAddMessage(`✅ ${data.message}`);
      setNewEmail("");
      fetchData();
    } catch (err: any) {
      setAddMessage(`❌ ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  };

  // Create test account
  const handleCreateTestAccount = async () => {
    setTestAcctLoading(true);
    setTestAcctResult(null);

    try {
      const res = await fetch("/api/auth/create-test-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": getToken(),
        },
        body: JSON.stringify({
          email: "test@kajubadamvocabulary.in",
          password: "TestPass@123",
        }),
      });

      const data = await res.json();
      setTestAcctResult(data);

      if (data.success) {
        fetchData();
      }
    } catch (err: any) {
      setTestAcctResult({
        success: false,
        message: err.message || "Something went wrong",
        email: "test@kajubadamvocabulary.in",
        password: "TestPass@123",
      });
    } finally {
      setTestAcctLoading(false);
    }
  };

  // Remove product
  const handleRemoveProduct = async (email: string, product: string) => {
    setRemoving(`${email}:${product}`);

    try {
      const res = await fetch("/api/admin/purchases", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": getToken(),
        },
        body: JSON.stringify({ email, product }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(`Error: ${data.error}`);
        return;
      }

      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setRemoving(null);
    }
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsLoggedIn(false);
    setPurchases([]);
    setTransactions([]);
  };

  // Tab title for display
  const tabTitle = activeTab === "purchases" ? "Purchases" : "Transactions";
  const tabCount = activeTab === "purchases" ? purchases.length : transactions.length;

  // ─── LOGIN GATE ───
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-black text-center mb-1">Admin Panel</h1>
          <p className="text-gray-500 text-sm text-center mb-6">Enter admin password to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus required
            />
            {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading || !password}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {authLoading ? "Verifying..." : "Unlock Admin Panel"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── LOADING ───
  if (loading && purchases.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin data...</p>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  const totalUsers = purchases.length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-black">Admin Panel</h1>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-all">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-4 text-sm text-red-300">
            <strong className="font-bold">Error:</strong> {error}
            <p className="text-red-400/70 mt-1 text-xs">
              Make sure <code className="bg-red-900/50 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> is set in .env.local.
            </p>
          </div>
        )}

        {/* Stats Cards — dynamically generated from product config */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-black text-white mt-1">{totalUsers}</p>
          </div>
          {PRODUCT_IDS.map((id) => {
            const count = purchases.filter((p) => p.products.includes(id)).length;
            const product = getProduct(id);
            const colorMap: Record<string, string> = {
              blue: "text-blue-400",
              orange: "text-orange-400",
              red: "text-red-400",
              green: "text-green-400",
              purple: "text-purple-400",
              amber: "text-amber-400",
              teal: "text-teal-400",
              rose: "text-rose-400",
              indigo: "text-indigo-400",
            };
            return (
              <div key={id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{getProductLabel(id)}</p>
                <p className={`text-2xl font-black mt-1 ${colorMap[product?.color || "blue"] || "text-white"}`}>{count}</p>
              </div>
            );
          })}
        </div>

        {/* Grant Access / Test Account */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4">Manage Users</h2>

          <form onSubmit={handleAddPurchase} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setAddMessage(null); }}
                placeholder="user@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Product</label>
              <select
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {PRODUCT_IDS.map((id) => (
                  <option key={id} value={id}>{getProductLabel(id)}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={addLoading || !newEmail}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              {addLoading ? "Granting..." : "Grant Access"}
            </button>
          </form>

          {addMessage && <p className="text-sm mt-3">{addMessage}</p>}

          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setNewEmail("test@kajubadamvocabulary.in"); setNewProduct("part1"); }}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                Fill test account
              </button>
            </div>
          </div>
        </div>

        {/* Create Test Account */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider mb-1">🧪 Create Test Account (for Razorpay Testing)</h2>
              <p className="text-xs text-gray-500 mb-3">
                Creates a real Supabase Auth user with email + password and grants all purchases dynamically.
              </p>
            </div>
            <button
              onClick={handleCreateTestAccount}
              disabled={testAcctLoading}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/30"
            >
              {testAcctLoading ? "Creating..." : "Create Test Account"}
            </button>
          </div>

          {testAcctResult && (
            <div className={`mt-4 p-4 rounded-xl border ${testAcctResult.success ? "bg-emerald-900/20 border-emerald-800/50" : "bg-amber-900/20 border-amber-800/50"}`}>
              <div className="bg-gray-950 rounded-lg p-3 mb-3 font-mono text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-16">Email:</span>
                  <span className="text-emerald-300 font-bold">{testAcctResult.email}</span>
                  <button onClick={() => { navigator.clipboard.writeText(testAcctResult.email); }} className="text-gray-500 hover:text-white text-xs ml-auto">📋 Copy</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-16">Password:</span>
                  <span className="text-amber-300 font-bold">{testAcctResult.password}</span>
                  <button onClick={() => { navigator.clipboard.writeText(testAcctResult.password); }} className="text-gray-500 hover:text-white text-xs ml-auto">📋 Copy</button>
                </div>
              </div>
              {testAcctResult.results?.map((r: string, i: number) => (
                <p key={i} className="text-xs text-gray-400 mb-0.5">{r}</p>
              ))}
              {testAcctResult.errors?.map((e: string, i: number) => (
                <p key={i} className="text-xs text-red-400 mb-0.5 whitespace-pre-line">{e}</p>
              ))}
              <p className="text-sm font-bold mt-2">{testAcctResult.message}</p>
            </div>
          )}
        </div>

        {/* Tabs: Purchases / Transactions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab("purchases")}
              className={`flex-1 text-sm font-bold py-3 px-4 transition-colors ${
                activeTab === "purchases"
                  ? "text-white border-b-2 border-blue-500 bg-gray-800/50"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Purchases ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 text-sm font-bold py-3 px-4 transition-colors ${
                activeTab === "transactions"
                  ? "text-white border-b-2 border-blue-500 bg-gray-800/50"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Transactions ({transactions.length})
            </button>
          </div>

          {/* Purchases Tab */}
          {activeTab === "purchases" && (
            <div className="overflow-x-auto">
              {purchases.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No purchases found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 text-[11px] uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Products</th>
                      <th className="text-left px-4 py-3 font-medium">Last Updated</th>
                      <th className="text-right px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium">{purchase.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {PRODUCT_IDS.map((id) => {
                              if (!purchase.products.includes(id)) return null;
                              return (
                                <span
                                  key={id}
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getProductBadgeClasses(id)}`}
                                >
                                  {id}
                                </span>
                              );
                            })}
                            {purchase.products.length === 0 && (
                              <span className="text-[11px] text-gray-600">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(purchase.updated_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {PRODUCT_IDS.map((id) => {
                              if (!purchase.products.includes(id)) return null;
                              const isRemoving = removing === `${purchase.email}:${id}`;
                              return (
                                <button
                                  key={id}
                                  onClick={() => handleRemoveProduct(purchase.email, id)}
                                  disabled={isRemoving}
                                  className="text-[11px] font-bold px-2 py-1 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50"
                                  title={`Remove ${id}`}
                                >
                                  {isRemoving ? "..." : `✕ ${id}`}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="overflow-x-auto">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No transactions found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 text-[11px] uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Product</th>
                      <th className="text-left px-4 py-3 font-medium">Transaction ID</th>
                      <th className="text-right px-4 py-3 font-medium">Amount</th>
                      <th className="text-right px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium">{tx.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getProductBadgeClasses(tx.product) || "bg-gray-700 text-gray-300"}`}>
                            {tx.product}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                          {tx.transaction_id?.slice(0, 20)}...
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          {tx.amount != null ? `₹${(tx.amount / 100).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-400 text-xs">
                          {new Date(tx.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Configuration Info */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Configuration</h3>
          <p className="text-xs text-gray-600">
            Products defined in <code className="text-gray-400 bg-gray-800 px-1 rounded">lib/products.ts</code> &middot;
            {PRODUCT_IDS.length} products configured &middot;
            <a href="/" className="text-blue-500 hover:text-blue-400 ml-1">← Back to site</a>
          </p>
        </div>
      </div>
    </div>
  );
}

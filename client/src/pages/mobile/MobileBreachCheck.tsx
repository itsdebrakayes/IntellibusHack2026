import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Search, Plus, Trash2, AlertTriangle, Loader2, Shield, Mail, Key, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RiskGauge from "@/components/RiskGauge";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const mockLookupResults = [
  { score: 28, breaches: 6, exposedData: ["Email", "Password", "Phone", "IP Address", "Username"], recentBreaches: [{ source: "SocialApp.io", date: "2025-11-14", records: "2.3M" }, { source: "ShopEasy.com", date: "2025-08-02", records: "890K" }] },
  { score: 72, breaches: 2, exposedData: ["Email", "Username"], recentBreaches: [{ source: "OldForum.net", date: "2024-03-19", records: "120K" }] },
  { score: 91, breaches: 1, exposedData: ["Email"], recentBreaches: [{ source: "MinorSite.org", date: "2022-12-01", records: "30K" }] },
];

const mockAccounts = [
  { email: "john.doe@gmail.com", score: 35, breaches: 4, exposedData: ["Email", "Password", "Phone", "IP Address"], recentBreaches: [{ source: "SocialApp.io", date: "2025-11-14", records: "2.3M" }, { source: "ShopEasy.com", date: "2025-08-02", records: "890K" }] },
  { email: "johndoe@outlook.com", score: 82, breaches: 1, exposedData: ["Email"], recentBreaches: [{ source: "OldForum.net", date: "2024-03-19", records: "120K" }] },
];

const exposureData = [
  { name: "Email", value: 6 }, { name: "Password", value: 4 }, { name: "Phone", value: 2 },
  { name: "IP", value: 3 }, { name: "Username", value: 5 },
];
const pieColors = ["hsl(var(--cyber-light-blue))", "hsl(var(--cyber-red))", "hsl(var(--cyber-blue))", "hsl(var(--cyber-yellow))", "hsl(var(--cyber-teal))"];

const statCards = [
  { label: "Threats", value: "7", icon: Shield, color: "cyber-red" },
  { label: "Email Risk", value: "64%", icon: Mail, color: "cyber-light-blue" },
  { label: "Passwords", value: "42%", icon: Key, color: "cyber-yellow" },
  { label: "Leaks", value: "5", icon: Database, color: "cyber-teal" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface LookupResult {
  score: number; breaches: number; exposedData: string[];
  recentBreaches: { source: string; date: string; records: string }[];
}

const MobileBreachCheck: React.FC = () => {
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [hasAccounts] = useState(true);

  const totalBreaches = mockAccounts.reduce((sum, a) => sum + a.breaches, 0);
  const avgScore = Math.round(mockAccounts.reduce((sum, a) => sum + a.score, 0) / mockAccounts.length);
  const totalExposure = exposureData.reduce((s, d) => s + d.value, 0);

  const handleLookup = () => {
    if (!lookupEmail.trim()) return;
    setIsChecking(true); setLookupResult(null);
    setTimeout(() => { setLookupResult(mockLookupResults[Math.floor(Math.random() * mockLookupResults.length)]); setIsChecking(false); }, 1800);
  };

  const showCentered = !lookupResult && !isChecking && !hasAccounts;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className={showCentered ? "flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center pb-24" : "space-y-4 pb-24"}>
      {showCentered ? (
        <motion.div variants={item} className="w-full space-y-5 text-center px-2">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyber-red/20 to-cyber-light-blue/20 text-cyber-red">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">Breach Check</h1>
            <p className="text-xs text-muted-foreground max-w-xs">Check emails for breaches or add accounts to monitor</p>
          </div>
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Check email for breaches…" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookup()} className="text-sm" />
              <Button size="sm" onClick={handleLookup} disabled={!lookupEmail.trim()} className="shrink-0"><Search className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <span className="relative bg-card px-3 text-[10px] text-muted-foreground">or</span>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add email to monitor…" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="text-sm" />
              <Button size="sm" variant="outline" className="shrink-0"><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Breach Lookup */}
          <motion.div variants={item}>
            <div className="mobile-score-card overflow-hidden rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20"><Search className="h-5 w-5 text-white" /></div>
                <div>
                  <h1 className="font-display text-lg font-bold text-white">Breach Lookup</h1>
                  <p className="text-xs text-white/60">Check any email for breaches</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Enter any email…" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookup()} className="border-transparent bg-white/10 text-white placeholder:text-white/40 text-sm" />
                <Button size="sm" onClick={handleLookup} disabled={isChecking || !lookupEmail.trim()} className="shrink-0 bg-white/20 hover:bg-white/30 text-white">
                  {isChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Lookup Results */}
          <AnimatePresence>
            {(isChecking || lookupResult) && (
              <motion.div variants={item} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="glass-card overflow-hidden rounded-2xl p-4">
                  {isChecking ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground">Scanning for <span className="font-semibold text-foreground">{lookupEmail}</span>…</p>
                    </div>
                  ) : lookupResult && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-sm font-bold text-foreground truncate">{lookupEmail}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${lookupResult.score >= 70 ? "bg-score-safe/10 text-score-safe" : lookupResult.score >= 40 ? "bg-score-warning/10 text-score-warning" : "bg-score-danger/10 text-score-danger"}`}>
                          {lookupResult.score >= 70 ? "Low Risk" : lookupResult.score >= 40 ? "Moderate" : "High Risk"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <RiskGauge score={lookupResult.score} size={130} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {lookupResult.exposedData.map((d) => (
                          <span key={d} className="rounded-full bg-destructive/10 px-2 py-1 text-[10px] font-semibold text-destructive">{d}</span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Found in <span className="font-bold text-foreground">{lookupResult.breaches}</span> breach{lookupResult.breaches !== 1 && "es"}</p>
                      <div className="space-y-1.5">
                        {lookupResult.recentBreaches.map((b) => (
                          <div key={b.source} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
                            <div className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-score-warning" /><span className="text-xs font-medium text-foreground">{b.source}</span></div>
                            <span className="text-[10px] text-muted-foreground">{b.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Monitoring Dashboard */}
          {hasAccounts && (
            <>
              <motion.div variants={item}>
                <div className="flex items-center gap-2 px-1">
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-display text-sm font-bold text-foreground">Monitored Accounts</h2>
                  <span className="ml-auto text-[10px] text-muted-foreground">{mockAccounts.length} accounts · {totalBreaches} breaches</span>
                </div>
              </motion.div>

              <motion.div variants={item}>
                <div className="glass-card flex gap-2 rounded-2xl p-3">
                  <Input placeholder="Add email to monitor…" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="border-transparent bg-transparent text-sm" />
                  <Button size="sm" className="shrink-0"><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button>
                </div>
              </motion.div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3">
                {statCards.map((s) => {
                  const Icon = s.icon;
                  return (
                    <motion.div key={s.label} variants={item}>
                      <div className="glass-card rounded-2xl p-4">
                        <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-${s.color}/15`}>
                          <Icon className={`h-4 w-4 text-${s.color}`} />
                        </div>
                        <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Risk Gauge + Donut */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div variants={item}>
                  <div className="glass-card flex flex-col items-center rounded-2xl py-5 px-3">
                    <h3 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Risk Score</h3>
                    <RiskGauge score={avgScore} size={120} label="Score" />
                  </div>
                </motion.div>
                <motion.div variants={item}>
                  <div className="glass-card rounded-2xl p-4">
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Exposure</h3>
                    <div className="relative mx-auto h-24 w-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart><Pie data={exposureData} cx="50%" cy="50%" innerRadius={24} outerRadius={38} dataKey="value" strokeWidth={2} stroke="hsl(var(--card) / 0.5)">
                          {exposureData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                        </Pie></PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display text-sm font-bold text-foreground">{totalExposure}</span>
                        <span className="text-[8px] text-muted-foreground">Total</span>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      {exposureData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                          <span className="text-[10px] text-foreground">{d.name}</span>
                          <span className="ml-auto text-[10px] font-semibold text-muted-foreground">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Account cards */}
              {mockAccounts.map((account) => (
                <motion.div key={account.email} variants={item}>
                  <div className="glass-card overflow-hidden rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-sm font-bold text-foreground truncate">{account.email}</h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                    <div className="flex flex-col items-center mb-3">
                      <RiskGauge score={account.score} size={110} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {account.exposedData.map((d) => (
                        <span key={d} className="rounded-full bg-destructive/10 px-2 py-1 text-[10px] font-semibold text-destructive">{d}</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Found in <span className="font-bold text-foreground">{account.breaches}</span> breach{account.breaches !== 1 && "es"}</p>
                    <div className="space-y-1.5">
                      {account.recentBreaches.map((b) => (
                        <div key={b.source} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
                          <div className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-score-warning" /><span className="text-xs font-medium text-foreground">{b.source}</span></div>
                          <span className="text-[10px] text-muted-foreground">{b.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </>
      )}
    </motion.div>
  );
};

export default MobileBreachCheck;

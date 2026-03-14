import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Search, Plus, Trash2, AlertTriangle, Lock, Eye, Mail, Phone, Globe, Loader2, Shield, Database, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RiskGauge from "@/components/RiskGauge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreachCheck from "@/pages/mobile/MobileBreachCheck";

const mockLookupResults = [
  {
    score: 28, breaches: 6,
    exposedData: ["Email", "Password", "Phone", "IP Address", "Username"],
    recentBreaches: [
      { source: "SocialApp.io", date: "2025-11-14", records: "2.3M" },
      { source: "ShopEasy.com", date: "2025-08-02", records: "890K" },
      { source: "GameVault.gg", date: "2025-03-11", records: "1.5M" },
    ],
  },
  {
    score: 72, breaches: 2,
    exposedData: ["Email", "Username"],
    recentBreaches: [
      { source: "OldForum.net", date: "2024-03-19", records: "120K" },
      { source: "LeakedDB.com", date: "2023-07-05", records: "450K" },
    ],
  },
  {
    score: 91, breaches: 1,
    exposedData: ["Email"],
    recentBreaches: [
      { source: "MinorSite.org", date: "2022-12-01", records: "30K" },
    ],
  },
];

const mockAccounts = [
  {
    email: "john.doe@gmail.com", score: 35, breaches: 4,
    exposedData: ["Email", "Password", "Phone", "IP Address"],
    recentBreaches: [
      { source: "SocialApp.io", date: "2025-11-14", records: "2.3M" },
      { source: "ShopEasy.com", date: "2025-08-02", records: "890K" },
    ],
  },
  {
    email: "johndoe@outlook.com", score: 82, breaches: 1,
    exposedData: ["Email"],
    recentBreaches: [{ source: "OldForum.net", date: "2024-03-19", records: "120K" }],
  },
];

const exposureData = [
  { name: "Email", value: 6, icon: Mail },
  { name: "Password", value: 4, icon: Lock },
  { name: "Phone", value: 2, icon: Phone },
  { name: "IP Address", value: 3, icon: Globe },
  { name: "Username", value: 5, icon: Eye },
];

const pieColors = [
  "hsl(var(--cyber-purple))", "hsl(var(--cyber-red))", "hsl(var(--cyber-blue))",
  "hsl(var(--cyber-yellow))", "hsl(var(--cyber-teal))",
];

const barData = [
  { name: "2022", count: 1 }, { name: "2023", count: 2 },
  { name: "2024", count: 1 }, { name: "2025", count: 3 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const statCards = [
  { label: "Total Threats", value: "7", icon: Shield, color: "cyber-red" },
  { label: "Email Risk", value: "64%", icon: Mail, color: "cyber-purple" },
  { label: "Password Risk", value: "42%", icon: Key, color: "cyber-yellow" },
  { label: "Data Leaks", value: "5", icon: Database, color: "cyber-teal" },
];

interface LookupResult {
  score: number;
  breaches: number;
  exposedData: string[];
  recentBreaches: { source: string; date: string; records: string }[];
}

// Custom SVG Donut Chart matching reference aesthetic
const DonutChart: React.FC<{
  data: { name: string; value: number }[];
  colors: string[];
  size: number;
  total: number;
}> = ({ data, colors, size, total }) => {
  const center = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.6;
  const gapAngle = 3;

  const segments: { startAngle: number; endAngle: number; color: string }[] = [];
  let currentAngle = -90;
  data.forEach((d, i) => {
    const sweepAngle = (d.value / total) * (360 - gapAngle * data.length);
    segments.push({
      startAngle: currentAngle + gapAngle / 2,
      endAngle: currentAngle + sweepAngle + gapAngle / 2,
      color: colors[i],
    });
    currentAngle += sweepAngle + gapAngle;
  });

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPathD = (startDeg: number, endDeg: number, oR: number, iR: number) => {
    const s1 = toRad(startDeg);
    const s2 = toRad(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    const ox1 = center + oR * Math.cos(s1);
    const oy1 = center + oR * Math.sin(s1);
    const ox2 = center + oR * Math.cos(s2);
    const oy2 = center + oR * Math.sin(s2);
    const ix1 = center + iR * Math.cos(s2);
    const iy1 = center + iR * Math.sin(s2);
    const ix2 = center + iR * Math.cos(s1);
    const iy2 = center + iR * Math.sin(s1);
    return `M ${ox1} ${oy1} A ${oR} ${oR} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${iR} ${iR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => (
        <path
          key={i}
          d={arcPathD(seg.startAngle, seg.endAngle, outerR, innerR)}
          fill={seg.color}
          className="transition-all duration-700 ease-out"
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
        />
      ))}
      <text x={center} y={center - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="10" fontWeight="500">Total</text>
      <text x={center} y={center + 14} textAnchor="middle" className="fill-foreground" fontSize="22" fontWeight="700" fontFamily="'Space Grotesk', sans-serif">{total}</text>
    </svg>
  );
};

const BreachCheck: React.FC = () => {
  const isMobile = useIsMobile();
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [hasAccounts] = useState(true); // toggle to false to show empty state

  const totalBreaches = mockAccounts.reduce((sum, a) => sum + a.breaches, 0);
  const avgScore = Math.round(mockAccounts.reduce((sum, a) => sum + a.score, 0) / mockAccounts.length);
  const totalExposure = exposureData.reduce((s, d) => s + d.value, 0);

  const handleLookup = () => {
    if (!lookupEmail.trim()) return;
    setIsChecking(true);
    setLookupResult(null);
    setTimeout(() => {
      const result = mockLookupResults[Math.floor(Math.random() * mockLookupResults.length)];
      setLookupResult(result);
      setIsChecking(false);
    }, 1800);
  };

  if (isMobile) return <MobileBreachCheck />;

  const showCentered = !lookupResult && !isChecking && !hasAccounts;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className={showCentered ? "flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center" : "space-y-6"}>

      {/* Centered empty state when no accounts and no lookup */}
      {showCentered ? (
        <motion.div variants={item} className="w-full max-w-xl space-y-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyber-red/20 to-cyber-purple/20 text-cyber-red">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Breach Check</h1>
            <p className="text-sm text-muted-foreground max-w-sm">Check any email for known data breaches or add accounts to continuously monitor</p>
          </div>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Enter email to check for breaches…"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              />
              <Button onClick={handleLookup} disabled={!lookupEmail.trim()} className="shrink-0">
                <Search className="mr-2 h-4 w-4" /> Check
              </Button>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <span className="relative bg-card px-3 text-xs text-muted-foreground">or</span>
            </div>
            <div className="flex gap-3">
              <Input placeholder="Add email for ongoing monitoring…" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <Button variant="outline" className="shrink-0"><Plus className="mr-2 h-4 w-4" /> Monitor</Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Section 1: Public Breach Lookup */}
          <motion.div variants={item}>
            <div className="glass-hero-purple overflow-hidden rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Search className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold">Breach Lookup</h1>
                  <p className="text-sm text-white/70">Check any email for known data breaches</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter any email address to check…"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                />
                <Button onClick={handleLookup} disabled={isChecking || !lookupEmail.trim()} className="shrink-0 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                  {isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  {isChecking ? "Scanning…" : "Check"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Lookup Results */}
          <AnimatePresence>
            {(isChecking || lookupResult) && (
              <motion.div variants={item} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="glass-card overflow-hidden rounded-2xl p-6">
                  {isChecking ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Scanning breach databases for <span className="font-semibold text-foreground">{lookupEmail}</span>…</p>
                    </div>
                  ) : lookupResult && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-foreground">Results for {lookupEmail}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${lookupResult.score >= 70 ? "bg-score-safe/10 text-score-safe" : lookupResult.score >= 40 ? "bg-score-warning/10 text-score-warning" : "bg-score-danger/10 text-score-danger"}`}>
                          {lookupResult.score >= 70 ? "Low Risk" : lookupResult.score >= 40 ? "Moderate Risk" : "High Risk"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-5 md:flex-row md:items-center">
                        <div className="flex-shrink-0">
                          <RiskGauge score={lookupResult.score} size={170} />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {lookupResult.exposedData.map((d) => (
                              <span key={d} className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">{d}</span>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Found in <span className="font-bold text-foreground">{lookupResult.breaches}</span> breach{lookupResult.breaches !== 1 && "es"}
                          </p>
                          <div className="space-y-2">
                            {lookupResult.recentBreaches.map((b) => (
                              <div key={b.source} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 backdrop-blur-sm">
                                <div className="flex items-center gap-2.5">
                                  <AlertTriangle className="h-4 w-4 text-score-warning" />
                                  <span className="text-sm font-medium text-foreground">{b.source}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs text-muted-foreground">{b.date}</span>
                                  <span className="ml-4 text-xs font-medium text-muted-foreground">{b.records} records</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Monitoring Section */}
          {hasAccounts && (
            <>
              {/* Section Header */}
              <motion.div variants={item}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-display text-lg font-bold text-foreground">Monitored Accounts</h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{mockAccounts.length} accounts</span>
                    <span>·</span>
                    <span>{totalBreaches} breaches</span>
                  </div>
                </div>
              </motion.div>

              {/* Add account input */}
              <motion.div variants={item}>
                <div className="glass-card flex gap-3 rounded-2xl p-4">
                  <Input placeholder="Add email to ongoing monitoring…" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="border-transparent bg-transparent" />
                  <Button className="shrink-0"><Plus className="mr-2 h-4 w-4" /> Monitor</Button>
                </div>
              </motion.div>

              {/* Stat cards row */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statCards.map((s) => {
                  const Icon = s.icon;
                  return (
                    <motion.div key={s.label} variants={item}>
                      <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${s.color}/15`}>
                            <Icon className={`h-5 w-5 text-${s.color}`} />
                          </div>
                        </div>
                        <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts row: Risk Gauge + Donut + Bar */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Risk Score Gauge */}
                <motion.div variants={item}>
                  <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-6">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Aggregate Risk</h3>
                    <RiskGauge score={avgScore} size={180} label="Score" />
                  </div>
                </motion.div>

                {/* Donut chart — custom SVG matching reference style */}
                <motion.div variants={item}>
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Data Exposure</h3>
                    <div className="flex items-center gap-5">
                      <div className="relative flex-shrink-0">
                        <DonutChart data={exposureData} colors={pieColors} size={140} total={totalExposure} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        {exposureData.map((d, i) => (
                          <div key={d.name} className="flex items-center gap-2.5">
                            <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[i] }} />
                            <span className="text-xs font-medium text-foreground">{d.name}</span>
                            <span className="ml-auto text-xs font-bold text-foreground">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bar chart */}
                <motion.div variants={item}>
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Breach Timeline</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "12px" }} />
                          <Bar dataKey="count" fill="hsl(var(--cyber-purple))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Account cards */}
              <div className="space-y-4">
                {mockAccounts.map((account) => (
                  <motion.div key={account.email} variants={item}>
                    <div className="glass-card rounded-2xl p-6">
                      <div className="flex flex-col gap-5 md:flex-row md:items-center">
                        <div className="flex-shrink-0"><RiskGauge score={account.score} size={150} /></div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display text-lg font-bold text-foreground">{account.email}</h3>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {account.exposedData.map((d) => (
                              <span key={d} className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">{d}</span>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">Found in <span className="font-bold text-foreground">{account.breaches}</span> breach{account.breaches !== 1 && "es"}</p>
                          <div className="space-y-2">
                            {account.recentBreaches.map((b) => (
                              <div key={b.source} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 backdrop-blur-sm">
                                <div className="flex items-center gap-2.5"><AlertTriangle className="h-4 w-4 text-score-warning" /><span className="text-sm font-medium text-foreground">{b.source}</span></div>
                                <div className="text-right"><span className="text-xs text-muted-foreground">{b.date}</span><span className="ml-4 text-xs font-medium text-muted-foreground">{b.records} records</span></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </motion.div>
  );
};

export default BreachCheck;

import RiskGauge from "@/components/RiskGauge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/lib/app";
import MobileBreachCheck from "@/pages/mobile/MobileBreachCheck";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, Database, Eye, Globe, Key, Loader2,
  Lock, Mail, Phone, Plus, Search, Shield, ShieldAlert, Trash2
} from "lucide-react";
import React, { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// ─── Static mock accounts for the monitoring dashboard ───────────────────────
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

// Canonical exposure categories with icons
const EXPOSURE_CATEGORIES = [
  { name: "Email",    icon: Mail,  aliases: ["email addresses", "email"] },
  { name: "Password", icon: Lock,  aliases: ["passwords", "password"] },
  { name: "Phone",    icon: Phone, aliases: ["phone numbers", "phone"] },
  { name: "IP Address", icon: Globe, aliases: ["ip addresses", "ip address"] },
  { name: "Username", icon: Eye,   aliases: ["usernames", "username"] },
];

const pieColors = [
  "hsl(var(--cyber-light-blue))", "hsl(var(--cyber-red))", "hsl(var(--cyber-blue))",
  "hsl(var(--cyber-yellow))", "hsl(var(--cyber-teal))",
];

// ─── Normalise raw data-class strings into canonical category names ───────────
function normaliseExposedTypes(raw: string[]): string[] {
  const result = new Set<string>();
  raw.forEach((r) => {
    const lower = r.toLowerCase().trim();
    const match = EXPOSURE_CATEGORIES.find((c) =>
      c.aliases.some((a) => lower.includes(a))
    );
    if (match) result.add(match.name);
    // Keep as-is if no canonical match
    else result.add(r);
  });
  return Array.from(result);
}

// ─── Custom SVG donut chart ───────────────────────────────────────────────────
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
  const nonZero = data.filter((d) => d.value > 0);
  const nonZeroTotal = nonZero.reduce((s, d) => s + d.value, 0) || 1;

  nonZero.forEach((d, i) => {
    const sweepAngle = (d.value / nonZeroTotal) * (360 - gapAngle * nonZero.length);
    segments.push({
      startAngle: currentAngle + gapAngle / 2,
      endAngle: currentAngle + sweepAngle + gapAngle / 2,
      color: colors[data.indexOf(d) % colors.length],
    });
    currentAngle += sweepAngle + gapAngle;
  });

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPathD = (startDeg: number, endDeg: number, oR: number, iR: number) => {
    const s1 = toRad(startDeg);
    const s2 = toRad(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    const ox1 = center + oR * Math.cos(s1), oy1 = center + oR * Math.sin(s1);
    const ox2 = center + oR * Math.cos(s2), oy2 = center + oR * Math.sin(s2);
    const ix1 = center + iR * Math.cos(s2), iy1 = center + iR * Math.sin(s2);
    const ix2 = center + iR * Math.cos(s1), iy2 = center + iR * Math.sin(s1);
    return `M ${ox1} ${oy1} A ${oR} ${oR} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${iR} ${iR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.length === 0 ? (
        <path
          d={arcPathD(-89, 270, outerR, innerR)}
          fill="hsl(var(--muted))"
        />
      ) : (
        segments.map((seg, i) => (
          <path
            key={i}
            d={arcPathD(seg.startAngle, seg.endAngle, outerR, innerR)}
            fill={seg.color}
            className="transition-all duration-700 ease-out"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))" }}
          />
        ))
      )}
      <text x={center} y={center - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="10" fontWeight="500">Total</text>
      <text x={center} y={center + 14} textAnchor="middle" className="fill-foreground" fontSize="22" fontWeight="700" fontFamily="'Space Grotesk', sans-serif">{total}</text>
    </svg>
  );
};

// ─── Shared interface ─────────────────────────────────────────────────────────
interface LookupResult {
  score: number;
  breaches: number;
  exposedData: string[];          // normalised category names
  recentBreaches: { source: string; date: string; records: string }[];
  summary?: string;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

// ─── Main component ───────────────────────────────────────────────────────────
const BreachCheck: React.FC = () => {
  const isMobile = useIsMobile();
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [hasAccounts] = useState(true);

  // ── Derive everything from lookupResult OR mockAccounts ──────────────────
  const isShowingLookup = !!lookupResult;

  // Accounts used for the monitoring dashboard section
  const dashboardAccounts = mockAccounts;

  // Counts for dashboard stats (always from mockAccounts)
  const dashTotalBreaches = dashboardAccounts.reduce((s, a) => s + a.breaches, 0);
  const dashAvgScore = Math.round(
    dashboardAccounts.reduce((s, a) => s + a.score, 0) / dashboardAccounts.length
  );

  // Exposure breakdown — changes when a lookup result is shown
  const activeExposedTypes: string[] = isShowingLookup
    ? lookupResult!.exposedData
    : Array.from(new Set(dashboardAccounts.flatMap((a) => a.exposedData)));

  const exposureChartData = EXPOSURE_CATEGORIES.map((cat) => ({
    name: cat.name,
    icon: cat.icon,
    value: activeExposedTypes.filter((t) => t === cat.name).length,
  }));

  const totalExposure = exposureChartData.reduce((s, d) => s + d.value, 0);

  // Fallback: if none matched canonical cats, count unique raw strings
  const rawCount = activeExposedTypes.length;

  // Dynamic stat cards for the dashboard
  const emailRisk = isShowingLookup
    ? lookupResult!.exposedData.includes("Email") ? 80 : 20
    : 64;
  const passwordRisk = isShowingLookup
    ? lookupResult!.exposedData.includes("Password") ? 75 : 15
    : 42;

  const dynamicStatCards = [
    { label: "Total Threats",  value: String(isShowingLookup ? lookupResult!.breaches : dashTotalBreaches), icon: Shield, color: "cyber-red" },
    { label: "Email Risk",     value: `${emailRisk}%`,    icon: Mail,     color: "cyber-light-blue" },
    { label: "Password Risk",  value: `${passwordRisk}%`, icon: Key,      color: "cyber-yellow" },
    { label: "Data Leaks",     value: String(totalExposure || rawCount || dashTotalBreaches), icon: Database, color: "cyber-teal" },
  ];

  // Bar chart — breach timeline (static for dashboard, derived for lookup)
  const barData = isShowingLookup && lookupResult!.recentBreaches.length > 0
    ? lookupResult!.recentBreaches.reduce<{ name: string; count: number }[]>((acc, b) => {
        const year = b.date?.split("-")[0] || "Unknown";
        const existing = acc.find((x) => x.name === year);
        if (existing) existing.count += 1;
        else acc.push({ name: year, count: 1 });
        return acc;
      }, []).sort((a, b) => a.name.localeCompare(b.name))
    : [
        { name: "2022", count: 1 }, { name: "2023", count: 2 },
        { name: "2024", count: 1 }, { name: "2025", count: 3 },
      ];

  // ── API call ──────────────────────────────────────────────────────────────
  const handleLookup = async () => {
    if (!lookupEmail.trim()) return;
    setIsChecking(true);
    setLookupResult(null);
    try {
      const data = await api("/api/breach/check", {
        method: "POST",
        body: JSON.stringify({ email: lookupEmail }),
      });

      // Collect data_classes from all breaches
      const rawTypes: string[] = [];
      if (Array.isArray(data.breaches)) {
        data.breaches.forEach((b: any) => {
          if (Array.isArray(b.data_classes) && b.data_classes.length > 0) {
            rawTypes.push(...b.data_classes);
          }
        });
      }

      // If API returned no data_classes at all, fall back to ["Email"] since email was breached
      const exposedData = rawTypes.length > 0
        ? normaliseExposedTypes(rawTypes)
        : data.breach_count > 0
          ? ["Email"]
          : [];

      setLookupResult({
        score: data.risk_score ?? 0,
        breaches: data.breach_count ?? 0,
        exposedData,
        recentBreaches: (data.breaches ?? []).map((b: any) => ({
          source: b.name || b.domain || "Unknown",
          date: b.breach_date && b.breach_date !== "Unknown" ? b.breach_date : "Date unknown",
          records: b.records_count?.toString() || "—",
        })),
        summary: data.summary,
      });
    } catch (err) {
      console.error("Breach lookup error:", err);
    } finally {
      setIsChecking(false);
    }
  };

  if (isMobile) return <MobileBreachCheck />;

  const showCentered = !lookupResult && !isChecking && !hasAccounts;

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className={showCentered ? "flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center" : "space-y-6"}>

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {showCentered ? (
        <motion.div variants={item} className="w-full max-w-xl space-y-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyber-red/20 to-cyber-light-blue/20 text-cyber-red">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Breach Check</h1>
            <p className="max-w-sm text-sm text-muted-foreground">Check any email for known data breaches or add accounts to continuously monitor</p>
          </div>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex gap-3">
              <Input placeholder="Enter email to check for breaches…" value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookup()} />
              <Button onClick={handleLookup} disabled={!lookupEmail.trim()} className="shrink-0"><Search className="mr-2 h-4 w-4" /> Check</Button>
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
          {/* ── Lookup hero ────────────────────────────────────────────── */}
          <motion.div variants={item}>
            <div className="glass-hero-blue overflow-hidden rounded-2xl p-6 text-white">
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

          {/* ── Lookup results ──────────────────────────────────────────── */}
          <AnimatePresence>
            {(isChecking || lookupResult) && (
              <motion.div variants={item} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="glass-card overflow-hidden rounded-2xl p-6">
                  {isChecking ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Scanning breach databases for <span className="font-semibold text-foreground">{lookupEmail}</span>…
                      </p>
                    </div>
                  ) : lookupResult && (
                    <div className="space-y-4">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-foreground">Results for {lookupEmail}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          lookupResult.score >= 70 ? "bg-score-safe/10 text-score-safe"
                          : lookupResult.score >= 40 ? "bg-score-warning/10 text-score-warning"
                          : "bg-score-danger/10 text-score-danger"
                        }`}>
                          {lookupResult.score >= 70 ? "Low Risk" : lookupResult.score >= 40 ? "Moderate Risk" : "High Risk"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-5 md:flex-row md:items-start">
                        {/* Gauge */}
                        <div className="flex-shrink-0">
                          <RiskGauge score={lookupResult.score} size={170} />
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-3">
                          {/* Breach count */}
                          <p className="text-sm text-muted-foreground">
                            Found in <span className="font-bold text-foreground">{lookupResult.breaches}</span> known breach{lookupResult.breaches !== 1 && "es"}
                          </p>

                          {/* Exposed data types */}
                          {lookupResult.exposedData.length > 0 && (
                            <div>
                              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exposed Data Types</p>
                              <div className="flex flex-wrap gap-2">
                                {lookupResult.exposedData.map((d) => (
                                  <span key={d} className="rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">{d}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Summary from AI */}
                          {lookupResult.summary && (
                            <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-foreground">{lookupResult.summary}</p>
                          )}

                          {/* Recent breaches list */}
                          {lookupResult.recentBreaches.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Known Breaches</p>
                              {lookupResult.recentBreaches.map((b) => (
                                <div key={b.source} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 backdrop-blur-sm">
                                  <div className="flex items-center gap-2.5">
                                    <AlertTriangle className="h-4 w-4 text-score-warning" />
                                    <span className="text-sm font-medium text-foreground">{b.source}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs text-muted-foreground">{b.date}</span>
                                    {b.records !== "—" && (
                                      <span className="ml-4 text-xs font-medium text-muted-foreground">{b.records} records</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Zero-breach result */}
                          {lookupResult.breaches === 0 && (
                            <div className="flex items-center gap-3 rounded-xl bg-score-safe/10 px-4 py-3">
                              <Shield className="h-5 w-5 text-score-safe" />
                              <p className="text-sm font-medium text-score-safe">Great news — no known breaches found for this email.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Monitoring dashboard ────────────────────────────────────── */}
          {hasAccounts && (
            <>
              <motion.div variants={item}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-display text-lg font-bold text-foreground">Monitored Accounts</h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{mockAccounts.length} accounts</span>
                    <span>·</span>
                    <span>{dashTotalBreaches} breaches</span>
                  </div>
                </div>
              </motion.div>

              {/* Add account */}
              <motion.div variants={item}>
                <div className="glass-card flex gap-3 rounded-2xl p-4">
                  <Input placeholder="Add email to ongoing monitoring…" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="border-transparent bg-transparent" />
                  <Button className="shrink-0"><Plus className="mr-2 h-4 w-4" /> Monitor</Button>
                </div>
              </motion.div>

              {/* Stat cards — update when lookup is active */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {dynamicStatCards.map((s) => {
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

              {/* Charts row */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Risk gauge */}
                <motion.div variants={item}>
                  <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-6">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {isShowingLookup ? "Lookup Risk Score" : "Aggregate Risk"}
                    </h3>
                    <RiskGauge score={isShowingLookup ? lookupResult!.score : dashAvgScore} size={180} label="Score" />
                  </div>
                </motion.div>

                {/* Donut — exposure breakdown (dynamic) */}
                <motion.div variants={item}>
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Data Exposure</h3>
                    {isShowingLookup && (
                      <p className="mb-3 text-[11px] text-muted-foreground">Showing: {lookupEmail}</p>
                    )}
                    <div className="flex items-center gap-5">
                      <div className="relative flex-shrink-0">
                        <DonutChart
                          data={exposureChartData}
                          colors={pieColors}
                          size={140}
                          total={totalExposure || rawCount}
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        {exposureChartData.map((d, i) => {
                          const Icon = d.icon;
                          return (
                            <div key={d.name} className="flex items-center gap-2.5">
                              <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[i] }} />
                              <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs font-medium text-foreground">{d.name}</span>
                              <span className="ml-auto text-xs font-bold text-foreground">{d.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bar chart — breach timeline (dynamic) */}
                <motion.div variants={item}>
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Breach Timeline</h3>
                    {isShowingLookup && (
                      <p className="mb-3 text-[11px] text-muted-foreground">Showing: {lookupEmail}</p>
                    )}
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "12px" }} />
                          <Bar dataKey="count" fill="hsl(var(--cyber-light-blue))" radius={[8, 8, 0, 0]} />
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

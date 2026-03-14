import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIconLucide, Search, Shield, AlertTriangle, XCircle, ExternalLink, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RiskGauge from "@/components/RiskGauge";

interface ScanResult {
  url: string;
  overallScore: number;
  verdict: "Safe" | "Suspicious" | "Dangerous";
  googleSafeBrowsing: { status: string; score: number };
  virusTotal: { detected: number; total: number; score: number };
  flags: string[];
}

const mockResult: ScanResult = {
  url: "https://example-phishing.com/login",
  overallScore: 28,
  verdict: "Dangerous",
  googleSafeBrowsing: { status: "Flagged as phishing", score: 15 },
  virusTotal: { detected: 12, total: 70, score: 41 },
  flags: [
    "Domain registered less than 30 days ago",
    "SSL certificate mismatch",
    "Known phishing pattern in URL structure",
    "Redirects to suspicious IP address",
  ],
};

const MobileLinkScanner: React.FC = () => {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = () => {
    if (!url) return;
    setScanning(true);
    setResult(null);
    setTimeout(() => { setScanning(false); setResult(mockResult); }, 2000);
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict === "Safe") return "text-score-safe";
    if (verdict === "Suspicious") return "text-score-warning";
    return "text-score-danger";
  };

  const showCentered = !scanning && !result;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={showCentered ? "flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center pb-24 px-2" : "space-y-4 pb-24"}>
      {showCentered ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyber-green/20 to-cyber-teal/20">
            <Globe className="h-8 w-8 text-cyber-green" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Link Scanner</h1>
          <p className="text-sm text-muted-foreground mb-6">Paste any URL to check for threats</p>
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="relative">
              <LinkIconLucide className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="https://example.com" className="pl-10" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleScan()} />
            </div>
            <Button onClick={handleScan} disabled={!url} className="w-full">
              <Search className="mr-2 h-4 w-4" /> Scan URL
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="glass-card overflow-hidden rounded-2xl p-4">
            <div className="space-y-3">
              <div className="relative">
                <LinkIconLucide className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Enter URL to scan" className="pl-10" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleScan()} />
              </div>
              <Button onClick={handleScan} disabled={scanning || !url} className="w-full">
                {scanning ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <><Search className="mr-2 h-4 w-4" /> Scan</>}
              </Button>
            </div>
          </div>

          {scanning && (
            <div className="glass-card flex flex-col items-center rounded-2xl py-12">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-display text-base font-semibold text-foreground">Scanning…</p>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="glass-card flex flex-col items-center rounded-2xl py-6">
                  <RiskGauge score={result.overallScore} size={150} />
                  <p className={`mt-2 font-display text-xl font-bold ${getVerdictColor(result.verdict)}`}>{result.verdict}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><ExternalLink className="h-3 w-3" /> {result.url}</p>
                </div>

                <div className="glass-card rounded-2xl p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Shield className="h-3.5 w-3.5 text-cyber-blue" /> Google Safe Browsing</h3>
                  <p className="text-sm font-bold text-score-danger">{result.googleSafeBrowsing.status}</p>
                  <p className="text-xs text-muted-foreground">Score: {result.googleSafeBrowsing.score}/100</p>
                </div>

                <div className="glass-card rounded-2xl p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Shield className="h-3.5 w-3.5 text-cyber-purple" /> VirusTotal</h3>
                  <p className="text-sm font-bold text-score-warning">{result.virusTotal.detected}/{result.virusTotal.total} flagged</p>
                  <p className="text-xs text-muted-foreground">Score: {result.virusTotal.score}/100</p>
                </div>

                <div className="glass-card rounded-2xl p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><AlertTriangle className="h-3.5 w-3.5 text-score-danger" /> Flags</h3>
                  <ul className="space-y-2">
                    {result.flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-score-danger" />
                        <span className="text-foreground">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default MobileLinkScanner;

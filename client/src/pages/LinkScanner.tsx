import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIconLucide, Search, Shield, AlertTriangle, XCircle, ExternalLink, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RiskGauge from "@/components/RiskGauge";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileLinkScanner from "@/pages/mobile/MobileLinkScanner";

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

const LinkScanner: React.FC = () => {
  const isMobile = useIsMobile();
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

  if (isMobile) return <MobileLinkScanner />;

  const showCentered = !scanning && !result;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={showCentered ? "flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center" : "space-y-6"}>
      {showCentered ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyber-green/20 to-cyber-teal/20">
            <Globe className="h-10 w-10 text-cyber-green" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Link Scanner</h1>
          <p className="text-muted-foreground mb-8">Paste any URL to check for malware, phishing, and suspicious activity</p>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <LinkIconLucide className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://example.com"
                  className="h-12 pl-11 text-base"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                />
              </div>
              <Button onClick={handleScan} disabled={!url} className="h-12 px-6">
                <Search className="mr-2 h-4 w-4" /> Scan URL
              </Button>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">We check against Google Safe Browsing, VirusTotal, and other databases</p>
        </motion.div>
      ) : (
        <>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Link Scanner</h1>
            <p className="text-sm text-muted-foreground">Check URLs for malware, phishing, and suspicious activity</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <LinkIconLucide className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Enter a URL to scan" className="pl-10" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleScan()} />
                </div>
                <Button onClick={handleScan} disabled={scanning || !url}>
                  {scanning ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <><Search className="mr-2 h-4 w-4" /> Scan</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {scanning && (
            <Card><CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-display text-lg font-semibold text-foreground">Scanning URL…</p>
              <p className="text-sm text-muted-foreground">Checking against security databases</p>
            </CardContent></Card>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card><CardContent className="flex flex-col items-center py-8">
                  <RiskGauge score={result.overallScore} size={200} />
                  <p className={`mt-2 font-display text-2xl font-bold ${getVerdictColor(result.verdict)}`}>{result.verdict}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><ExternalLink className="h-3.5 w-3.5" /> {result.url}</p>
                </CardContent></Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-cyber-blue" /> Google Safe Browsing</CardTitle></CardHeader>
                    <CardContent><p className="text-lg font-bold text-score-danger">{result.googleSafeBrowsing.status}</p><p className="text-xs text-muted-foreground">Safety score: {result.googleSafeBrowsing.score}/100</p></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-cyber-purple" /> VirusTotal</CardTitle></CardHeader>
                    <CardContent><p className="text-lg font-bold text-score-warning">{result.virusTotal.detected}/{result.virusTotal.total} engines flagged</p><p className="text-xs text-muted-foreground">Safety score: {result.virusTotal.score}/100</p></CardContent></Card>
                </div>

                <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-score-danger" /> Flags & Warnings</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-2">{result.flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-score-danger" /><span className="text-foreground">{flag}</span></li>
                  ))}</ul></CardContent></Card>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default LinkScanner;

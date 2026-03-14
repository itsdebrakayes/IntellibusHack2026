import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, Clock, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import RiskGauge from "@/components/RiskGauge";

const mockResult = {
  score: 42,
  verdict: "58% Likely Deepfake",
  timeline: [
    { time: "0:03", description: "Facial micro-expression inconsistency", severity: "high" as const },
    { time: "0:12", description: "Lip sync deviation — 120ms mismatch", severity: "high" as const },
    { time: "0:28", description: "Unnatural eye blinking pattern", severity: "medium" as const },
    { time: "0:45", description: "Background warping near hairline", severity: "low" as const },
    { time: "1:02", description: "Skin texture anomaly on left cheek", severity: "medium" as const },
  ],
};

const MobileVideoDetection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<typeof mockResult | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); }
  };

  const handleScan = () => {
    if (!file) return;
    setScanning(true);
    setTimeout(() => { setScanning(false); setResult(mockResult); }, 3000);
  };

  const severityColor = (s: string) => s === "high" ? "text-score-danger" : s === "medium" ? "text-score-warning" : "text-score-safe";
  const severityBg = (s: string) => s === "high" ? "bg-score-danger/10" : s === "medium" ? "bg-score-warning/10" : "bg-score-safe/10";

  const showCentered = !file && !scanning && !result;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={showCentered ? "flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center pb-24 px-2" : "space-y-4 pb-24"}>
      {showCentered ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyber-light-blue/20 to-cyber-blue/20">
            <Clapperboard className="h-8 w-8 text-cyber-light-blue" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Video Detection</h1>
          <p className="text-sm text-muted-foreground mb-6">Analyze videos for deepfake indicators</p>
          <label className="glass-card flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-12 transition-all hover:border-primary/50">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">Upload a video</p>
            <p className="mt-1 text-xs text-muted-foreground">MP4, MOV, WebM up to 100MB</p>
            <input type="file" accept="video/*" className="hidden" onChange={handleFile} />
          </label>
        </motion.div>
      ) : (
        <>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Video Detection</h1>
            <p className="text-xs text-muted-foreground">Analyze videos for deepfake indicators</p>
          </div>

          <div className="glass-card overflow-hidden rounded-2xl p-4">
            {!file ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-12">
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Upload a video</p>
                <p className="text-xs text-muted-foreground">MP4, MOV, WebM up to 100MB</p>
                <input type="file" accept="video/*" className="hidden" onChange={handleFile} />
              </label>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3">
                  <Video className="h-6 w-6 text-cyber-light-blue" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <div className="flex w-full gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setFile(null); setResult(null); }}>Clear</Button>
                  <Button className="flex-1" onClick={handleScan} disabled={scanning}>
                    {scanning ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <><Video className="mr-2 h-4 w-4" /> Analyze</>}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {scanning && (
            <div className="glass-card flex flex-col items-center rounded-2xl py-12">
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-display text-base font-semibold text-foreground">Analyzing…</p>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="glass-card flex flex-col items-center rounded-2xl py-6">
                  <RiskGauge score={result.score} size={150} label="Authenticity" />
                  <p className="mt-2 font-display text-base font-bold text-score-danger">{result.verdict}</p>
                </div>
                <div className="glass-card rounded-2xl p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-cyber-light-blue" /> Timeline
                  </h3>
                  <div className="space-y-2">
                    {result.timeline.map((t, i) => (
                      <div key={i} className={`flex items-start gap-2.5 rounded-xl p-3 ${severityBg(t.severity)}`}>
                        <span className={`mt-0.5 font-mono text-xs font-bold ${severityColor(t.severity)}`}>{t.time}</span>
                        <div>
                          <p className="text-sm text-foreground">{t.description}</p>
                          <span className={`text-[10px] font-medium uppercase ${severityColor(t.severity)}`}>{t.severity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default MobileVideoDetection;

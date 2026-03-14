import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Mic, Clock, AudioLines } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RiskGauge from "@/components/RiskGauge";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileAudioDetection from "@/pages/mobile/MobileAudioDetection";

const mockResult = {
  score: 72,
  verdict: "72% Likely Authentic",
  anomalies: [
    { time: "0:14", description: "Slight pitch inconsistency — may indicate splicing", severity: "low" as const },
    { time: "0:31", description: "Background noise pattern suddenly changes", severity: "medium" as const },
    { time: "1:05", description: "Micro-pause with unnatural resumption cadence", severity: "low" as const },
  ],
};

const AudioDetection: React.FC = () => {
  const isMobile = useIsMobile();
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
    setTimeout(() => { setScanning(false); setResult(mockResult); }, 2000);
  };

  const severityColor = (s: string) => s === "high" ? "text-score-danger" : s === "medium" ? "text-score-warning" : "text-score-safe";
  const severityBg = (s: string) => s === "high" ? "bg-score-danger/10" : s === "medium" ? "bg-score-warning/10" : "bg-score-safe/10";

  if (isMobile) return <MobileAudioDetection />;

  const showCentered = !file && !scanning && !result;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={showCentered ? "flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center" : "space-y-6"}>
      {showCentered ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyber-teal/20 to-cyber-green/20">
            <AudioLines className="h-10 w-10 text-cyber-teal" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Audio Detection</h1>
          <p className="text-muted-foreground mb-8">Upload an audio file to detect synthetic voice patterns and AI manipulation</p>
          <label className="glass-card flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 transition-all hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
              <Upload className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-display text-base font-semibold text-foreground">Drop an audio file here or click to upload</p>
            <p className="mt-1 text-sm text-muted-foreground">MP3, WAV, M4A up to 25MB</p>
            <input type="file" accept="audio/*" className="hidden" onChange={handleFile} />
          </label>
        </motion.div>
      ) : (
        <>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Deepfake Audio Detection</h1>
            <p className="text-sm text-muted-foreground">Upload an audio file to detect synthetic voice patterns</p>
          </div>

          <Card><CardContent className="p-6">
            {!file ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 transition-colors hover:border-primary/50 hover:bg-muted/50">
                <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-display text-base font-semibold text-foreground">Drop an audio file here or click to upload</p>
                <p className="text-sm text-muted-foreground">MP3, WAV, M4A up to 25MB</p>
                <input type="file" accept="audio/*" className="hidden" onChange={handleFile} />
              </label>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3">
                  <Mic className="h-8 w-8 text-cyber-teal" />
                  <div><p className="text-sm font-medium text-foreground">{file.name}</p><p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>Clear</Button>
                  <Button onClick={handleScan} disabled={scanning}>
                    {scanning ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <><Mic className="mr-2 h-4 w-4" /> Analyze Audio</>}
                  </Button>
                </div>
              </div>
            )}
          </CardContent></Card>

          {scanning && (
            <Card><CardContent className="flex flex-col items-center py-16">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-display text-lg font-semibold text-foreground">Analyzing audio waveform…</p>
            </CardContent></Card>
          )}

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card><CardContent className="flex flex-col items-center py-8">
                  <RiskGauge score={result.score} size={200} />
                  <p className="mt-2 font-display text-lg font-bold text-score-safe">{result.verdict}</p>
                </CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-cyber-teal" /> Detected Anomalies</CardTitle></CardHeader>
                  <CardContent><div className="space-y-3">
                    {result.anomalies.map((a, i) => (
                      <div key={i} className={`flex items-start gap-3 rounded-lg p-3 ${severityBg(a.severity)}`}>
                        <span className={`mt-0.5 font-mono text-sm font-bold ${severityColor(a.severity)}`}>{a.time}</span>
                        <div><p className="text-sm text-foreground">{a.description}</p><span className={`text-xs font-medium uppercase ${severityColor(a.severity)}`}>{a.severity}</span></div>
                      </div>
                    ))}
                  </div></CardContent></Card>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default AudioDetection;

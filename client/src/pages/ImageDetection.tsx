import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, AlertTriangle, CheckCircle, ScanLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import RiskGauge from "@/components/RiskGauge";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileImageDetection from "@/pages/mobile/MobileImageDetection";

interface DetectionResult {
  score: number;
  verdict: string;
  stats: { label: string; value: number; color: string }[];
  annotations: { label: string; x: number; y: number }[];
}

const mockResult: DetectionResult = {
  score: 35,
  verdict: "65% Likely AI-Generated",
  stats: [
    { label: "Face Consistency", value: 42, color: "bg-score-warning" },
    { label: "Lighting Analysis", value: 78, color: "bg-score-safe" },
    { label: "Artifact Detection", value: 28, color: "bg-score-danger" },
    { label: "Texture Elasticity", value: 55, color: "bg-score-warning" },
    { label: "Edge Coherence", value: 33, color: "bg-score-danger" },
  ],
  annotations: [
    { label: "Extra finger detected", x: 25, y: 60 },
    { label: "Inconsistent shadow direction", x: 65, y: 30 },
    { label: "Blurred ear detail", x: 80, y: 20 },
    { label: "Texture repetition artifact", x: 40, y: 75 },
  ],
};

const ImageDetection: React.FC = () => {
  const isMobile = useIsMobile();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); }
  };

  const handleScan = () => {
    if (!file) return;
    setScanning(true);
    setTimeout(() => { setScanning(false); setResult(mockResult); }, 2500);
  };

  if (isMobile) return <MobileImageDetection />;

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
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20">
            <ScanLine className="h-10 w-10 text-cyber-blue" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Image Detection</h1>
          <p className="text-muted-foreground mb-8">Upload an image to scan for AI-generated artifacts and deepfake indicators</p>
          <label className="glass-card flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 transition-all hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
              <Upload className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-display text-base font-semibold text-foreground">Drop an image here or click to upload</p>
            <p className="mt-1 text-sm text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </motion.div>
      ) : (
        <>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Deepfake Image Detection</h1>
            <p className="text-sm text-muted-foreground">Upload an image to scan for AI-generated artifacts</p>
          </div>

          <Card>
            <CardContent className="p-6">
              {!preview ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 transition-colors hover:border-primary/50 hover:bg-muted/50">
                  <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-display text-base font-semibold text-foreground">Drop an image here or click to upload</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative mx-auto max-w-lg overflow-hidden rounded-xl">
                    <img src={preview} alt="Uploaded" className="w-full" />
                    {scanning && (
                      <div className="absolute inset-0 bg-primary/10">
                        <div className="absolute left-0 right-0 h-1 animate-scan-line bg-primary/60" />
                      </div>
                    )}
                    {result && result.annotations.map((a, i) => (
                      <div key={i} className="absolute flex items-center gap-1" style={{ left: `${a.x}%`, top: `${a.y}%`, transform: "translate(-50%, -50%)" }}>
                        <div className="h-5 w-5 rounded-full border-2 border-score-danger bg-score-danger/20 animate-pulse-glow" />
                        <span className="whitespace-nowrap rounded bg-card/90 px-2 py-0.5 text-[10px] font-medium text-foreground shadow">{a.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => { setFile(null); setPreview(null); setResult(null); }}>Clear</Button>
                    <Button onClick={handleScan} disabled={scanning}>
                      {scanning ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <><ImageIcon className="mr-2 h-4 w-4" /> Analyze Image</>}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2">
                <Card><CardContent className="flex flex-col items-center py-8">
                  <RiskGauge score={result.score} size={180} label="Authenticity" />
                  <p className="mt-2 font-display text-lg font-bold text-score-danger">{result.verdict}</p>
                </CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Analysis Breakdown</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {result.stats.map((s) => (
                      <div key={s.label}>
                        <div className="mb-1 flex justify-between text-xs"><span className="text-foreground">{s.label}</span><span className="text-muted-foreground">{s.value}%</span></div>
                        <div className="h-2 w-full rounded-full bg-muted"><div className={`h-2 rounded-full ${s.color} transition-all duration-1000`} style={{ width: `${s.value}%` }} /></div>
                      </div>
                    ))}
                  </CardContent></Card>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default ImageDetection;

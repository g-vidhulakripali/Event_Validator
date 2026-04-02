/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "motion/react";
import { Camera, X, CheckCircle2, AlertCircle, Users, Briefcase, History, Settings } from "lucide-react";
import { cn } from "@/src/lib/utils";

type ScanMode = "Conference" | "Workshop";

interface ScanResult {
  id: string;
  data: string;
  timestamp: Date;
  mode: ScanMode;
}

export default function App() {
  const [mode, setMode] = useState<ScanMode>("Conference");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    setIsScannerOpen(true);
    setLastScan(null);
    
    // Small delay to ensure the container is rendered
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            const result: ScanResult = {
              id: Math.random().toString(36).substr(2, 9),
              data: decodedText,
              timestamp: new Date(),
              mode: mode,
            };
            setLastScan(result);
            setHistory(prev => [result, ...prev].slice(0, 50));
            stopScanner();
          },
          (errorMessage) => {
            // Silently handle scan errors (common during active scanning)
          }
        );
      } catch (err) {
        console.error("Failed to start scanner:", err);
        setIsScannerOpen(false);
      }
    }, 300);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
    setIsScannerOpen(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">EventScan</h1>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 pb-24">
        {/* Mode Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setMode("Conference")}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300",
              mode === "Conference"
                ? "bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm"
                : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
            )}
          >
            <Users className={cn("w-8 h-8", mode === "Conference" ? "text-indigo-600" : "text-slate-400")} />
            <span className="font-semibold">Conference</span>
          </button>
          <button
            onClick={() => setMode("Workshop")}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300",
              mode === "Workshop"
                ? "bg-indigo-50 border-indigo-600 text-indigo-600 shadow-sm"
                : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
            )}
          >
            <Briefcase className={cn("w-8 h-8", mode === "Workshop" ? "text-indigo-600" : "text-slate-400")} />
            <span className="font-semibold">Workshop</span>
          </button>
        </div>

        {/* Main Action */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Ready to Scan?</h2>
            <p className="text-slate-500 text-sm">
              Point your camera at the attendee's QR code for the <span className="font-semibold text-indigo-600">{mode}</span>.
            </p>
          </div>
          
          <button
            onClick={startScanner}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-indigo-200"
          >
            <Camera className="w-6 h-6" />
            Open Scanner
          </button>
        </div>

        {/* Recent Scan Result */}
        <AnimatePresence>
          {lastScan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8 flex items-start gap-4"
            >
              <div className="bg-emerald-500 rounded-full p-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 w-full overflow-hidden">
                <h3 className="font-bold text-emerald-900">Scan Successful</h3>
                <p className="text-emerald-700 text-sm break-all">{lastScan.data}</p>
                <p className="text-emerald-600/60 text-xs mt-1">
                  {lastScan.timestamp.toLocaleTimeString()} • {lastScan.mode}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Recent History
            </h3>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              {history.length} SCANS
            </span>
          </div>
          
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">No scans yet today</p>
              </div>
            ) : (
              history.map((scan) => (
                <div key={scan.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      scan.mode === "Conference" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                    )}>
                      {scan.mode === "Conference" ? <Users className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm truncate max-w-[150px]">{scan.data}</p>
                      <p className="text-slate-400 text-xs">{scan.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    scan.mode === "Conference" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  )}>
                    {scan.mode}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Scanner Modal Overlay */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
          >
            <div className="absolute top-6 right-6 z-[60]">
              <button
                onClick={stopScanner}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full max-w-md px-6 text-center mb-8">
              <h2 className="text-white text-xl font-bold mb-2">Scanning {mode}</h2>
              <p className="text-white/60 text-sm">Align QR code within the frame</p>
            </div>

            <div className="relative w-full max-w-md aspect-square px-6">
              <div id="reader" className="w-full h-full rounded-3xl overflow-hidden border-2 border-white/20"></div>
              {/* Decorative corners */}
              <div className="absolute top-10 left-10 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
              <div className="absolute top-10 right-10 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
              <div className="absolute bottom-10 left-10 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
              <div className="absolute bottom-10 right-10 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
              
              {/* Scanning line animation */}
              <motion.div
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-10 right-10 h-0.5 bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10"
              />
            </div>
            <div className="mt-12 text-white/40 text-xs uppercase tracking-widest font-bold">
              Event Scanner Pro v1.0
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav (Mobile Style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-30">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-indigo-600">
            <Camera className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Scan</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
            <History className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">History</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600">
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}


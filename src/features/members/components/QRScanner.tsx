"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Html5Qrcode } from "html5-qrcode";
import { logAttendance } from "../actions";
// 🏛️ Added User icon for the identity card UI
import { Camera, X, CheckCircle2, ScanLine, Laptop, Lock, Scan, CameraOff, ImageUp, ChevronDown, User } from "lucide-react";

type ScanState = "idle" | "starting" | "scanning" | "success" | "error";

export function QRScanner() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [scanState, setScanState] = useState<ScanState>("idle");
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>("");
    const [imageError, setImageError] = useState<string | null>(null);

    // 🏛️ NEW FEATURE: Store the identity of the person just scanned
    const [scannedMember, setScannedMember] = useState<{ name: string } | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isRunningRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const safeStop = async () => {
        if (scannerRef.current && isRunningRef.current) {
            isRunningRef.current = false;
            await scannerRef.current.stop().catch(() => { });
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        Html5Qrcode.getCameras()
            .then((devices) => {
                if (devices.length) {
                    setCameras(devices);
                    const back = devices.find(d => /back|rear|environment/i.test(d.label));
                    setSelectedCamera(back?.id ?? devices[0].id);
                }
            })
            .catch(() => setScanState("error"));
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !selectedCamera) return;

        scannerRef.current = new Html5Qrcode("qr-viewport", { verbose: false });
        setScanState("starting");
        setImageError(null);

        let cancelled = false;

        scannerRef.current
            .start(
                selectedCamera,
                { fps: 15, qrbox: { width: 200, height: 200 }, aspectRatio: 1.0 },
                async (decodedText) => {
                    if (cancelled) return;

                    // Stop scanning immediately on detection
                    isRunningRef.current = false;
                    await scannerRef.current?.stop().catch(() => { });

                    try {
                        // 🏛️ CAPTURE IDENTITY: Log attendance and get the name back
                        const result = await logAttendance(decodedText);
                        if (result?.name) {
                            setScannedMember({ name: result.name });
                        }
                        setScanState("success");
                    } catch {
                        setScanState("error");
                    }

                    // 🏛️ INCREASED TIMEOUT: Give staff 3.5s to read the member's name
                    setTimeout(() => handleClose(), 3500);
                },
                () => { }
            )
            .then(() => {
                if (!cancelled) {
                    isRunningRef.current = true;
                    setScanState("scanning");
                }
            })
            .catch(() => { if (!cancelled) setScanState("error"); });

        return () => {
            cancelled = true;
            safeStop();
        };
    }, [selectedCamera, isOpen]);

    const handleClose = async () => {
        await safeStop();
        setIsOpen(false);
        setScanState("idle");
        setCameras([]);
        setSelectedCamera("");
        setImageError(null);
        setScannedMember(null); // 🏛️ Reset identity on close
    };

    const handleCameraChange = async (newId: string) => {
        await safeStop();
        setSelectedCamera(newId);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageError(null);

        const fileScanner = new Html5Qrcode("qr-file-scanner", { verbose: false });
        try {
            const result = await fileScanner.scanFile(file, false);
            await safeStop();

            // 🏛️ FILE UPLOAD IDENTITY: Also retrieve name for file scans
            const attendanceResult = await logAttendance(result);
            if (attendanceResult?.name) {
                setScannedMember({ name: attendanceResult.name });
            }

            setScanState("success");
            setTimeout(() => handleClose(), 3500);
        } catch {
            setImageError("No QR code found in this image.");
        } finally {
            fileScanner.clear();
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const modalContent = isOpen ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl border border-zinc-800 relative">
                <div className="p-6 flex flex-col gap-4">

                    {/* Header */}
                    <div className="relative flex items-center justify-center">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-full mb-2">
                                <ScanLine className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Live scanner</span>
                            </div>
                            <h3 className="text-base font-semibold text-white tracking-tight">Fast-pass check-in</h3>
                            <p className="text-xs text-zinc-400 mt-0.5">Point camera at a member&apos;s QR pass</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="absolute right-0 top-0 w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-red-500 hover:text-white rounded-full text-zinc-400 transition-all active:scale-90"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Viewport */}
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-square w-full">
                        <div id="qr-viewport" className="absolute inset-0 w-full h-full" />

                        {/* Starting/Idle States */}
                        {(scanState === "idle" || scanState === "starting") && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 z-10 pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <Scan className="w-5 h-5 text-zinc-500 animate-pulse" />
                                </div>
                                <span className="text-xs text-zinc-500">
                                    {scanState === "starting" ? "Starting camera…" : "Initializing…"}
                                </span>
                            </div>
                        )}

                        {/* Error State */}
                        {scanState === "error" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 z-10 pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <CameraOff className="w-5 h-5 text-red-400" />
                                </div>
                                <span className="text-xs text-red-400">Camera unavailable</span>
                            </div>
                        )}

                        {/* 🏛️ IMPROVED SUCCESS UI: Show scanned identity */}
                        {scanState === "success" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/95 z-30 animate-in zoom-in-95 duration-300">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center">
                                        <User className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-4 border-zinc-950">
                                        <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                                    </div>
                                </div>
                                <div className="text-center px-6">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Access Granted</p>
                                    <h2 className="text-xl font-black text-white uppercase italic tracking-tight truncate max-w-full">
                                        {scannedMember?.name || "Member Verified"}
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-2 font-medium">Automatic check-in recorded.</p>
                                </div>
                            </div>
                        )}

                        {/* Scanning HUD */}
                        {scanState === "scanning" && (
                            <div className="absolute inset-0 pointer-events-none z-20">
                                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-400" />
                                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-400" />
                                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-400" />
                                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-400" />
                                <div className="absolute left-4 right-4 h-px bg-blue-400/60 animate-scan-move" />
                            </div>
                        )}
                    </div>

                    {/* Camera Selectors */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={scanState === "success"}
                            className="flex items-center justify-center gap-1.5 px-4 h-10 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-400 text-xs font-medium hover:bg-zinc-700 disabled:opacity-40 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <ImageUp className="w-3.5 h-3.5 shrink-0" />
                            Upload image
                        </button>

                        {cameras.length > 1 && (
                            <div className="relative flex-1">
                                <select
                                    value={selectedCamera}
                                    onChange={(e) => handleCameraChange(e.target.value)}
                                    disabled={scanState === "success"}
                                    className="w-full h-10 appearance-none bg-zinc-800 border border-zinc-700 rounded-xl pl-3 pr-8 text-xs font-medium text-zinc-400 outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-40 transition-all cursor-pointer"
                                >
                                    {cameras.map((cam) => (
                                        <option key={cam.id} value={cam.id}>
                                            {cam.label || `Camera ${cam.id}`}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    {imageError && (
                        <p className="text-xs text-red-400 text-center -mt-1">{imageError}</p>
                    )}

                    <div id="qr-file-scanner" className="hidden" />
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                    {/* Footer System Status */}
                    <div className="flex items-center justify-center gap-3 pt-3 border-t border-zinc-800">
                        <div className="flex items-center gap-1.5 text-zinc-500">
                            <Laptop className="w-3 h-3" />
                            <span className="text-[10px] font-medium uppercase tracking-widest">Device Authorized</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <div className="flex items-center gap-1.5 text-zinc-500">
                            <Lock className="w-3 h-3" />
                            <span className="text-[10px] font-medium uppercase tracking-widest">Encrypted</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                #qr-viewport { border: none !important; padding: 0 !important; background: transparent !important; }
                #qr-viewport video {
                    position: absolute !important;
                    inset: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    border-radius: 0 !important;
                }
                #qr-viewport__scan_region { display: none !important; }
                #qr-viewport__dashboard { display: none !important; }
                #qr-viewport canvas { opacity: 0 !important; pointer-events: none !important; }
                #qr-viewport img { display: none !important; }

                @keyframes scan-move {
                    0%, 100% { top: 1rem; }
                    50% { top: calc(100% - 1rem); }
                }
                .animate-scan-move { animation: scan-move 2s ease-in-out infinite; position: absolute; }
            `}</style>
        </div>
    ) : null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(true)}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-950 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
                <Camera className="w-3.5 h-3.5 group-hover:rotate-6 transition-transform" />
                Scan pass
            </button>

            {/* 🏛️ TELEPORT THE MODAL: Bypasses parent CSS constraints */}
            {mounted && isOpen && createPortal(modalContent, document.body)}
        </div>
    );
}
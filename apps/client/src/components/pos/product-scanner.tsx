"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button, Card, Input } from "@inventra/ui";

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats?: () => Promise<string[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

function parseScannedValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as { productId?: string };
    return parsed.productId ?? trimmed;
  } catch {
    return trimmed;
  }
}

export function ProductScanner({ onDetected }: { onDetected: (productId: string) => Promise<void> }) {
  const [rawValue, setRawValue] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraSupported, setCameraSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setCameraSupported(Boolean(window.BarcodeDetector && navigator.mediaDevices?.getUserMedia));
    return () => {
      stopCamera();
    };
  }, []);

  function stopCamera() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  }

  async function resolveRawValue(value: string) {
    const productId = parseScannedValue(value);

    if (!productId) {
      toast.error("Scan data could not be read");
      return;
    }

    await onDetected(productId);
    setRawValue("");
  }

  async function startCamera() {
    if (!window.BarcodeDetector || !videoRef.current) {
      toast.error("Camera scanning is not supported in this browser");
      return;
    }

    const detector = new window.BarcodeDetector({
      formats: ["qr_code", "code_128", "ean_13", "ean_8"]
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      }
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
    setCameraActive(true);

    intervalRef.current = window.setInterval(async () => {
      if (!videoRef.current) {
        return;
      }

      const results = await detector.detect(videoRef.current);

      if (!results[0]?.rawValue) {
        return;
      }

      await resolveRawValue(results[0].rawValue);
      toast.success("Code detected");
      stopCamera();
    }, 900);
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Scanner</p>
        <h2 className="font-display text-3xl text-ink">Scan or paste a product code.</h2>
        <p className="text-sm leading-6 text-stone-500">
          Inventra accepts the generated QR payload or a raw product id. Camera scan is enabled when the browser supports BarcodeDetector.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-ink" htmlFor="scan-input">
          Manual code input
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="scan-input"
            onChange={(event) => setRawValue(event.target.value)}
            placeholder='{"productId":"..."} or raw product id'
            value={rawValue}
          />
          <Button
            onClick={async () => {
              await resolveRawValue(rawValue);
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Camera scan</p>
          <Button onClick={cameraActive ? stopCamera : startCamera} variant={cameraActive ? "danger" : "secondary"}>
            {cameraActive ? "Stop Camera" : "Start Camera"}
          </Button>
        </div>
        <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-900/90 p-4">
          {cameraSupported ? (
            <video ref={videoRef} className="h-72 w-full rounded-2xl object-cover" muted playsInline />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-2xl bg-stone-950 text-center text-sm text-stone-300">
              Camera scan is unavailable on this browser. Manual scan still works.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

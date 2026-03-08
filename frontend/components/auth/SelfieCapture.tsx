'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SelfieCaptureProps {
  onSubmit: (imageData: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const SelfieCapture = ({ onSubmit, loading, error }: SelfieCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Could not access camera. Please allow camera permissions and try again.');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCaptured(imageData);
      stopCamera();
    }
  }, [stopCamera]);

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!captured) return;
    await onSubmit(captured);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Liveness Check</CardTitle>
        <CardDescription>
          Take a live selfie to confirm your identity. Make sure your face is clearly visible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Instructions */}
        {!cameraActive && !captured && (
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 space-y-2">
            <p className="font-medium">📸 Before you take your selfie:</p>
            <ul className="space-y-1 text-xs">
              <li>• Find a well-lit area</li>
              <li>• Look directly at the camera</li>
              <li>• Remove glasses or hat if possible</li>
              <li>• Keep your face within the frame</li>
            </ul>
          </div>
        )}

        {/* Camera View */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full rounded-lg bg-black ${cameraActive ? 'block' : 'hidden'}`}
          style={{ minHeight: cameraActive ? '300px' : '0' }}
        />

        {/* Captured Photo */}
        {captured && (
          <div className="rounded-lg overflow-hidden">
            <img src={captured} alt="Captured selfie" className="w-full rounded-lg" />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {cameraError && <p className="text-sm text-red-500">{cameraError}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Actions */}
        <div className="space-y-2">
          {!cameraActive && !captured && (
            <Button onClick={startCamera} className="w-full">
              📷 Open Camera
            </Button>
          )}

          {cameraActive && (
            <Button onClick={capturePhoto} className="w-full">
              📸 Take Selfie
            </Button>
          )}

          {captured && (
            <>
              <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : '✅ Submit Selfie'}
              </Button>
              <Button onClick={retake} variant="outline" className="w-full" disabled={loading}>
                🔄 Retake
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
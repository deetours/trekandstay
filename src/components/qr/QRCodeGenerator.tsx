import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Share2, Printer } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  title?: string;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  includeLabel?: boolean;
  customColor?: {
    dark: string;
    light: string;
  };
}

export default function QRCodeGenerator({
  url,
  title = 'Trek & Stay',
  size = 300,
  errorCorrectionLevel = 'H',
  includeLabel = true,
  customColor = { dark: '#1F2937', light: '#FFFFFF' }
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!canvasRef.current) {
          throw new Error('Canvas ref not found');
        }

        // Generate QR code on canvas
        await QRCode.toCanvas(canvasRef.current, url, {
          errorCorrectionLevel,
          type: 'image/png',
          quality: 0.95,
          margin: 1,
          width: size,
          color: customColor
        });

        // Also get data URL for download
        const dataUrl = await QRCode.toDataURL(url, {
          errorCorrectionLevel,
          type: 'image/png',
          quality: 0.95,
          margin: 1,
          width: size,
          color: customColor
        });

        setQrDataUrl(dataUrl);
        setLoading(false);
      } catch (err) {
        console.error('QR Generation error:', err);
        setError('Failed to generate QR code');
        setLoading(false);
      }
    };

    generateQR();
  }, [url, size, errorCorrectionLevel, customColor]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `trek-stay-${title.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Trek & Stay - ${title}`,
          text: 'Download Trek & Stay app now!',
          url
        });
      } else {
        alert('Share not supported on this device');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=500,width=500');
    if (printWindow && canvasRef.current) {
      const canvas = canvasRef.current as HTMLCanvasElement;
      const printDoc = printWindow.document;
      printDoc.write(`
        <html>
          <head>
            <title>Trek & Stay QR Code</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              .container {
                text-align: center;
              }
              h1 {
                color: #1F2937;
                margin-bottom: 10px;
              }
              p {
                color: #6B7280;
                margin-bottom: 20px;
              }
              canvas {
                border: 2px solid #D1D5DB;
                border-radius: 8px;
                max-width: 100%;
              }
              .text {
                margin-top: 20px;
                color: #6B7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${title}</h1>
              <p>Trek & Stay App - Download Now!</p>
              <img src="${canvas.toDataURL()}" style="max-width: 300px; border: 2px solid #D1D5DB; border-radius: 8px;">
              <div class="text">
                <p>Scan with your phone camera to download Trek & Stay app</p>
                <p>${url}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printDoc.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-3"></div>
          <p className="text-gray-600">Generating QR code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <div className="flex flex-col items-center gap-4">
        {includeLabel && (
          <div className="text-center mb-2">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">Trek & Stay App Download</p>
          </div>
        )}

        {/* Canvas for QR */}
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-emerald-300 shadow-lg">
          <canvas
            ref={canvasRef}
            className="mx-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* URL Display */}
        <div className="bg-gray-50 p-4 rounded-lg w-full">
          <p className="text-xs text-gray-600 mb-2">This QR points to:</p>
          <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
            <code className="flex-1 text-sm text-gray-700 break-all">{url}</code>
            <button
              onClick={handleCopyUrl}
              className="flex-shrink-0 text-gray-500 hover:text-emerald-600 transition-colors"
              title="Copy URL"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && <p className="text-xs text-emerald-600 mt-1">✓ Copied!</p>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Print</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>

        <button
          onClick={handleCopyUrl}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          <Copy className="w-4 h-4" />
          <span className="hidden sm:inline">Copy Link</span>
        </button>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How to Use</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Download the QR code and print on posters/flyers</li>
          <li>✓ Share on social media or email campaigns</li>
          <li>✓ Customers scan with phone camera</li>
          <li>✓ App automatically opens to install</li>
          <li>✓ Track scans in analytics dashboard</li>
        </ul>
      </div>
    </div>
  );
}

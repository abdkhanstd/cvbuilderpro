"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";
import QRCode from "qrcode";

interface QRCodeGeneratorProps {
  url: string;
  label: string;
}

export function QRCodeGenerator({ url, label }: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const generateQRCode = async () => {
    if (!url) return;

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    generateQRCode();
  };

  if (!url) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleOpen}
          title={`Generate QR code for ${label}`}
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {label}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {qrCodeDataUrl && (
            <div className="p-4 bg-white rounded-lg border">
              <img
                src={qrCodeDataUrl}
                alt={`QR code for ${label}`}
                className="w-48 h-48"
              />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Scan this QR code to visit:
            </p>
            <p className="text-sm font-mono break-all">{url}</p>
          </div>
          <Button
            onClick={() => {
              const link = document.createElement('a');
              link.href = qrCodeDataUrl;
              link.download = `${label.replace(/\s+/g, '_')}_qr_code.png`;
              link.click();
            }}
            className="w-full"
          >
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
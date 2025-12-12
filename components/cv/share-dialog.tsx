"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Copy, QrCode, ExternalLink, Trash2, Plus } from "lucide-react";

interface ShareDialogProps {
  cvId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareData {
  id: string;
  shareUrl: string;
  qrCodeUrl: string;
  isActive: boolean;
  expiresAt: string | null;
  allowDownload: boolean;
  viewCount: number;
  downloadCount: number;
  attachedCvs: string[];
  createdAt: string;
}

export function ShareDialog({ cvId, isOpen, onClose }: ShareDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [userCvs, setUserCvs] = useState<any[]>([]);
  const [selectedCv, setSelectedCv] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadShareData();
      loadUserCvs();
    }
  }, [isOpen, cvId]);

  const loadShareData = async () => {
    try {
      const response = await fetch(`/api/cvs/${cvId}/share`);
      if (response.ok) {
        const data = await response.json();
        setShareData(data.share);
        if (data.share?.expiresAt) {
          setExpirationDate(new Date(data.share.expiresAt).toISOString().split('T')[0]);
        } else {
          setExpirationDate("");
        }
      }
    } catch (error) {
      console.error("Failed to load share data:", error);
    }
  };

  const loadUserCvs = async () => {
    try {
      const response = await fetch("/api/cvs");
      if (response.ok) {
        const data = await response.json();
        setUserCvs(data.cvs.filter((cv: any) => cv.id !== cvId));
      }
    } catch (error) {
      console.error("Failed to load user CVs:", error);
    }
  };

  const createShare = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cvs/${cvId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        setShareData(data.share);
        toast({
          title: "Share link created",
          description: "Your CV is now shareable with a public link and QR code.",
        });
      } else {
        throw new Error("Failed to create share link");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create share link",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateShare = async (updates: Partial<ShareData>) => {
    if (!shareData) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/cvs/${cvId}/share`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setShareData(data.share);
        toast({
          title: "Share settings updated",
          description: "Your sharing preferences have been saved.",
        });
      } else {
        throw new Error("Failed to update share settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update share settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteShare = async () => {
    if (!shareData) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/cvs/${cvId}/share`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShareData(null);
        toast({
          title: "Sharing stopped",
          description: "Your CV is no longer publicly accessible.",
        });
      } else {
        throw new Error("Failed to stop sharing");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to stop sharing",
      });
    } finally {
      setLoading(false);
    }
  };

  const attachCv = async () => {
    if (!selectedCv || !shareData) return;

    const newAttachedCvs = [...shareData.attachedCvs, selectedCv];
    await updateShare({ attachedCvs: newAttachedCvs });
    setSelectedCv("");
  };

  const detachCv = async (cvIdToRemove: string) => {
    if (!shareData) return;

    const newAttachedCvs = shareData.attachedCvs.filter(id => id !== cvIdToRemove);
    await updateShare({ attachedCvs: newAttachedCvs });
  };

  const updateExpiration = async () => {
    const expiresAt = expirationDate ? new Date(expirationDate).toISOString() : null;
    await updateShare({ expiresAt });
  };

  const updateAllowDownload = async (allowDownload: boolean) => {
    await updateShare({ allowDownload });
  };

  const exportQrAsPng = () => {
    if (!shareData) return;
    const link = document.createElement('a');
    link.download = 'cv-qr-code.png';
    link.href = shareData.qrCodeUrl;
    link.click();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "The link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share CV</DialogTitle>
          <DialogDescription>
            Create a public link and QR code to share your CV. Others can view it without needing an account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!shareData ? (
            <div className="text-center py-8">
              <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Share your CV</h3>
              <p className="text-gray-600 mb-4">
                Generate a public link and QR code that others can use to view your CV.
              </p>
              <Button onClick={createShare} disabled={loading}>
                {loading ? "Creating..." : "Create Share Link"}
              </Button>
            </div>
          ) : (
            <>
              {/* Share URL */}
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input value={shareData.shareUrl} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(shareData.shareUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(shareData.shareUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div className="space-y-2">
                <Label>QR Code</Label>
                <div className="flex justify-center">
                  <img
                    src={shareData.qrCodeUrl}
                    alt="QR Code"
                    className="w-32 h-32 border rounded"
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportQrAsPng}
                  >
                    Download PNG
                  </Button>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code to view the CV
                </p>
              </div>

              {/* Share Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active Sharing</Label>
                    <p className="text-sm text-gray-600">Allow others to view this CV</p>
                  </div>
                  <Switch
                    checked={shareData.isActive}
                    onCheckedChange={(checked) => updateShare({ isActive: checked })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiration Date</Label>
                  <Input
                    id="expiration"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    onBlur={updateExpiration}
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-600">
                    Leave empty for no expiration
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow PDF Download</Label>
                    <p className="text-sm text-gray-600">Let viewers download the CV as PDF</p>
                  </div>
                  <Switch
                    checked={shareData.allowDownload}
                    onCheckedChange={updateAllowDownload}
                    disabled={loading}
                  />
                </div>

                <div className="text-sm text-gray-600">
                  <p>Views: {shareData.viewCount}</p>
                  <p>Downloads: {shareData.downloadCount}</p>
                  <p>Created: {new Date(shareData.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Attached CVs */}
              <div className="space-y-4">
                <Label>Attached CVs</Label>
                <p className="text-sm text-gray-600">
                  Attach additional CVs to this share link. Visitors can switch between them.
                </p>

                {shareData.attachedCvs.length > 0 && (
                  <div className="space-y-2">
                    {shareData.attachedCvs.map((attachedCvId) => {
                      const cv = userCvs.find(c => c.id === attachedCvId);
                      return (
                        <div key={attachedCvId} className="flex items-center justify-between p-2 border rounded">
                          <span>{cv?.title || `CV ${attachedCvId.slice(-8)}`}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => detachCv(attachedCvId)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex gap-2">
                  <Select value={selectedCv} onValueChange={setSelectedCv}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a CV to attach" />
                    </SelectTrigger>
                    <SelectContent>
                      {userCvs.map((cv) => (
                        <SelectItem key={cv.id} value={cv.id}>
                          {cv.title || `CV ${cv.id.slice(-8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={attachCv}
                    disabled={!selectedCv || loading}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                </div>
              </div>

              {/* Stop Sharing */}
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={deleteShare}
                  disabled={loading}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Stop Sharing
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
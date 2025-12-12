"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ZoomIn, ZoomOut, Move } from "lucide-react";
import Image from "next/image";

interface PhotoEditorProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cropData: { zoom: number; x: number; y: number }) => void;
  currentCrop?: { zoom: number; x: number; y: number };
}

export function PhotoEditor({ imageUrl, isOpen, onClose, onSave, currentCrop }: PhotoEditorProps) {
  // Initialize from currentCrop, converting percentages back to pixels for the editor
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(currentCrop?.zoom || 1);
  // If currentCrop has percentages, we need to convert them to pixels for the 384px container
  const [position, setPosition] = useState({ 
    x: currentCrop?.x ? (currentCrop.x * 384 / 100) : 0, 
    y: currentCrop?.y ? (currentCrop.y * 384 / 100) : 0 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    // Convert pixel positions to percentages relative to container
    const container = containerRef.current;
    if (container) {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Save as percentages
      const cropData = { 
        zoom, 
        x: (position.x / containerWidth) * 100,
        y: (position.y / containerHeight) * 100
      };
      console.log('PhotoEditor saving crop data:', cropData);
      onSave(cropData);
    } else {
      // Fallback to absolute values
      console.log('PhotoEditor saving crop data (fallback):', { zoom, x: position.x, y: position.y });
      onSave({ zoom, x: position.x, y: position.y });
    }
    onClose();
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adjust Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview Container */}
          <div
            ref={containerRef}
            className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.1s',
              }}
            >
              <div className="relative w-64 h-64">
                <Image
                  src={imageUrl}
                  alt="Profile"
                  fill
                  className="object-contain pointer-events-none select-none"
                  draggable={false}
                />
              </div>
            </div>
            
            {/* Drag hint */}
            {!isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  <span className="text-sm">Drag to reposition</span>
                </div>
              </div>
            )}
          </div>

          {/* Zoom Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <ZoomOut className="h-4 w-4" />
                Zoom
                <ZoomIn className="h-4 w-4" />
              </Label>
              <span className="text-sm text-gray-500">{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Position Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Position: X: {Math.round(position.x)}px, Y: {Math.round(position.y)}px</span>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

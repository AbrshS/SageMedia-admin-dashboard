import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function ImagePreviewDialog({ open, onClose, imageUrl }: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/80">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="relative w-full max-h-[80vh] flex items-center justify-center">
          <img
            src={`http://localhost:3000/${imageUrl?.replace(/\\/g, '/')}`}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  applicationName?: string;
}

export function RejectDialog({ open, onClose, onReject, applicationName }: RejectDialogProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReject(reason);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Reject Application
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="w-full sm:w-auto"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
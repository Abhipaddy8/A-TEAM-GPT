import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  calendarUrl?: string;
}

export default function CalendarPopup({ isOpen, onClose, calendarUrl = "https://link.flow-build.com/widget/booking/24mGEjljgZZ7yIkaXbaK" }: CalendarPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-brand-dark-navy">
              Book Your Scale Session
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={calendarUrl}
            className="w-full h-full border-0"
            title="Book Scale Session"
            allow="payment"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export default function BackButton({ onClick, label = "Back" }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}

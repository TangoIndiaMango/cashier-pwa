import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ModernLoadingScreenProps {
  message?: string;
}

export default function ModernLoadingScreen({
  message = "Loading...",
}: ModernLoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <Card className="w-[300px] shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

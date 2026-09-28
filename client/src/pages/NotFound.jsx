import { useNavigate } from "react-router-dom";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <CompassIcon size={28} className="text-muted-foreground" />
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button size="sm" onClick={() => navigate("/dashboard")}>
          Dashboard
        </Button>
      </div>
    </div>
  );
}

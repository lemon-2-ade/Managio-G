import { Component } from "react";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
          <ServerCrash size={28} className="text-muted-foreground" />
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The app hit an unexpected error. Your data hasn't been lost — reloading usually fixes this.
          </p>
          <Button size="sm" className="mt-2" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

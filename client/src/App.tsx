import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import EmbedChat from "@/pages/embed-chat";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { clarity } from "react-microsoft-clarity";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/embed" component={EmbedChat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    clarity.init("9izd804cl6");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

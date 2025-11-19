import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Users, Clock } from "lucide-react";
import DiagnosticChat from "@/components/diagnostic-chat";

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-xl">
              A
            </div>
            <div>
              <div className="font-semibold text-sm">A-Team Trades Pipeline™</div>
              <div className="text-xs text-muted-foreground">by Develop Coaching</div>
            </div>
          </div>
          <Badge variant="secondary" className="hidden md:flex">
            Free Diagnostic
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {!showChat ? (
          <>
            {/* Hero */}
            <section className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <Badge variant="outline" className="mb-4 border-brand-teal text-brand-teal">
                3-Minute Free Assessment
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Get Your Free Labour Pipeline Score
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-6">
                Discover the exact leaks costing you £20K–£90K per year in your trades business
              </p>
              <p className="text-base text-muted-foreground mb-8">
                Used by over 500 UK builders and contractors to fix their biggest labour problems
              </p>
              <Button
                size="lg"
                className="h-14 px-8 text-lg bg-brand-blue hover:bg-brand-blue/90"
                onClick={() => setShowChat(true)}
                data-testid="button-start-diagnostic"
              >
                Start Your Free Diagnostic
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Get your personalised PDF report instantly
              </p>
            </section>

            {/* Benefits */}
            <section className="grid md:grid-cols-3 gap-6 mb-12 md:mb-16">
              <Card className="p-6 hover-elevate">
                <Clock className="h-10 w-10 text-brand-blue mb-4" />
                <h3 className="font-semibold text-lg mb-2">3 Minutes</h3>
                <p className="text-muted-foreground text-sm">
                  Quick 7-question assessment to identify your biggest labour leaks
                </p>
              </Card>
              <Card className="p-6 hover-elevate">
                <TrendingUp className="h-10 w-10 text-brand-teal mb-4" />
                <h3 className="font-semibold text-lg mb-2">Instant Results</h3>
                <p className="text-muted-foreground text-sm">
                  Traffic-light scoring system shows exactly where you're losing money
                </p>
              </Card>
              <Card className="p-6 hover-elevate">
                <CheckCircle2 className="h-10 w-10 text-traffic-green mb-4" />
                <h3 className="font-semibold text-lg mb-2">Actionable Plan</h3>
                <p className="text-muted-foreground text-sm">
                  Top 5 fixes to plug your leaks and add £20K–£50K to your bottom line
                </p>
              </Card>
            </section>

            {/* Trust Indicators */}
            <section className="max-w-4xl mx-auto mb-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-brand-blue mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Builders Helped</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-brand-teal mb-2">£45K</div>
                  <div className="text-sm text-muted-foreground">Avg. Annual Savings</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-traffic-green mb-2">90 Days</div>
                  <div className="text-sm text-muted-foreground">To See Results</div>
                </div>
              </div>
            </section>

            {/* Social Proof */}
            <section className="max-w-4xl mx-auto mb-12">
              <Card className="p-6 md:p-8 bg-muted/30">
                <div className="flex items-start gap-4">
                  <Users className="h-8 w-8 text-brand-blue flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-base md:text-lg mb-3 italic">
                      "The A-Team diagnostic showed me I was losing £60K a year through poor
                      scheduling and unreliable subbies. Fixed it in 60 days."
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal font-semibold">
                        MC
                      </div>
                      <div>
                        <div className="font-semibold">Mark Cooper</div>
                        <div className="text-sm text-muted-foreground">
                          MD, Cooper Construction Ltd
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </>
        ) : (
          <DiagnosticChat onBack={() => setShowChat(false)} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              © 2025 Develop Coaching. Built for UK builders and contractors.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="https://developcoaching.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-develop-coaching"
              >
                Develop Coaching
              </a>
              <a
                href="https://developcoaching.co.uk/schedule-a-call"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-schedule-call"
              >
                Book a Call
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

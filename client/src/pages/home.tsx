import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Users, Clock, Sparkles, Zap, Target, BarChart3, Award, ArrowRight, Lightbulb, Briefcase, LineChart, Hammer, Shield, Wrench } from "lucide-react";
import DiagnosticChat from "@/components/diagnostic-chat";

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark-navy via-[#0D1F38] to-[#0A1A2F] relative overflow-hidden">
      {/* Animated Background Orbs - More Subtle and Professional */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Orb */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-vivid-blue/8 rounded-full blur-3xl"
             style={{ animation: "float 6s ease-in-out infinite" }}></div>

        {/* Bottom Left Orb */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-sky-blue/8 rounded-full blur-3xl"
             style={{ animation: "float 8s ease-in-out infinite reverse" }}></div>

        {/* Center Orb */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-brand-vivid-blue/5 rounded-full blur-3xl"
             style={{ animation: "float 10s ease-in-out infinite" }}></div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-b from-brand-dark-navy/95 to-brand-dark-navy/80 border-b border-brand-vivid-blue/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-vivid-blue to-brand-sky-blue flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-vivid-blue/40 group-hover:shadow-brand-vivid-blue/60 transition-all duration-300">
              A
            </div>
            <div>
              <div className="font-semibold text-sm text-white">A-Team Trades Pipeline™</div>
              <div className="text-xs text-brand-sky-blue/80">by Develop Coaching</div>
            </div>
          </div>
          <Badge className="hidden md:flex bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue text-white border-0 px-4 py-1.5 text-xs font-semibold hover:shadow-lg hover:shadow-brand-vivid-blue/30 transition-all duration-300 cursor-pointer">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Free 3-Min Assessment
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        {!showChat ? (
          <>
            {/* Hero Section */}
            <section className="text-center max-w-5xl mx-auto mb-24 pt-8">
              {/* Badge */}
              <div className="mb-8 inline-flex">
                <Badge className="bg-gradient-to-r from-brand-sky-blue/20 to-brand-vivid-blue/20 text-brand-sky-blue border border-brand-sky-blue/40 px-5 py-2 text-xs font-semibold backdrop-blur-sm hover:border-brand-sky-blue/70 transition-all duration-300"
                       style={{ animation: "pulse 2s ease-in-out infinite" }}>
                  <Clock className="h-3.5 w-3.5 mr-2" />
                  Only 3 Minutes • Zero Signup Required
                </Badge>
              </div>

              {/* Main Headline */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight tracking-tight">
                <span className="block mb-3 text-white" style={{ animation: "slideInUp 0.8s ease-out" }}>
                  Discover Where Your
                </span>
                <span className="block text-[#62B6FF]" style={{ animation: "slideInUp 0.8s ease-out 0.1s both" }}>
                  Labour Pipeline is Leaking
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto font-medium leading-relaxed"
                 style={{ animation: "fadeIn 0.8s ease-out 0.2s both" }}>
                Find the exact gaps costing you <span className="text-white font-bold text-2xl">£20K–£90K per year</span>
              </p>

              {/* Supporting Text */}
              <p className="text-base text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                 style={{ animation: "fadeIn 0.8s ease-out 0.3s both" }}>
                Join 500+ UK builders who've used our free diagnostic to identify their biggest labour problems and add tens of thousands to their bottom line.
              </p>

              {/* CTA Button */}
              <div style={{ animation: "fadeIn 0.8s ease-out 0.4s both" }}>
                <Button
                  size="lg"
                  className="h-16 px-12 text-lg font-bold bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue text-white border-0 rounded-lg shadow-2xl shadow-brand-vivid-blue/40 hover:shadow-brand-vivid-blue/60 transform hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
                  onClick={() => setShowChat(true)}
                  data-testid="button-start-diagnostic"
                >
                  <Zap className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Start Your Free Diagnostic
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </div>

              {/* Trust Badge */}
              <p className="text-sm text-gray-400 mt-8 flex items-center justify-center gap-2"
                 style={{ animation: "fadeIn 0.8s ease-out 0.5s both" }}>
                <CheckCircle2 className="h-4 w-4 text-green-400/80" />
                Instant beautiful report • No credit card needed • 100% confidential
              </p>
            </section>

            {/* Three Key Benefits Grid */}
            <section className="grid md:grid-cols-3 gap-6 mb-20">
              {[
                {
                  icon: Clock,
                  title: "Lightning Fast",
                  subtitle: "3 Minutes",
                  description: "Quick 7-question assessment identifies your biggest labour inefficiencies instantly",
                  color: "from-[#0D2A52] to-[#071636]",
                  borderColor: "border-[#1E4976]/40",
                  iconColor: "text-[#5BA3D0]",
                  delay: 0.1
                },
                {
                  icon: BarChart3,
                  title: "Clear Insights",
                  subtitle: "Instant Results",
                  description: "Traffic-light scoring system shows exactly where you're losing money and why",
                  color: "from-[#0D3D52] to-[#071636]",
                  borderColor: "border-[#1E6976]/40",
                  iconColor: "text-[#5BA3D0]",
                  delay: 0.2
                },
                {
                  icon: Target,
                  title: "Actionable Plan",
                  subtitle: "Real Solutions",
                  description: "Top 3 prioritized fixes to plug your leaks and add £20K–£50K to your profits",
                  color: "from-[#1A4D36] to-[#0D2318]",
                  borderColor: "border-[#2F7A5A]/40",
                  iconColor: "text-[#5AD07A]",
                  delay: 0.3
                }
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="group"
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ animation: `slideInUp 0.8s ease-out ${0.6 + benefit.delay}s both` }}
                >
                  <Card className={`h-full p-8 bg-gradient-to-br ${benefit.color} backdrop-blur-sm border ${benefit.borderColor} hover:border-white/30 transition-all duration-500 cursor-pointer overflow-hidden relative`}>
                    {/* Hover Background Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                         style={{
                           background: `radial-gradient(circle at center, ${benefit.iconColor}/10 0%, transparent 70%)`,
                           pointerEvents: 'none'
                         }}></div>

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="mb-6 inline-block p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-all duration-300 group-hover:scale-110">
                        <benefit.icon className={`h-8 w-8 ${benefit.iconColor} transition-transform duration-300 group-hover:rotate-6`} />
                      </div>

                      {/* Subtitle */}
                      <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold group-hover:text-gray-300 transition-colors duration-300">
                        {benefit.subtitle}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-2xl mb-3 text-white group-hover:text-brand-sky-blue transition-colors duration-300">
                        {benefit.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                        {benefit.description}
                      </p>

                      {/* Bottom accent line */}
                      <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue group-hover:w-full transition-all duration-500"></div>
                    </div>
                  </Card>
                </div>
              ))}
            </section>

            {/* Stats Section - Individual Cards */}
            <section className="max-w-6xl mx-auto mb-24 grid md:grid-cols-3 gap-6">
              {[
                {
                  number: "500+",
                  label: "UK Builders Helped",
                  icon: Hammer,
                  color: "text-[#5BA3D0]",
                  bgColor: "from-[#0D2A52] to-[#071636]"
                },
                {
                  number: "£45K",
                  label: "Average Annual Savings",
                  icon: Shield,
                  color: "text-[#5AD07A]",
                  bgColor: "from-[#1A4D36] to-[#0D2318]"
                },
                {
                  number: "90 Days",
                  label: "To See Results",
                  icon: Wrench,
                  color: "text-[#FFB84D]",
                  bgColor: "from-[#4D3A0D] to-[#261A07]"
                }
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{ animation: `slideInUp 0.8s ease-out ${1.2 + i * 0.1}s both` }}
                  className="group"
                >
                  <Card className={`h-full p-8 bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500 cursor-pointer overflow-hidden relative`}>
                    {/* Icon Container */}
                    <div className="mb-8 flex justify-center">
                      <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-all duration-300 group-hover:scale-110">
                        <stat.icon className={`h-12 w-12 ${stat.color} transition-transform duration-300 group-hover:rotate-12`} />
                      </div>
                    </div>

                    {/* Number */}
                    <div className={`text-6xl font-extrabold mb-4 text-center ${stat.color} group-hover:scale-110 transition-all duration-300`}>
                      {stat.number}
                    </div>

                    {/* Label */}
                    <div className="text-sm text-gray-300 uppercase tracking-wider font-medium text-center group-hover:text-white transition-colors duration-300">
                      {stat.label}
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-transparent to-white/30 group-hover:w-full transition-all duration-500"></div>
                  </Card>
                </div>
              ))}
            </section>

            {/* Testimonial Section */}
            <section className="max-w-4xl mx-auto mb-24" style={{ animation: "slideInUp 0.8s ease-out 1.6s both" }}>
              <Card className="p-10 md:p-14 bg-gradient-to-br from-[#0D2A52] to-[#071636] backdrop-blur-xl border border-[#1E4976]/40 shadow-2xl shadow-[#0D2A52]/20 relative overflow-hidden group hover:border-[#2E6F99]/70 hover:shadow-[#0D2A52]/40 transition-all duration-500">
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5BA3D0] to-transparent group-hover:via-[#62B6FF] transition-all duration-500"></div>

                {/* Testimonial Content */}
                <div className="flex flex-col md:flex-row items-start gap-8">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-[#5BA3D0] to-[#1E6FA6] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#5BA3D0]/40 group-hover:shadow-[#5BA3D0]/60 transition-all duration-300 group-hover:scale-110">
                      MC
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="flex-1">
                    {/* Stars */}
                    <div className="flex items-center gap-1.5 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Sparkles key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>

                    {/* Quote Text */}
                    <p className="text-lg md:text-xl mb-6 leading-relaxed text-gray-200 italic group-hover:text-white transition-colors duration-300">
                      "The A-Team diagnostic showed me I was losing <span className="text-[#5BA3D0] font-bold not-italic">£60K a year</span> through poor scheduling and unreliable subcontractors. We fixed it in 60 days. Absolute game-changer for my business."
                    </p>

                    {/* Author */}
                    <div>
                      <div className="font-bold text-white text-lg">Mark Cooper</div>
                      <div className="text-sm text-[#5BA3D0]/90 font-medium">Managing Director, Cooper Construction Ltd</div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Feature Highlights */}
            <section className="max-w-6xl mx-auto mb-24">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Lightbulb,
                    title: "Smart Algorithm",
                    description: "Our AI-powered scoring identifies your specific problem areas with surgical precision"
                  },
                  {
                    icon: Briefcase,
                    title: "Business Focused",
                    description: "Designed by business coaches who understand the trades industry inside and out"
                  },
                  {
                    icon: Target,
                    title: "Proven Results",
                    description: "See immediate £20K-£50K improvements with our top 3 prioritized fixes"
                  }
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="group"
                    style={{ animation: `slideInUp 0.8s ease-out ${1.8 + i * 0.1}s both` }}
                  >
                    <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-xl hover:border-brand-vivid-blue/30 transition-all duration-500 cursor-pointer">
                      <div className="mb-4 inline-block p-2.5 bg-brand-vivid-blue/10 rounded-lg group-hover:bg-brand-vivid-blue/20 transition-all duration-300 group-hover:scale-110">
                        <feature.icon className="h-6 w-6 text-brand-vivid-blue group-hover:text-brand-sky-blue transition-colors duration-300" />
                      </div>
                      <h4 className="font-bold text-lg text-white mb-2 group-hover:text-brand-sky-blue transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Final CTA Section */}
            <section className="text-center max-w-3xl mx-auto mb-20" style={{ animation: "slideInUp 0.8s ease-out 2.0s both" }}>
              <div className="p-12 md:p-16 rounded-2xl bg-gradient-to-br from-[#0D2A52] to-[#071636] backdrop-blur-xl border border-[#1E4976]/40 hover:border-[#2E6F99]/70 hover:shadow-2xl hover:shadow-[#0D2A52]/40 transition-all duration-500">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Ready to Fix Your Labour Pipeline?
                </h2>
                <p className="text-gray-300 mb-10 text-lg leading-relaxed">
                  Take the 3-minute diagnostic today and discover exactly where you're losing money—and how to fix it.
                </p>
                <Button
                  size="lg"
                  className="h-14 px-10 text-base font-bold bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue text-white border-0 rounded-lg shadow-xl shadow-brand-vivid-blue/40 hover:shadow-brand-vivid-blue/60 transform hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer"
                  onClick={() => setShowChat(true)}
                >
                  <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Start Free Diagnostic
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </div>
            </section>
          </>
        ) : (
          <DiagnosticChat onBack={() => setShowChat(false)} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-brand-dark-navy/30 backdrop-blur-sm mt-32">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-sm text-gray-400 text-center md:text-left">
              © 2025 Develop Coaching. Helping UK trades businesses scale with confidence.
            </div>
            <div className="flex items-center gap-8 text-sm">
              <a
                href="https://developcoaching.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-sky-blue transition-all duration-300 hover:underline"
                data-testid="link-develop-coaching"
              >
                Develop Coaching
              </a>
              <a
                href="https://developcoaching.co.uk/schedule-a-call"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-sky-blue transition-all duration-300 hover:underline"
                data-testid="link-schedule-call"
              >
                Book a Call
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-40px) translateX(0px);
          }
          75% {
            transform: translateY(-20px) translateX(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 92, 255, 0.3);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 92, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

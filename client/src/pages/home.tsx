import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import DiagnosticChat from "@/components/diagnostic-chat";

export default function Home() {

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Orbs - Subtle on white background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Orb */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-vivid-blue/5 rounded-full blur-3xl"
             style={{ animation: "float 6s ease-in-out infinite" }}></div>

        {/* Bottom Left Orb */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-sky-blue/5 rounded-full blur-3xl"
             style={{ animation: "float 8s ease-in-out infinite reverse" }}></div>

        {/* Center Orb */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-brand-vivid-blue/3 rounded-full blur-3xl"
             style={{ animation: "float 10s ease-in-out infinite" }}></div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-brand-vivid-blue/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-vivid-blue to-brand-sky-blue flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-vivid-blue/40 group-hover:shadow-brand-vivid-blue/60 transition-all duration-300">
              A
            </div>
            <div>
              <div className="font-semibold text-sm text-brand-dark-navy">A-Team Trades Pipeline™</div>
              <div className="text-xs text-brand-vivid-blue">by Develop Coaching</div>
            </div>
          </div>
          <Badge className="hidden md:flex bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue text-white border-0 px-4 py-1.5 text-xs font-semibold hover:shadow-lg hover:shadow-brand-vivid-blue/30 transition-all duration-300 cursor-pointer">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Free 3-Min Assessment
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Hero Section - Headline & Subheadline Only */}
        <section className="text-center max-w-4xl mx-auto mb-8">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
            <span className="block mb-2 text-brand-dark-navy">
              Discover Where Your
            </span>
            <span className="block text-brand-vivid-blue">
              Labour Pipeline is Leaking
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Find the exact gaps costing you <span className="text-brand-dark-navy font-bold">£20K–£90K per year</span>
          </p>
        </section>

        {/* Video Placeholder Section */}
        <section className="max-w-5xl mx-auto mb-12">
          <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl border-2 border-gray-300 flex items-center justify-center shadow-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-vivid-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold text-lg">Watch Our Introduction</p>
              <p className="text-gray-500 text-sm mt-2">See how builders are fixing their labour pipeline</p>
            </div>
          </div>
        </section>

        {/* Embedded Chat - Always Visible */}
        <div className="max-w-5xl mx-auto mb-16">
          <DiagnosticChat embedded={true} />
        </div>
      </main>

      {/* Testimonials Section Below Chat */}
      <section className="relative z-10 bg-gray-50 py-16 mt-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-navy mb-4">What Builders Are Saying</h2>
            <p className="text-gray-600 text-lg">Join 500+ UK builders who've transformed their labour pipeline</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Mark Cooper",
                title: "Managing Director, Cooper Construction Ltd",
                text: "The A-Team diagnostic showed me I was losing £60K a year through poor scheduling and unreliable subcontractors. We fixed it in 60 days. Absolute game-changer for my business.",
                rating: 5
              },
              {
                name: "Sarah Mitchell",
                title: "Owner, Mitchell & Sons Building",
                text: "Couldn't believe how quickly we identified our labour pipeline problems. The recommendations were spot-on and easy to implement. Already seeing results after 30 days.",
                rating: 5
              },
              {
                name: "James Patterson",
                title: "Director, Patterson Homes",
                text: "Fantastic diagnostic tool. Really thorough and the insights into our culture and systems were eye-opening. Worth every penny of the free assessment!",
                rating: 5
              }
            ].map((testimonial, i) => (
              <Card key={i} className="p-8 bg-white border-2 border-gray-200 hover:shadow-lg transition-all duration-300">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-amber-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-800 mb-6 italic leading-relaxed">"{testimonial.text}"</p>

                {/* Author */}
                <div className="border-t-2 border-gray-100 pt-4">
                  <p className="font-bold text-brand-dark-navy">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-gray-200 bg-white mt-32">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-sm text-gray-600 text-center md:text-left">
              © 2025 Develop Coaching. Helping UK trades businesses scale with confidence.
            </div>
            <div className="flex items-center gap-8 text-sm">
              <a
                href="https://developcoaching.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-brand-vivid-blue transition-all duration-300 hover:underline font-medium"
                data-testid="link-develop-coaching"
              >
                Develop Coaching
              </a>
              <a
                href="https://developcoaching.co.uk/schedule-a-call"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-brand-vivid-blue transition-all duration-300 hover:underline font-medium"
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

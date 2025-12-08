import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import DiagnosticChat from "@/components/diagnostic-chat";
import CalendarPopup from "@/components/calendar-popup";
import { useState, useRef, useEffect } from "react";
import videoThumbnail from "@assets/Gemini_Generated_Image_yiac8xyiac8xyiac_1764129756943.png";
import introVideo from "@assets/Video landing page_1764129756948.mp4";

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Capture UTM parameters on page load
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const params: any = {};

    // Check for existing stored UTMs
    const storedUtm = sessionStorage.getItem('utm_params');
    if (storedUtm) {
      try {
        Object.assign(params, JSON.parse(storedUtm));
      } catch (e) {
        console.error('[UTM] Failed to parse stored params:', e);
      }
    }

    // Extract from URL (takes priority)
    if (searchParams.has('utm_source')) params.utmSource = searchParams.get('utm_source');
    if (searchParams.has('utm_medium')) params.utmMedium = searchParams.get('utm_medium');
    if (searchParams.has('utm_campaign')) params.utmCampaign = searchParams.get('utm_campaign');

    // Store if we have params
    if (Object.keys(params).length > 0) {
      sessionStorage.setItem('utm_params', JSON.stringify(params));
      console.log('[UTM] Captured on home page:', params);

      // Clean URL (remove UTM params for cleaner appearance)
      if (searchParams.has('utm_source') || searchParams.has('utm_medium') || searchParams.has('utm_campaign')) {
        searchParams.delete('utm_source');
        searchParams.delete('utm_medium');
        searchParams.delete('utm_campaign');
        const newUrl = window.location.pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
        window.history.replaceState({}, '', newUrl);
        console.log('[UTM] Cleaned URL');
      }
    }
  }, []);

  // Handle scroll ONLY when opening the calendar (not on every interaction)
  const handleBookingClick = () => {
    if (!showCalendar) {
      // Opening - set to open and scroll
      setShowCalendar(true);

      // Scroll after the component renders (small delay for animation)
      setTimeout(() => {
        calendarRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 150);
    }
  };

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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight tracking-tight text-brand-dark-navy">
            Why The Top 1% Of Trades Are Ignoring Your Business (And How To Fix It)
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
            The "labour shortage" isn't the whole story. Use our <span className="text-brand-vivid-blue font-bold">A-Team Diagnostic</span> to pinpoint the leaks in your hiring process so you can stop chasing workers and start attracting them.
          </p>
        </section>

        {/* Video Section */}
        <section className="max-w-3xl mx-auto mb-6">
          <div className="aspect-video rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg relative group cursor-pointer" onClick={() => {
            const video = document.getElementById('intro-video') as HTMLVideoElement;
            const thumbnail = document.getElementById('video-thumbnail') as HTMLElement;
            if (video && thumbnail) {
              thumbnail.style.display = 'none';
              video.style.display = 'block';
              video.play();
            }
          }}>
            <img 
              id="video-thumbnail"
              src={videoThumbnail} 
              alt="Stop Panic Hiring - Video Thumbnail"
              className="w-full h-full object-cover"
            />
            <video 
              id="intro-video"
              className="w-full h-full object-cover hidden"
              controls
              preload="metadata"
              src={introVideo}
            />
          </div>
        </section>

        {/* Text Under Video */}
        <section className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-dark-navy mb-3">
            Find Out Exactly Why You Can't Find And Attract Good Trades
          </h2>
          <p className="text-lg text-gray-600">
            Interact with the AI below to identify your hiring bottlenecks in under 2 minutes.
          </p>
        </section>

        {/* Embedded Chat - Always Visible */}
        <div className="max-w-5xl mx-auto mb-8">
          <DiagnosticChat embedded={true} onBookingClick={handleBookingClick} />
        </div>

        {/* Inline Calendar Section - Only render when open */}
        {showCalendar && (
          <div ref={calendarRef} className="max-w-5xl mx-auto">
            <CalendarPopup isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
          </div>
        )}
      </main>

      {/* Calendar Booking Section - Right after Chat */}
      <section className="relative z-10 py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-navy mb-3">Book Your Free Scale Session</h2>
            <p className="text-gray-600 text-lg">Discover how to fix your labour pipeline and scale your business</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg">
            <iframe
              src="https://link.flow-build.com/widget/booking/zXUkPVoGKzRyirwYa0Ck"
              className="w-full h-[700px] border-0"
              title="Book a Strategy Session"
              data-testid="calendar-embed"
            />
          </div>
        </div>
      </section>

      {/* Google Reviews Section - After Calendar */}
      <section className="relative z-10 bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-xl font-semibold text-gray-700">Google Reviews</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark-navy mb-2">What Builders Are Saying</h2>
          </div>

          {/* Horizontal Scrollable Reviews */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-6" style={{ minWidth: "max-content" }}>
              {[
                { name: "Tim Day", info: "3 reviews", initial: "T", color: "bg-orange-500", text: "If you follow the Mastermind programme you can't go wrong. If you want to get off the tools and take your business to 'the next level' act now. Highly recommended." },
                { name: "Andrews Group Ltd", info: "9 reviews", initial: "A", color: "bg-teal-500", text: "We've been working with Greg and his team for about 10 weeks now. The changes we've made are unbelievable...we have had a complete shift in mindset, new branding, all new systems in place. Today we've attended the build and scale summit and it's definitely delivered. We've networked with so many inspiring people and left with a huge list of action points that we know we can achieve." },
                { name: "Alexandra Powell", info: "Local Guide · 20 reviews", initial: "A", color: "bg-purple-500", text: "We've recently started working with Greg Wilkes and his team, and their support has already been fantastic. Greg is approachable, attentive, and has provided valuable insights that align perfectly with our construction business goals. His DEVELOP framework is helping us streamline our processes, build clarity, and focus as we refine our operations. We're excited to continue working together and see how their guidance will shape our growth moving forward." },
                { name: "Sean Ryan", info: "5 reviews", initial: "S", color: "bg-green-600", text: "Highly recommended been on mastermind for a few years now and I can see the improvement in my company already." },
                { name: "Nick Cahill", info: "3 reviews", initial: "N", color: "bg-blue-500", text: "First timer! Loved it. Felt inspired and I leave feeling positive and am very excited about the future. Thanks to Greg, Will Polsten and the other speakers." },
                { name: "Mike Calvert", info: "3 reviews", initial: "M", color: "bg-red-500", text: "Really good day, lots of information and value to take away. Guest speakers were amazing. Good to be around the community" },
                { name: "Krzysztof Poplawski", info: "4 reviews", initial: "K", color: "bg-amber-600", text: "Amazing event, great and inspiring speakers! Worth to joint for anyone who wants to grow their business!" },
                { name: "Paul Murphy", info: "1 review", initial: "P", color: "bg-pink-500", text: "today's work shop was massively inspiring and i can't wait to get started on implementing what we have learnt into our business and optimistic about where it could take us!" },
                { name: "Jordan Stubley", info: "4 reviews", initial: "J", color: "bg-indigo-500", text: "Really great to be working with Greg the live event has been really insightful" }
              ].map((review, i) => (
                <Card key={i} className="w-[340px] flex-shrink-0 p-5 bg-white border border-gray-200 hover:shadow-lg transition-all duration-300" data-testid={`review-card-${i}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}>
                      {review.initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-blue-600 text-sm">{review.name}</p>
                      <p className="text-xs text-gray-500">{review.info}</p>
                    </div>
                    <Badge className="ml-auto bg-blue-100 text-blue-700 text-xs border-0 flex-shrink-0">NEW</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, j) => (
                        <svg key={j} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">a few days ago</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">{review.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-gray-200 bg-white">
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

    </div>
  );
}

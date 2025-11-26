import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Send, Loader2, Sparkles, Zap, Target, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ScoreWidget from "./score-widget";

interface Message {
  role: "assistant" | "user";
  content: string;
  widget?: "score-display" | "email-form" | "phone-form" | "calendar" | "skip-options";
  data?: any;
}

interface DiagnosticState {
  isActive: boolean;
  questionsAsked: number;
  collectedData: Record<string, any>;
}

interface DiagnosticChatProps {
  onBack?: () => void;
  embedded?: boolean;
  onBookingClick?: () => void;
}

const GOOGLE_REVIEWS = [
  {
    name: "Tim Day",
    reviewCount: "3 reviews",
    rating: 5,
    daysAgo: "2 days ago",
    text: "If you follow the Mastermind programme you can't go wrong. If you want to get off the tools and take your business to 'the next level' act now. Highly recommended.",
    initial: "T",
    color: "bg-red-500",
  },
  {
    name: "Andrews Group Ltd",
    reviewCount: "9 reviews",
    rating: 5,
    daysAgo: "3 days ago",
    text: "We've been working with Greg and his team for about 10 weeks now. The changes we've made are unbelievable...we have had a complete shift in mindset, new branding, all new systems in place. Today we've attended the build and scale summit and it's definitely delivered. We've networked with so many inspiring people and left with a huge list of action points that we know we can achieve.",
    initial: "A",
    color: "bg-green-500",
  },
  {
    name: "Alexandra Powell",
    reviewCount: "20 reviews",
    rating: 5,
    daysAgo: "3 days ago",
    text: "We've recently started working with Greg Wilkes and his team, and their support has already been fantastic. Greg is approachable, attentive, and has provided valuable insights that align perfectly with our construction business goals. His DEVELOP framework is helping us streamline our processes, build clarity, and focus as we refine our operations. We're excited to continue working together and see how their guidance will shape our growth moving forward.",
    initial: "A",
    color: "bg-purple-500",
  },
  {
    name: "Sean Ryan",
    reviewCount: "5 reviews",
    rating: 5,
    daysAgo: "3 days ago",
    text: "Highly recommended been on mastermind for a few years now and I can see the improvement in my company already.",
    initial: "S",
    color: "bg-teal-500",
  },
  {
    name: "Nick Cahill",
    reviewCount: "3 reviews",
    rating: 5,
    daysAgo: "4 days ago",
    text: "First timer! Loved it. Felt inspired and I leave feeling positive and am very excited about the future. Thanks to Greg, Will Polsten and the other speakers.",
    initial: "N",
    color: "bg-blue-500",
  },
  {
    name: "Mike Calvert",
    reviewCount: "3 reviews",
    rating: 5,
    daysAgo: "4 days ago",
    text: "Really good day, lots of information and value to take away. Guest speakers were amazing. Good to be around the community",
    initial: "M",
    color: "bg-indigo-500",
  },
  {
    name: "Krzysztof Poplawski",
    reviewCount: "4 reviews",
    rating: 5,
    daysAgo: "4 days ago",
    text: "Amazing event, great and inspiring speakers! Worth to joint for anyone who wants to grow their business!",
    initial: "K",
    color: "bg-orange-500",
  },
  {
    name: "Paul Murphy",
    reviewCount: "1 review",
    rating: 5,
    daysAgo: "4 days ago",
    text: "today's work shop was massively inspiring and i can't wait to get started on implementing what we have learnt into our business and optimistic about where it could take us!",
    initial: "P",
    color: "bg-pink-500",
  },
  {
    name: "Jordan Stubley",
    reviewCount: "4 reviews",
    rating: 5,
    daysAgo: "4 days ago",
    text: "Really great to be working with Greg the live event has been really insightful",
    initial: "J",
    color: "bg-cyan-500",
  },
];

function ReviewCard({ review }: { review: typeof GOOGLE_REVIEWS[0] }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 min-w-[320px] max-w-[320px] flex-shrink-0">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-lg`}>
          {review.initial}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">{review.name}</h4>
          <p className="text-xs text-gray-500">{review.reviewCount}</p>
        </div>
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">NEW</Badge>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex">
          {[...Array(review.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <span className="text-xs text-gray-500">{review.daysAgo}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{review.text}</p>
    </div>
  );
}

function ReviewsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      return () => ref.removeEventListener("scroll", checkScroll);
    }
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">What Our Clients Say</h3>
          <p className="text-sm text-gray-500">Real Google reviews from UK builders</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {GOOGLE_REVIEWS.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
      </div>
    </div>
  );
}

function CalendarEmbed() {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue text-white">
        <h3 className="text-lg font-bold">Book Your Free Scale Session</h3>
        <p className="text-sm opacity-90">Choose a time that works for you</p>
      </div>
      <div className="h-[500px]">
        <iframe
          src="https://link.flow-build.com/widget/bookings/thefreedomroadmap"
          className="w-full h-full border-0"
          title="Book a Scale Session"
        />
      </div>
    </div>
  );
}

export default function DiagnosticChat({ onBack, embedded = false, onBookingClick }: DiagnosticChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey there! I'm Greg from Develop Coaching.\n\nI help UK builders fix their labour pipeline - you know, the headaches with unreliable subbies, recruitment struggles, and the constant firefighting that's probably costing you £20K-£90K a year.\n\nLet's run a quick 3-minute diagnostic to identify exactly where your gaps are. Just type 'start' or tell me a bit about your business to begin!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticState, setDiagnosticState] = useState<DiagnosticState>({
    isActive: false,
    questionsAsked: 0,
    collectedData: {},
  });
  const [diagnosticComplete, setDiagnosticComplete] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [storedEmail, setStoredEmail] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [utmParams, setUtmParams] = useState<{
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Use a ref to track accumulated diagnostic data across async updates
  // This solves the closure stale state problem in mutation callbacks
  const accumulatedDataRef = useRef<Record<string, any>>({});

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    });
  };

  useEffect(() => {
    const isJustGreeting = embedded && messages.length === 1;
    if (!isJustGreeting) {
      scrollToBottom();
    }
  }, [messages, embedded]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const params: any = {};
    
    const storedUtm = sessionStorage.getItem('utm_params');
    if (storedUtm) {
      try {
        const parsed = JSON.parse(storedUtm);
        Object.assign(params, parsed);
      } catch (e) {
        console.error('[UTM] Failed to parse stored params:', e);
      }
    }
    
    if (searchParams.has('utm_source')) params.utmSource = searchParams.get('utm_source');
    if (searchParams.has('utm_medium')) params.utmMedium = searchParams.get('utm_medium');
    if (searchParams.has('utm_campaign')) params.utmCampaign = searchParams.get('utm_campaign');
    
    if (Object.keys(params).length > 0) {
      sessionStorage.setItem('utm_params', JSON.stringify(params));
      setUtmParams(params);
    }
  }, []);

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; conversationHistory: any[]; diagnosticState: DiagnosticState }) => {
      const res = await apiRequest("POST", "/api/chat", data);
      return res.json();
    },
    onSuccess: (response: any) => {
      const aiMessage = response.message;

      // Merge new collected data into the ref (survives across closures)
      if (response.diagnosticUpdate?.collectedData) {
        accumulatedDataRef.current = {
          ...accumulatedDataRef.current,
          ...response.diagnosticUpdate.collectedData,
        };
        console.log('[Chat] ✅ Merged collected data:', JSON.stringify(response.diagnosticUpdate.collectedData));
      }

      console.log('[Chat] Response received:', {
        isComplete: response.isComplete,
        questionsAsked: response.diagnosticUpdate?.questionsAsked,
        newCollectedData: response.diagnosticUpdate?.collectedData,
        totalAccumulatedData: accumulatedDataRef.current,
        hasAnyScores: Object.values(accumulatedDataRef.current).some((v: any) => v?.score !== undefined)
      });
      
      if (response.diagnosticUpdate) {
        setDiagnosticState(prev => ({
          ...prev,
          questionsAsked: response.diagnosticUpdate.questionsAsked || prev.questionsAsked + 1,
          collectedData: { ...accumulatedDataRef.current },
        }));
      }

      if (response.isComplete) {
        setDiagnosticComplete(true);
        // Use the ref which has ALL accumulated data from all responses
        console.log('[Diagnostic Complete] Final collected data:', JSON.stringify(accumulatedDataRef.current));
        const scores = calculateScoresFromData(accumulatedDataRef.current);
        setDiagnosticData(scores);
        
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: aiMessage },
          {
            role: "assistant",
            content: "Want deeper insights? Click below to get your detailed email report with personalised recommendations.",
            widget: "score-display",
            data: scores,
          },
          {
            role: "assistant",
            content: "",
            widget: "email-form",
          },
        ]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: aiMessage }]);
      }
      
      setIsLoading(false);
    },
    onError: (error: any) => {
      console.error("[Chat] Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
      setIsLoading(false);
    },
  });

  const submitEmailMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      firstName: string;
      lastName: string;
      diagnosticData: any;
    }) => {
      const res = await apiRequest("POST", "/api/submit-email", {
        ...data,
        sessionId,
        ...utmParams,
      });
      return res.json();
    },
    onSuccess: () => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Brilliant! Your personalised report is on its way to your inbox.\n\nWant to go deeper? I can text you access to our exclusive 'Attract The Best' training - it's the exact framework our clients use to build reliable teams.\n\nDrop your mobile number below, or skip to book your free Scale Session.",
          widget: "phone-form",
        },
      ]);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to send report. Please try again.",
      });
    },
  });

  const submitPhoneMutation = useMutation({
    mutationFn: async (data: { phone: string; email: string }) => {
      const storedUtm = sessionStorage.getItem('utm_params');
      let utmData = {};
      if (storedUtm) {
        try {
          utmData = JSON.parse(storedUtm);
        } catch (e) {
          console.error('[UTM] Failed to parse stored params:', e);
        }
      }
      
      const res = await apiRequest("POST", "/api/submit-phone", {
        ...data,
        sessionId,
        ...utmData,
      });
      return res.json();
    },
    onSuccess: () => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Done! Check your phone - the training link is on its way.\n\nNow, if you're serious about fixing your labour pipeline, let's get you booked in for a free Scale Session. I'll personally walk you through how to implement the fixes in your report.\n\nPick a time below that works for you:",
          widget: "calendar",
        },
        {
          role: "assistant",
          content: "After you've booked, feel free to keep chatting - I'm here to help with any questions about your business, recruitment, or managing your team!",
        },
      ]);
      setShowCalendar(true);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send SMS. Please try again.",
      });
    },
  });

  const calculateScoresFromData = (data: Record<string, any>) => {
    const defaultScore = 5;

    // Map AI-collected data keys to our display categories
    // AI collects: turnover, projects, reliability, recruitment, systems, timeSpent, culture
    // We display: tradingCapacity, reliability, recruitment, systems, profitability, onboarding, culture

    // Helper to extract score value - handles arrays, objects with score, or direct numbers
    const extractScoreValue = (scoreData: any): number => {
      if (scoreData === undefined || scoreData === null) return defaultScore;
      if (typeof scoreData === 'number') {
        const num = parseInt(scoreData, 10);
        return isNaN(num) ? defaultScore : num;
      }
      if (Array.isArray(scoreData)) {
        // AI sometimes returns score as [7] or similar
        const firstNum = scoreData.find((v: any) => typeof v === 'number');
        return firstNum !== undefined ? parseInt(firstNum, 10) : defaultScore;
      }
      // Try to parse as number if it's a string
      const parsed = parseInt(scoreData, 10);
      return isNaN(parsed) ? defaultScore : parsed;
    };

    const getScore = (keys: string[]) => {
      for (const key of keys) {
        const dataPoint = data[key];
        // Check if this data point has a score
        if (dataPoint && dataPoint.score !== undefined && dataPoint.score !== null) {
          const extracted = extractScoreValue(dataPoint.score);
          console.log(`[Scores] Found score for key "${key}":`, extracted);
          return extracted;
        }
      }
      // Only return defaultScore if no keys matched - DON'T use this as final fallback
      console.log(`[Scores] No score found for keys:`, keys, "- returning default");
      return defaultScore;
    };

    const scores = {
      tradingCapacity: getScore(['turnover', 'projects', 'tradingCapacity']),
      reliability: getScore(['reliability']),
      recruitment: getScore(['recruitment']),
      systems: getScore(['systems']),
      profitability: getScore(['timeSpent', 'profitability']),
      onboarding: getScore(['projects', 'onboarding']),
      culture: getScore(['culture']),
    };

    // Debug logging - VERY important to see what's happening
    console.log('[Scores] Raw input data:', JSON.stringify(data, null, 2));
    console.log('[Scores] Calculated scores:', JSON.stringify(scores));

    const values = Object.values(scores);
    const average = values.reduce((sum, s) => sum + s, 0) / values.length;
    const overallScore = Math.round(average * 10);

    const getColor = (score: number) => {
      if (score >= 7) return "green";
      if (score >= 4) return "amber";
      return "red";
    };

    // Generate dynamic recommendations based on lowest scores
    const scoreEntries = Object.entries(scores).sort((a, b) => a[1] - b[1]);
    const lowestAreas = scoreEntries.slice(0, 3);
    
    const recommendationTemplates: Record<string, { title: string; explanation: string; impact: string }> = {
      tradingCapacity: { title: "Optimise project capacity", explanation: "Balance workload to match your team's capacity", impact: "Reduce stress, increase profitability" },
      reliability: { title: "Build a reliable subbie network", explanation: "Create a vetted pool of 3-5 go-to subbies for each trade", impact: "Reduce no-shows by 50%" },
      recruitment: { title: "Fix your recruitment pipeline", explanation: "Create a consistent system to attract skilled trades", impact: "Stop chasing workers, attract talent" },
      systems: { title: "Implement simple scheduling", explanation: "Use a shared calendar or app to coordinate teams", impact: "Save 5+ hours per week" },
      profitability: { title: "Reduce time on labour issues", explanation: "Document processes and empower your team to solve problems", impact: "Free up 10+ hours weekly" },
      onboarding: { title: "Create an onboarding checklist", explanation: "Standard process for new team members", impact: "Faster ramp-up, better retention" },
      culture: { title: "Improve team culture", explanation: "Regular check-ins and recognition for good work", impact: "Lower turnover, higher morale" },
    };
    
    const topRecommendations = lowestAreas.map(([area]) => 
      recommendationTemplates[area] || recommendationTemplates.reliability
    );

    return {
      overallScore,
      scoreColor: getColor(overallScore / 10),
      sectionScores: {
        tradingCapacity: { score: scores.tradingCapacity, color: getColor(scores.tradingCapacity), commentary: data.turnover?.answer || data.projects?.answer || "Based on your project volume" },
        reliability: { score: scores.reliability, color: getColor(scores.reliability), commentary: data.reliability?.answer || "Subbie punctuality and completion" },
        recruitment: { score: scores.recruitment, color: getColor(scores.recruitment), commentary: data.recruitment?.answer || "Ability to find skilled labour" },
        systems: { score: scores.systems, color: getColor(scores.systems), commentary: data.systems?.answer || "Scheduling and management tools" },
        profitability: { score: scores.profitability, color: getColor(scores.profitability), commentary: data.timeSpent?.answer || "Time spent on labour issues" },
        onboarding: { score: scores.onboarding, color: getColor(scores.onboarding), commentary: "Training and integration process" },
        culture: { score: scores.culture, color: getColor(scores.culture), commentary: data.culture?.answer || "Team morale and retention" },
      },
      topRecommendations,
      labourLeakProjection: {
        annualLeak: overallScore < 50 ? "£60,000-£90,000" : overallScore < 70 ? "£30,000-£50,000" : "£15,000-£25,000",
        improvementRange: "£15,000-£35,000",
        timeHorizon: "12 months",
      },
      riskProfile: {
        color: getColor(overallScore / 10),
        explanation: overallScore < 50 
          ? "High risk - significant labour issues impacting profitability"
          : overallScore < 70 
            ? "Moderate risk - room for improvement in key areas"
            : "Lower risk - solid foundation with some optimisation opportunities",
      },
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const lowerMessage = userMessage.toLowerCase().trim();
    const starterPhrases = ["ok", "okay", "yes", "yep", "yeah", "sure", "go", "start", "let's go", "let's do it", "ready", "begin", "run it", "do it"];
    const wantsDiagnostic = starterPhrases.some(phrase => lowerMessage === phrase || lowerMessage.startsWith(phrase + " ")) ||
                           lowerMessage.includes("diagnostic") || 
                           lowerMessage.includes("score") || 
                           lowerMessage.includes("assessment") ||
                           lowerMessage.includes("check") ||
                           lowerMessage.includes("test my") ||
                           lowerMessage.includes("gaps");

    if (!diagnosticState.isActive && wantsDiagnostic) {
      setDiagnosticState(prev => ({ ...prev, isActive: true }));
    }

    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Use the ref for accurate accumulated data, combined with current state for other fields
    const currentDiagnosticState = {
      isActive: diagnosticState.isActive || wantsDiagnostic,
      questionsAsked: diagnosticState.questionsAsked,
      collectedData: { ...accumulatedDataRef.current },
    };

    chatMutation.mutate({
      message: userMessage,
      conversationHistory,
      diagnosticState: currentDiagnosticState,
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!email || !firstName || !lastName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields.",
      });
      return;
    }

    setStoredEmail(email.toLowerCase());
    setMessages(prev => [...prev, { role: "user", content: `${firstName} ${lastName} - ${email}` }]);

    const scores = diagnosticData || calculateScoresFromData(diagnosticState.collectedData);
    submitEmailMutation.mutate({
      email: email.toLowerCase(),
      firstName,
      lastName,
      diagnosticData: {
        ...scores,
        email: email.toLowerCase(),
        builderName: `${firstName} ${lastName}`,
      },
    });
  };

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const countryCode = formData.get("countryCode") as string;
    const phoneNumber = (formData.get("phone") as string).replace(/\s/g, "");

    if (!phoneNumber || phoneNumber.length < 9) {
      toast({
        variant: "destructive",
        title: "Invalid Phone",
        description: "Please enter a valid phone number.",
      });
      return;
    }

    const normalizedPhone = `+${countryCode}${phoneNumber.replace(/^0/, "")}`;
    setMessages(prev => [...prev, { role: "user", content: normalizedPhone }]);

    submitPhoneMutation.mutate({
      phone: normalizedPhone,
      email: storedEmail,
    });
  };

  const handleSkipPhone = () => {
    setMessages(prev => [
      ...prev,
      { role: "user", content: "Skip for now" },
      {
        role: "assistant",
        content: "No problem! Your report is on its way.\n\nWhat would you like to do next?",
        widget: "skip-options",
      },
    ]);
  };

  const handleBookScaleSession = () => {
    setMessages(prev => [
      ...prev,
      { role: "user", content: "Book Scale Session" },
      {
        role: "assistant",
        content: "Great choice! Pick a time below that works for you. I'll personally walk you through how to implement the fixes in your report.",
        widget: "calendar",
      },
      {
        role: "assistant",
        content: "After you've booked, feel free to keep chatting - what else can I help you with?",
      },
    ]);
    setShowCalendar(true);
  };

  const handleContinueChatting = () => {
    setMessages(prev => [
      ...prev,
      { role: "user", content: "Continue Chatting" },
      {
        role: "assistant",
        content: "Happy to keep chatting! What else can I help you with? Whether it's questions about your report, recruitment strategies, managing subbies, or anything else about growing your trades business - fire away!",
      },
    ]);
  };

  const progress = diagnosticState.isActive ? (diagnosticState.questionsAsked / 7) * 100 : 0;

  return (
    <div className={`w-full max-w-4xl mx-auto ${embedded ? '' : 'p-4'}`}>
      {embedded && diagnosticState.isActive && diagnosticState.questionsAsked > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 font-medium">Diagnostic Progress</span>
            <Badge className="bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue text-white px-3 py-1 text-xs font-semibold">
              {diagnosticState.questionsAsked}/7
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <Card className={`p-6 min-h-[500px] flex flex-col shadow-2xl ${embedded ? 'border-brand-vivid-blue/30 bg-white/95 backdrop-blur-sm' : 'border-brand-vivid-blue/20 bg-gradient-to-b from-white to-gray-50'}`}>
        <div className="flex-1 overflow-y-auto mb-4 space-y-6" data-testid="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-5 shadow-lg ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-brand-vivid-blue to-brand-sky-blue text-white"
                    : "bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-brand-vivid-blue/20"
                }`}
                data-testid={`message-${message.role}-${index}`}
              >
                {message.role === "assistant" && !message.widget && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-vivid-blue to-brand-sky-blue flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-charcoal">Greg</span>
                  </div>
                )}
                
                {!message.widget && (
                  <p className={`text-base leading-relaxed whitespace-pre-line ${message.role === "user" ? "text-white" : "text-gray-800"}`}>
                    {message.content}
                  </p>
                )}

                {message.widget === "score-display" && message.data && (
                  <div className="mt-4">
                    <ScoreWidget data={message.data} />
                  </div>
                )}

                {message.widget === "email-form" && (
                  <form onSubmit={handleEmailSubmit} className="space-y-4 bg-white p-6 rounded-xl border-2 border-brand-vivid-blue/10">
                    <div className="text-center mb-4">
                      <p className="text-brand-dark-navy font-bold text-lg">Want Deeper Insights?</p>
                      <p className="text-gray-600 text-sm">Click to get your detailed email report</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-brand-charcoal font-semibold text-sm">First Name</Label>
                        <Input id="firstName" name="firstName" type="text" required placeholder="John" className="mt-2 border-2" data-testid="input-firstName" />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-brand-charcoal font-semibold text-sm">Last Name</Label>
                        <Input id="lastName" name="lastName" type="text" required placeholder="Smith" className="mt-2 border-2" data-testid="input-lastName" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-brand-charcoal font-semibold text-sm">Email Address</Label>
                      <Input id="email" name="email" type="email" required placeholder="john@example.com" className="mt-2 border-2" data-testid="input-email" />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue text-white font-semibold py-6" disabled={submitEmailMutation.isPending} data-testid="button-submit-email">
                      {submitEmailMutation.isPending ? (
                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Sending Report...</>
                      ) : (
                        <><Sparkles className="h-5 w-5 mr-2" />Send Me Deeper Insights</>
                      )}
                    </Button>
                  </form>
                )}

                {message.widget === "phone-form" && (
                  <div className="space-y-4 bg-white p-6 rounded-xl border-2 border-brand-sky-blue/20">
                    <div className="text-center mb-4">
                      <p className="text-brand-dark-navy font-bold text-lg">Get Training Access</p>
                      <p className="text-gray-600 text-sm">We'll text you the link to our exclusive training</p>
                    </div>
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <div>
                        <Label className="text-brand-charcoal font-semibold text-sm">Mobile Number</Label>
                        <div className="flex gap-2 mt-2">
                          <select name="countryCode" defaultValue="44" className="w-24 px-3 py-2 border-2 rounded-lg font-semibold text-sm" data-testid="select-country-code">
                            <option value="44">+44</option>
                            <option value="1">+1</option>
                            <option value="353">+353</option>
                          </select>
                          <Input id="phone" name="phone" type="tel" placeholder="7700 900000" className="flex-1 border-2" data-testid="input-phone" />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button type="submit" className="flex-1 bg-gradient-to-r from-brand-sky-blue to-brand-vivid-blue text-white font-semibold py-5" disabled={submitPhoneMutation.isPending} data-testid="button-submit-phone">
                          {submitPhoneMutation.isPending ? (
                            <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Sending...</>
                          ) : (
                            <><Zap className="h-5 w-5 mr-2" />Send Training Link</>
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleSkipPhone} className="px-6 border-2" data-testid="button-skip-phone">Skip</Button>
                      </div>
                    </form>
                  </div>
                )}

                {message.widget === "skip-options" && (
                  <div className="space-y-4 bg-white p-6 rounded-xl border-2 border-brand-vivid-blue/10">
                    <div className="text-center mb-4">
                      <p className="text-brand-dark-navy font-bold text-lg">What would you like to do next?</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={handleBookScaleSession} 
                        className="w-full bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue text-white font-semibold py-6"
                        data-testid="button-book-scale-session"
                      >
                        <Target className="h-5 w-5 mr-2" />
                        Book Scale Session
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleContinueChatting}
                        className="w-full border-2 py-6"
                        data-testid="button-continue-chatting"
                      >
                        <Sparkles className="h-5 w-5 mr-2" />
                        Continue Chatting
                      </Button>
                    </div>
                  </div>
                )}

                {message.widget === "calendar" && (
                  <div className="mt-4">
                    <CalendarEmbed />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl p-5 shadow-lg animate-pulse bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-brand-vivid-blue/20">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-vivid-blue to-brand-sky-blue flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-charcoal">Greg is typing...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-64 rounded bg-gray-200"></div>
                  <div className="h-4 w-48 rounded bg-gray-100"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={showCalendar ? "Still have questions? Ask away..." : "Type your message..."}
            disabled={isLoading}
            className="flex-1 border-2"
            data-testid="input-chat"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} data-testid="button-send">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </Card>

      {showCalendar && (
        <div className="mt-8">
          <ReviewsCarousel />
        </div>
      )}
    </div>
  );
}

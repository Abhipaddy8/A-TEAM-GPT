import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle, TrendingUp, XCircle, Sparkles, Zap, Target } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ScoreWidget from "./score-widget";
import type { PdfReportData } from "@shared/schema";

interface Message {
  role: "assistant" | "user";
  content: string;
  widget?: "score-display" | "email-form" | "phone-form" | "cta-button" | "question-options";
  data?: any;
}

interface DiagnosticChatProps {
  onBack: () => void;
}

interface QuestionOption {
  label: string;
  value: string;
  score?: number; // Optional direct score mapping
}

interface DiagnosticQuestion {
  id: number;
  question: string;
  options: QuestionOption[];
  section: string;
}

// Define diagnostic questions with multiple-choice options
const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    question: "How many active projects do you typically run at once?",
    section: "tradingCapacity",
    options: [
      { label: "1-3 projects", value: "1-3", score: 5 },
      { label: "4-7 projects", value: "4-7", score: 7 },
      { label: "8+ projects", value: "8+", score: 9 },
    ],
  },
  {
    id: 2,
    question: "What percentage of your subbies show up on time and finish when promised?",
    section: "reliability",
    options: [
      { label: "0-30% (Major reliability issues)", value: "0-30%", score: 3 },
      { label: "30-70% (Some reliability issues)", value: "30-70%", score: 5 },
      { label: "70-100% (Mostly reliable)", value: "70-100%", score: 8 },
    ],
  },
  {
    id: 3,
    question: "How often do you struggle to find skilled labour when you need it?",
    section: "recruitment",
    options: [
      { label: "Always - it's a constant battle", value: "Always", score: 3 },
      { label: "Sometimes - hit or miss", value: "Sometimes", score: 5 },
      { label: "Rarely - I have a good pipeline", value: "Rarely", score: 8 },
    ],
  },
  {
    id: 4,
    question: "Do you have a clear system for scheduling and managing your labour?",
    section: "systems",
    options: [
      { label: "No system - it's all in my head", value: "No system", score: 3 },
      { label: "Basic spreadsheets or notes", value: "Basic spreadsheets", score: 6 },
      { label: "Advanced software/project management tools", value: "Advanced software", score: 9 },
    ],
  },
  {
    id: 5,
    question: "How much time do you spend each week chasing subbies or fixing labour issues?",
    section: "profitability",
    options: [
      { label: "10+ hours per week", value: "10+ hours", score: 3 },
      { label: "5-10 hours per week", value: "5-10 hours", score: 5 },
      { label: "Less than 5 hours per week", value: "<5 hours", score: 8 },
    ],
  },
  {
    id: 6,
    question: "What's the biggest challenge you face with your labour pipeline?",
    section: "onboarding",
    options: [
      { label: "Finding workers", value: "Finding workers", score: 4 },
      { label: "Reliability and no-shows", value: "Reliability", score: 4 },
      { label: "Cost management", value: "Cost management", score: 5 },
      { label: "Quality issues", value: "Quality issues", score: 5 },
    ],
  },
  {
    id: 7,
    question: "How would you rate your team morale and culture?",
    section: "culture",
    options: [
      { label: "Poor - high turnover, low morale", value: "Poor", score: 3 },
      { label: "Average - could be better", value: "Average", score: 5 },
      { label: "Good - team is engaged and stable", value: "Good", score: 8 },
    ],
  },
];

export default function DiagnosticChat({ onBack }: DiagnosticChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm the A-Team Trades Pipeline assistant. I'll ask you 7 quick questions about your labour pipeline. Let's discover where you're losing money.\n\nReady to start?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [utmParams, setUtmParams] = useState<{
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Capture UTM parameters from URL on mount and persist to sessionStorage
    const searchParams = new URLSearchParams(window.location.search);
    const params: any = {};
    
    // First try to load from sessionStorage
    const storedUtm = sessionStorage.getItem('utm_params');
    if (storedUtm) {
      try {
        const parsed = JSON.parse(storedUtm);
        Object.assign(params, parsed);
        console.log('[UTM] Loaded from sessionStorage:', params);
      } catch (e) {
        console.error('[UTM] Failed to parse stored params:', e);
      }
    }
    
    // Then override with any new URL params (if present)
    if (searchParams.has('utm_source')) params.utmSource = searchParams.get('utm_source');
    if (searchParams.has('utm_medium')) params.utmMedium = searchParams.get('utm_medium');
    if (searchParams.has('utm_campaign')) params.utmCampaign = searchParams.get('utm_campaign');
    
    if (Object.keys(params).length > 0) {
      console.log('[UTM] Captured parameters:', params);
      // Persist to sessionStorage for later forms
      sessionStorage.setItem('utm_params', JSON.stringify(params));
      setUtmParams(params);
    }
  }, []);

  const submitEmailMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      firstName: string;
      lastName: string;
      diagnosticData: any;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
    }) => {
      console.log('[Client] Submitting email with data:', { email: data.email, firstName: data.firstName });
      const result = await apiRequest("POST", "/api/submit-email", {
        ...data,
        sessionId,
        ...utmParams,
      });
      console.log('[Client] Email submission result:', result);
      return result;
    },
    onSuccess: (data: any) => {
      console.log('[Client] Email submitted successfully, showing phone form');
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Perfect! Your report is being generated and will arrive in your inbox shortly.\n\nBonus: I can text you the A-Team Trades Quick Win Pack (3 fast fixes for your labour pipeline).\n\nWant it? Enter your mobile number below or click Skip.",
          widget: "phone-form",
        },
      ]);
    },
    onError: (error: any) => {
      console.error('[Client] Email submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to generate report. Please try again.",
      });
    },
  });

  const submitPhoneMutation = useMutation({
    mutationFn: async (data: { phone: string; email: string }) => {
      // Include UTM parameters from sessionStorage
      const storedUtm = sessionStorage.getItem('utm_params');
      let utmData = {};
      if (storedUtm) {
        try {
          utmData = JSON.parse(storedUtm);
        } catch (e) {
          console.error('[UTM] Failed to parse stored params for phone submission:', e);
        }
      }
      
      return apiRequest("POST", "/api/submit-phone", {
        ...data,
        sessionId,
        ...utmData,
      });
    },
    onSuccess: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Thanks! You'll get the Quick Win Pack via text shortly.\n\nYour report is on its way. If you want help fixing your score, book a Scale Session call below:",
          widget: "cta-button",
          data: {
            label: "Book My Scale Session Call",
            href: `/api/visit?cid=${sessionId}`,
          },
        },
      ]);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to register phone number. Please try again.",
      });
    },
  });

  // Calculate score based on answers - now uses all 7 questions!
  const calculateScore = (answers: string[]) => {
    // Initialize scores for all 7 sections
    let scores = {
      tradingCapacity: 5,
      reliability: 5,
      recruitment: 5,
      systems: 5,
      profitability: 5,
      onboarding: 5,
      culture: 5,
    };

    // Extract scores from each answer by matching against question options
    DIAGNOSTIC_QUESTIONS.forEach((question, index) => {
      const answer = answers[index];
      if (answer) {
        // Find the option that matches this answer
        const matchedOption = question.options.find(opt =>
          answer.includes(opt.value) || answer.includes(opt.label)
        );

        if (matchedOption && matchedOption.score) {
          scores[question.section as keyof typeof scores] = matchedOption.score;
        }
      }
    });

    // Calculate overall score (average of all sections * 10 to get 0-100 scale)
    const sectionValues = Object.values(scores);
    const averageScore = sectionValues.reduce((sum, score) => sum + score, 0) / sectionValues.length;
    const overallScore = Math.round(averageScore * 10);

    return { scores, overallScore };
  };

  const getScoreColor = (score: number): "green" | "amber" | "red" => {
    if (score >= 7) return "green";
    if (score >= 4) return "amber";
    return "red";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Store the answer
    const newAnswers = [...userAnswers, userMessage];
    setUserAnswers(newAnswers);

    try {
      // Simulated diagnostic flow
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (currentStep < 7) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);

        if (nextStep <= 7) {
          const currentQuestion = DIAGNOSTIC_QUESTIONS[nextStep - 1];
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Question ${currentQuestion.id}: ${currentQuestion.question}`,
              widget: "question-options",
              data: currentQuestion.options,
            },
          ]);
        }
      } else if (currentStep === 7) {
        // After answering question 7, calculate and show results
        const { scores, overallScore } = calculateScore(newAnswers);
        const scoreColor = overallScore >= 70 ? "green" : overallScore >= 50 ? "amber" : "red";

        const scoreData: PdfReportData = {
          email: "", // Will be filled in when user submits email form
          builderName: "", // Will be filled in when user submits email form
          overallScore,
          scoreColor,
          sectionScores: {
            tradingCapacity: {
              score: scores.tradingCapacity,
              color: getScoreColor(scores.tradingCapacity),
              commentary:
                scores.tradingCapacity >= 7
                  ? "Strong project capacity"
                  : scores.tradingCapacity >= 4
                    ? "Moderate capacity - room to grow"
                    : "Limited capacity affecting growth",
            },
            reliability: {
              score: scores.reliability,
              color: getScoreColor(scores.reliability),
              commentary:
                scores.reliability >= 7
                  ? "Reliable labour pipeline"
                  : scores.reliability >= 4
                    ? "Moderate reliability issues"
                    : "Critical reliability problems",
            },
            recruitment: {
              score: scores.recruitment,
              color: getScoreColor(scores.recruitment),
              commentary:
                scores.recruitment >= 7
                  ? "Strong recruitment pipeline"
                  : scores.recruitment >= 4
                    ? "Moderate recruitment challenges"
                    : "Struggling to attract skilled labour",
            },
            systems: {
              score: scores.systems,
              color: getScoreColor(scores.systems),
              commentary:
                scores.systems >= 7
                  ? "Advanced management systems"
                  : scores.systems >= 4
                    ? "Basic systems in place"
                    : "No proper systems - causing issues",
            },
            profitability: {
              score: scores.profitability,
              color: getScoreColor(scores.profitability),
              commentary:
                scores.profitability >= 7
                  ? "Good labour profitability"
                  : scores.profitability >= 4
                    ? "Moderate profitability concerns"
                    : "Poor labour profitability",
            },
            onboarding: {
              score: scores.onboarding,
              color: getScoreColor(scores.onboarding),
              commentary:
                scores.onboarding >= 7
                  ? "Effective onboarding process"
                  : scores.onboarding >= 4
                    ? "Basic onboarding in place"
                    : "Onboarding needs improvement",
            },
            culture: {
              score: scores.culture,
              color: getScoreColor(scores.culture),
              commentary:
                scores.culture >= 7
                  ? "Strong team culture and morale"
                  : scores.culture >= 4
                    ? "Average culture - could improve"
                    : "Poor culture affecting retention",
            },
          },
          topRecommendations: [
            {
              title: scores.reliability < 5 ? "Fix Subbie Reliability" : "Strengthen Labour Systems",
              explanation:
                scores.reliability < 5
                  ? "Implement a tiered payment system and reliability tracking"
                  : "Formalize your labour management processes",
              impact: "£20K-£40K per year",
            },
            {
              title: scores.systems < 5 ? "Implement Management Software" : "Optimize Current Systems",
              explanation:
                scores.systems < 5
                  ? "Move from spreadsheets to proper labour management software"
                  : "Fine-tune your existing systems for better efficiency",
              impact: "£15K-£30K per year",
            },
            {
              title: scores.recruitment < 5 ? "Build Labour Pipeline" : "Maintain Strong Pipeline",
              explanation:
                scores.recruitment < 5
                  ? "Create a systematic approach to attracting and retaining skilled workers"
                  : "Continue nurturing your existing recruitment channels",
              impact: "£25K-£50K per year",
            },
          ],
          riskProfile: {
            color: scoreColor,
            explanation:
              scoreColor === "red"
                ? "Critical risk - immediate action required"
                : scoreColor === "amber"
                  ? "Moderate risk - improvements needed"
                  : "Low risk - maintain current systems",
          },
          labourLeakProjection: {
            annualLeak: scoreColor === "red" ? "£60K-£120K" : scoreColor === "amber" ? "£35K-£75K" : "£15K-£35K",
            improvementRange:
              scoreColor === "red" ? "£40K-£80K" : scoreColor === "amber" ? "£20K-£50K" : "£10K-£25K",
            timeHorizon: scoreColor === "red" ? "90-120 days" : scoreColor === "amber" ? "60-90 days" : "30-60 days",
          },
        };

        setDiagnosticData(scoreData);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Thanks! I've analyzed your responses. Here's your A-Team Trades Pipeline™ Score:",
            widget: "score-display",
            data: scoreData,
          },
        ]);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;

    console.log('[Client] Email form submitted:', { firstName, lastName, email, hasDiagnosticData: !!diagnosticData });

    if (!email || !firstName || !lastName || !diagnosticData) {
      console.error('[Client] Missing required fields');
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields",
      });
      return;
    }

    // Update diagnosticData with email before sending
    const updatedDiagnosticData = {
      ...diagnosticData,
      email,
      builderName: `${firstName} ${lastName}`,
    };

    setMessages((prev) => [...prev, { role: "user", content: `${firstName} ${lastName} - ${email}` }]);
    submitEmailMutation.mutate({ email, firstName, lastName, diagnosticData: updatedDiagnosticData });
  };

  const handlePhoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phone = formData.get("phone") as string;

    if (!phone) return;

    setMessages((prev) => [...prev, { role: "user", content: phone }]);
    submitPhoneMutation.mutate({
      phone,
      email: diagnosticData?.email || "unknown@example.com",
    });
  };

  const handleSkipPhone = () => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Skip" },
      {
        role: "assistant",
        content:
          "No problem! Your report is on its way. If you want help fixing your score, book a Scale Session call below:",
        widget: "cta-button",
        data: {
          label: "Book My Scale Session Call",
          href: `/api/visit?cid=${sessionId}`,
        },
      },
    ]);
  };

  const progress = (currentStep / 7) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 hover:bg-brand-soft-grey/50 transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-brand-dark-navy">Labour Pipeline Diagnostic</h2>
          <Badge className="bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue text-white px-4 py-2 text-sm font-semibold">
            {currentStep}/7 Questions
          </Badge>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3 bg-brand-soft-grey" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }} />
        </div>
      </div>

      {/* Chat Container */}
      <Card className="p-6 min-h-[600px] flex flex-col shadow-2xl border-brand-vivid-blue/20 bg-gradient-to-b from-white to-gray-50">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-6" data-testid="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-5 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-brand-vivid-blue to-brand-sky-blue text-white"
                    : "bg-white border-2 border-brand-soft-grey"
                }`}
                data-testid={`message-${message.role}-${index}`}
              >
                {/* AI Icon for assistant messages */}
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-brand-soft-grey">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-vivid-blue to-brand-sky-blue flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">A-Team Assistant</span>
                  </div>
                )}
                <p className={`text-base leading-relaxed whitespace-pre-line ${message.role === "user" ? "text-white" : "text-brand-charcoal"}`}>
                  {message.content}
                </p>

                {/* Widgets */}
                {message.widget === "score-display" && message.data && (
                  <div className="mt-4">
                    <ScoreWidget data={message.data} />
                  </div>
                )}

                {message.widget === "question-options" && message.data && (
                  <div className="mt-6 space-y-3">
                    {message.data.map((option: QuestionOption, optIndex: number) => (
                      <button
                        key={optIndex}
                        type="button"
                        className="w-full justify-start text-left h-auto py-4 px-5 border-2 border-brand-vivid-blue/20 hover:border-brand-vivid-blue hover:bg-brand-vivid-blue transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group rounded-md bg-white"
                        onClick={() => {
                          setInput(option.label);
                          setTimeout(() => handleSend(), 50);
                        }}
                        data-testid={`option-${optIndex}`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 rounded-full bg-brand-vivid-blue/10 group-hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
                            <Target className="h-5 w-5 text-brand-vivid-blue group-hover:text-white transition-colors" />
                          </div>
                          <span className="font-medium text-sm flex-1 group-hover:text-white transition-colors text-brand-charcoal">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {message.widget === "email-form" && (
                  <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4 bg-gradient-to-br from-brand-soft-grey/30 to-white p-6 rounded-xl border-2 border-brand-vivid-blue/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-brand-charcoal font-semibold text-sm">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          required
                          placeholder="John"
                          className="mt-2 border-2 border-brand-soft-grey focus:border-brand-vivid-blue transition-colors"
                          data-testid="input-firstName"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-brand-charcoal font-semibold text-sm">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          placeholder="Smith"
                          className="mt-2 border-2 border-brand-soft-grey focus:border-brand-vivid-blue transition-colors"
                          data-testid="input-lastName"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-brand-charcoal font-semibold text-sm">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="john.smith@example.com"
                        className="mt-2 border-2 border-brand-soft-grey focus:border-brand-vivid-blue transition-colors"
                        data-testid="input-email"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue hover:from-brand-vivid-blue/90 hover:to-brand-sky-blue/90 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      disabled={submitEmailMutation.isPending}
                      data-testid="button-submit-email"
                    >
                      {submitEmailMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating Your Report...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Send My Free Report
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {message.widget === "phone-form" && (
                  <div className="mt-6 space-y-4 bg-gradient-to-br from-brand-soft-grey/30 to-white p-6 rounded-xl border-2 border-brand-sky-blue/20">
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="phone" className="text-brand-charcoal font-semibold text-sm">
                          Mobile Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+44 7700 900000"
                          className="mt-2 border-2 border-brand-soft-grey focus:border-brand-sky-blue transition-colors"
                          data-testid="input-phone"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-brand-sky-blue to-brand-vivid-blue hover:from-brand-sky-blue/90 hover:to-brand-vivid-blue/90 text-white font-semibold py-5 shadow-lg hover:shadow-xl transition-all duration-300"
                          disabled={submitPhoneMutation.isPending}
                          data-testid="button-submit-phone"
                        >
                          {submitPhoneMutation.isPending ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Sending SMS...
                            </>
                          ) : (
                            <>
                              <Zap className="h-5 w-5 mr-2" />
                              Text Me Quick Wins
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSkipPhone}
                          className="px-6 border-2 hover:bg-brand-soft-grey transition-colors"
                          data-testid="button-skip-phone"
                        >
                          Skip
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {message.widget === "cta-button" && message.data && (
                  <div className="mt-6">
                    <a
                      href={message.data.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="button-cta"
                    >
                      <Button className="w-full bg-gradient-to-r from-brand-sky-blue to-brand-vivid-blue hover:from-brand-sky-blue/90 hover:to-brand-vivid-blue/90 text-white font-bold py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                        <Sparkles className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                        {message.data.label}
                        <Zap className="h-6 w-6 ml-3 group-hover:rotate-12 transition-transform" />
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl p-5 bg-white border-2 border-brand-soft-grey shadow-lg animate-pulse">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-brand-soft-grey">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-vivid-blue to-brand-sky-blue flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <span className="text-xs font-semibold text-brand-charcoal uppercase tracking-wide">Analyzing...</span>
                </div>
                <div className="h-4 w-64 bg-brand-soft-grey rounded mb-2"></div>
                <div className="h-4 w-48 bg-brand-soft-grey/60 rounded"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {currentStep <= 7 && !diagnosticData && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer..."
              disabled={isLoading}
              className="flex-1"
              data-testid="input-chat"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              data-testid="button-send"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}

        {diagnosticData && !messages.some((m) => m.widget === "email-form") && currentStep === 7 && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button
              onClick={() => {
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content:
                      "I can send you the full personalised report. Drop your email below and I'll send it instantly.",
                    widget: "email-form",
                  },
                ]);
              }}
              className="w-full bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue hover:from-brand-vivid-blue/90 hover:to-brand-sky-blue/90 text-white font-bold py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              data-testid="button-get-report"
            >
              <Sparkles className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
              Get My Full PDF Report
              <Zap className="h-6 w-6 ml-3 group-hover:rotate-12 transition-transform" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

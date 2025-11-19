import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Send, Loader2, CheckCircle2, AlertCircle, TrendingUp, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ScoreWidget from "./score-widget";
import type { PdfReportData } from "@shared/schema";

interface Message {
  role: "assistant" | "user";
  content: string;
  widget?: "score-display" | "email-form" | "phone-form" | "cta-button";
  data?: any;
}

interface DiagnosticChatProps {
  onBack: () => void;
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const submitEmailMutation = useMutation({
    mutationFn: async (data: { email: string; diagnosticData: any }) => {
      return apiRequest("POST", "/api/submit-email", data);
    },
    onSuccess: (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Perfect! I'm generating your personalised PDF report now. You'll receive it in your inbox within the next few minutes.\n\nI've also got a bonus most builders love — I can text you the A-Team Trades Quick Win Pack (3 fast fixes for your labour pipeline).\n\nWant it? If yes, enter your mobile number below. If not, just click Skip.",
          widget: "phone-form",
        },
      ]);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report. Please try again.",
      });
    },
  });

  const submitPhoneMutation = useMutation({
    mutationFn: async (data: { phone: string; email: string }) => {
      return apiRequest("POST", "/api/submit-phone", data);
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

  // Calculate score based on answers
  const calculateScore = (answers: string[]) => {
    let scores = {
      tradingCapacity: 5,
      reliabilityStability: 5,
      labourAttraction: 5,
      managementSystems: 5,
      labourProfitability: 5,
    };

    // Q1: How many active projects (Trading Capacity)
    if (answers[0]) {
      if (answers[0].includes("8+")) scores.tradingCapacity = 9;
      else if (answers[0].includes("4-7")) scores.tradingCapacity = 7;
      else scores.tradingCapacity = 5;
    }

    // Q2: Percentage of reliable subbies (Reliability & Stability)
    if (answers[1]) {
      if (answers[1].includes("70-100")) scores.reliabilityStability = 8;
      else if (answers[1].includes("30-70")) scores.reliabilityStability = 5;
      else scores.reliabilityStability = 3;
    }

    // Q3: Struggle to find labour (Labour Attraction)
    if (answers[2]) {
      const lower = answers[2].toLowerCase();
      if (lower.includes("rarely")) scores.labourAttraction = 8;
      else if (lower.includes("sometimes")) scores.labourAttraction = 5;
      else scores.labourAttraction = 3;
    }

    // Q4: Management systems (Management Systems)
    if (answers[3]) {
      const lower = answers[3].toLowerCase();
      if (lower.includes("advanced")) scores.managementSystems = 9;
      else if (lower.includes("basic") || lower.includes("spreadsheet")) scores.managementSystems = 6;
      else scores.managementSystems = 3;
    }

    // Q5: Time spent chasing (affects Reliability and Profitability)
    if (answers[4]) {
      if (answers[4].includes("<5")) {
        scores.labourProfitability += 2;
        scores.reliabilityStability += 1;
      } else if (answers[4].includes("5-10")) {
        scores.labourProfitability += 0;
      } else {
        scores.labourProfitability -= 2;
        scores.reliabilityStability -= 1;
      }
    }

    // Q6: Biggest challenge (affects multiple areas)
    if (answers[5]) {
      const lower = answers[5].toLowerCase();
      if (lower.includes("finding")) scores.labourAttraction -= 1;
      if (lower.includes("reliability")) scores.reliabilityStability -= 1;
      if (lower.includes("cost")) scores.labourProfitability -= 1;
    }

    // Clamp scores between 1-10
    Object.keys(scores).forEach((key) => {
      scores[key as keyof typeof scores] = Math.max(1, Math.min(10, scores[key as keyof typeof scores]));
    });

    const overallScore = Math.round(
      (scores.tradingCapacity +
        scores.reliabilityStability +
        scores.labourAttraction +
        scores.managementSystems +
        scores.labourProfitability) *
        2
    );

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

        const questions = [
          "Question 1: How many active projects do you typically run at once? (1-3, 4-7, 8+)",
          "Question 2: What percentage of your subbies show up on time and finish when promised? (0-30%, 30-70%, 70-100%)",
          "Question 3: How often do you struggle to find skilled labour when you need it? (Always, Sometimes, Rarely)",
          "Question 4: Do you have a clear system for scheduling and managing your labour? (No system, Basic spreadsheets, Advanced software)",
          "Question 5: How much time do you spend each week chasing subbies or fixing labour issues? (10+ hours, 5-10 hours, <5 hours)",
          "Question 6: What's your biggest labour challenge right now? (Finding workers, Reliability, Cost management, Quality issues)",
          "Question 7: If you could fix ONE thing about your labour pipeline tomorrow, what would it be?",
        ];

        if (nextStep < 7) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: questions[nextStep - 1],
            },
          ]);
        } else if (nextStep === 7) {
          // Show question 7
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: questions[6],
            },
          ]);
        }
      } else if (currentStep === 7) {
        // After answering question 7, calculate and show results
        const { scores, overallScore } = calculateScore(newAnswers);
        const scoreColor = overallScore >= 70 ? "green" : overallScore >= 50 ? "amber" : "red";

        const scoreData: PdfReportData = {
          email: "builder@example.com",
          builderName: "Builder",
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
            reliabilityStability: {
              score: scores.reliabilityStability,
              color: getScoreColor(scores.reliabilityStability),
              commentary:
                scores.reliabilityStability >= 7
                  ? "Reliable labour pipeline"
                  : scores.reliabilityStability >= 4
                    ? "Moderate reliability issues"
                    : "Critical reliability problems",
            },
            labourAttraction: {
              score: scores.labourAttraction,
              color: getScoreColor(scores.labourAttraction),
              commentary:
                scores.labourAttraction >= 7
                  ? "Strong labour attraction"
                  : scores.labourAttraction >= 4
                    ? "Moderate attraction challenges"
                    : "Struggling to attract skilled labour",
            },
            managementSystems: {
              score: scores.managementSystems,
              color: getScoreColor(scores.managementSystems),
              commentary:
                scores.managementSystems >= 7
                  ? "Advanced management systems"
                  : scores.managementSystems >= 4
                    ? "Basic systems in place"
                    : "No proper systems - causing issues",
            },
            labourProfitability: {
              score: scores.labourProfitability,
              color: getScoreColor(scores.labourProfitability),
              commentary:
                scores.labourProfitability >= 7
                  ? "Good labour profitability"
                  : scores.labourProfitability >= 4
                    ? "Moderate profitability concerns"
                    : "Poor labour profitability",
            },
          },
          topRecommendations: [
            {
              title: scores.reliabilityStability < 5 ? "Fix Subbie Reliability" : "Strengthen Labour Systems",
              explanation:
                scores.reliabilityStability < 5
                  ? "Implement a tiered payment system and reliability tracking"
                  : "Formalize your labour management processes",
              impact: "£20K-£40K per year",
            },
            {
              title: scores.managementSystems < 5 ? "Implement Management Software" : "Optimize Current Systems",
              explanation:
                scores.managementSystems < 5
                  ? "Move from spreadsheets to proper labour management software"
                  : "Fine-tune your existing systems for better efficiency",
              impact: "£15K-£30K per year",
            },
            {
              title: "Build Labour Pipeline",
              explanation: "Create a systematic approach to attracting and retaining skilled workers",
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
    const email = formData.get("email") as string;

    if (!email || !diagnosticData) return;

    setMessages((prev) => [...prev, { role: "user", content: email }]);
    submitEmailMutation.mutate({ email, diagnosticData });
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
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Labour Pipeline Diagnostic</h2>
          <Badge variant="secondary">
            {currentStep}/7 Questions
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Chat Container */}
      <Card className="p-6 min-h-[600px] flex flex-col shadow-2xl border-brand-blue/20">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4" data-testid="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  message.role === "user"
                    ? "bg-brand-blue text-white"
                    : "bg-muted"
                }`}
                data-testid={`message-${message.role}-${index}`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>

                {/* Widgets */}
                {message.widget === "score-display" && message.data && (
                  <div className="mt-4">
                    <ScoreWidget data={message.data} />
                  </div>
                )}

                {message.widget === "email-form" && (
                  <form onSubmit={handleEmailSubmit} className="mt-4 space-y-3">
                    <div>
                      <Label htmlFor="email" className="text-foreground">
                        Your Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="builder@example.com"
                        className="mt-1"
                        data-testid="input-email"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitEmailMutation.isPending}
                      data-testid="button-submit-email"
                    >
                      {submitEmailMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Report...
                        </>
                      ) : (
                        "Send My Report"
                      )}
                    </Button>
                  </form>
                )}

                {message.widget === "phone-form" && (
                  <div className="mt-4 space-y-3">
                    <form onSubmit={handlePhoneSubmit} className="space-y-3">
                      <div>
                        <Label htmlFor="phone" className="text-foreground">
                          Mobile Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+44 7700 900000"
                          className="mt-1"
                          data-testid="input-phone"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={submitPhoneMutation.isPending}
                          data-testid="button-submit-phone"
                        >
                          {submitPhoneMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Text Me"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSkipPhone}
                          data-testid="button-skip-phone"
                        >
                          Skip
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {message.widget === "cta-button" && message.data && (
                  <div className="mt-4">
                    <a
                      href={message.data.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="button-cta"
                    >
                      <Button className="w-full bg-brand-teal hover:bg-brand-teal/90">
                        {message.data.label}
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl p-4 bg-muted">
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {currentStep < 7 && (
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
          <div className="mt-4">
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
              className="w-full bg-brand-blue hover:bg-brand-blue/90"
              data-testid="button-get-report"
            >
              Get My Full PDF Report
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

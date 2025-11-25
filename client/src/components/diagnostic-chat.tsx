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
  widget?: "score-display" | "email-form" | "phone-form" | "cta-button" | "question-options" | "start-button" | "skip-continue";
  data?: any;
}

interface DiagnosticChatProps {
  onBack?: () => void;
  embedded?: boolean;
  onBookingClick?: () => void;
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

export default function DiagnosticChat({ onBack, embedded = false, onBookingClick }: DiagnosticChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi there! 👋 I'm the A-Team assistant.\n\nI help UK builders identify labour pipeline issues that typically cost £20K-£90K per year.\n\n**What I can do:**\n• Answer questions about labour, recruitment, or team challenges\n• Run a 3-minute diagnostic to find your specific gaps\n• Help you book a free Scale Session with our team\n\nWhat would you like to explore?",
      widget: embedded ? "skip-continue" : "start-button",
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
  const [inDiagnosticMode, setInDiagnosticMode] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [lastNudgeCount, setLastNudgeCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    });
  };

  // Auto-scroll on new messages, but skip initial page load (greeting only)
  useEffect(() => {
    // Skip scroll ONLY on embedded first load (greeting only)
    const isJustGreeting = embedded && messages.length === 1;

    if (!isJustGreeting) {
      scrollToBottom();
    }
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

  // Generate intelligent acknowledgment for diagnostic answers with clarification
  const generateDiagnosticAcknowledgment = (questionIndex: number, userAnswer: string): { acknowledgment: string; needsClarification: boolean; clarifyingQuestion?: string } => {
    const acknowledgments = [
      // Question 1: Projects
      (answer: string) => {
        const lower = answer.toLowerCase();

        // Check for variable/uncertain answers
        if (lower.includes("depends") || lower.includes("varies") || lower.includes("month") || lower.includes("seasonal") || lower.includes("not sure")) {
          return {
            acknowledgment: "I hear you - projects fluctuate seasonally, which is normal in the trades.\n\nTo get a better sense, let me ask...",
            needsClarification: true,
            clarifyingQuestion: "On average, during your busier months, how many projects are you typically managing?"
          };
        }

        if (lower.includes("1") || lower.includes("one") || lower.includes("2") || lower.includes("two") || lower.includes("3") || lower.includes("three") || lower.includes("few") || lower.includes("small")) {
          return {
            acknowledgment: "I see you're currently managing 1-3 projects. That suggests you have capacity to grow, but something's holding you back.\n\nTo understand what's limiting your project pipeline, let me ask...",
            needsClarification: false
          };
        } else if (lower.includes("8") || lower.includes("nine") || lower.includes("ten") || lower.includes("10+") || lower.includes("many") || lower.includes("lot") || lower.includes("multiple")) {
          return {
            acknowledgment: "Impressive - you're handling 8+ projects simultaneously! That's a lot of moving parts to coordinate.\n\nWith that volume, reliability becomes crucial. Let me ask...",
            needsClarification: false
          };
        } else {
          return {
            acknowledgment: "Got it - you're running 4-7 projects, which is a solid workload for most builders.\n\nNow, to understand how smoothly those projects are running...",
            needsClarification: false
          };
        }
      },
      // Question 2: Reliability
      (answer: string) => {
        const lower = answer.toLowerCase();
        if (lower.includes("0-30") || lower.includes("poor") || lower.includes("bad") || lower.includes("never") || lower.includes("no-show") || lower.includes("unreliable")) {
          return {
            acknowledgment: "That's a significant challenge - unreliable subbies can completely derail projects and cost you thousands in delays.\n\nReliability issues often stem from recruitment problems. Let me understand your pipeline...",
            needsClarification: false
          };
        } else if (lower.includes("70-100") || lower.includes("good") || lower.includes("reliable") || lower.includes("excellent") || lower.includes("most")) {
          return {
            acknowledgment: "Excellent! Having reliable subbies is a huge competitive advantage. That speaks well to your relationships and systems.\n\nNow, when you do need new labour, how easy is it to find...",
            needsClarification: false
          };
        } else {
          return {
            acknowledgment: "So you're seeing mixed reliability - some subbies are great, others not so much. That inconsistency makes planning difficult.\n\nLet's look at where those workers are coming from...",
            needsClarification: false
          };
        }
      },
      // Question 3: Recruitment
      (answer: string) => {
        const lower = answer.toLowerCase();
        if (lower.includes("always") || lower.includes("constant") || lower.includes("impossible") || lower.includes("struggle") || lower.includes("very difficult") || lower.includes("all the time")) {
          return {
            acknowledgment: "The labour shortage is hitting you hard - you're not alone. Most UK builders tell us finding skilled workers is their #1 challenge.\n\nOften, recruitment struggles reveal gaps in systems. Tell me about your management approach...",
            needsClarification: false
          };
        } else if (lower.includes("rarely") || lower.includes("easy") || lower.includes("good pipeline") || lower.includes("not usually") || lower.includes("seldom")) {
          return {
            acknowledgment: "That's impressive! You've built a strong recruitment pipeline. That's a real competitive moat in today's market.\n\nWith good workers coming in, let's look at how you're managing them...",
            needsClarification: false
          };
        } else {
          return {
            acknowledgment: "Hit or miss recruitment - so sometimes you find great people, other times it's a struggle. That uncertainty makes growth planning tough.\n\nLet's explore how you're organizing your labour management...",
            needsClarification: false
          };
        }
      },
      // Question 4: Systems
      (answer: string) => {
        const lower = answer.toLowerCase();
        if (lower.includes("no system") || lower.includes("head") || lower.includes("memory") || lower.includes("chaos") || lower.includes("nothing") || lower.includes("just")) {
          return {
            acknowledgment: "Running everything in your head is exhausting and doesn't scale. I hear that from a lot of builders - you're holding the entire operation together.\n\nThat mental load is costing you time daily. Speaking of which...",
            needsClarification: false
          };
        } else if (lower.includes("advanced") || lower.includes("software") || lower.includes("digital") || lower.includes("app") || lower.includes("system")) {
          return {
            acknowledgment: "Great! You've invested in proper management tools. That puts you ahead of most builders who are still using spreadsheets or pen and paper.\n\nWith good systems in place, let's quantify the time you're spending on labour issues...",
            needsClarification: false
          };
        } else {
          return {
            acknowledgment: "Spreadsheets and notes - that's where most builders start. It works to a point, but becomes unwieldy as you grow.\n\nLet's look at how much time these manual processes are costing you...",
            needsClarification: false
          };
        }
      },
      // Question 5: Time spent
      (answer: string) => {
        const lower = answer.toLowerCase();
        if (lower.includes("10+") || lower.includes("lots") || lower.includes("constantly") || lower.includes("always") || lower.includes("spend most") || lower.includes("too much")) {
          return {
            acknowledgment: "10+ hours per week chasing subbies? That's essentially 1-2 full workdays wasted on firefighting. At builder rates, that's £5K-£10K per month in lost productivity.\n\nThat admin burden often points to deeper issues. Let me understand the root cause...",
            needsClarification: false
          };
        } else if (lower.includes("<5") || lower.includes("less than 5") || lower.includes("minimal") || lower.includes("not much") || lower.includes("barely") || lower.includes("very little")) {
          return {
            acknowledgment: "Less than 5 hours weekly - that's fantastic! You've clearly got solid processes and reliable people in place.\n\nThat efficiency is rare. Let's identify where your biggest challenge actually is...",
            needsClarification: false
          };
        } else {
          return {
            acknowledgment: "5-10 hours per week - that's still a full workday spent on labour admin instead of growing the business or being on-site.\n\nThat time drain usually has a specific root cause. Tell me...",
            needsClarification: false
          };
        }
      },
      // Question 6: Biggest challenge
      (answer: string) => {
        const lower = answer.toLowerCase();
        if (lower.includes("finding") || lower.includes("recruitment") || lower.includes("hire") || lower.includes("get workers") || lower.includes("find people")) {
          return {
            acknowledgment: "Finding workers is your critical bottleneck - everything else suffers when you can't fill positions quickly.\n\nRecruitment challenges often link to team culture. When people don't want to stay, they don't refer friends either. Let me ask...",
            needsClarification: false
          };
        } else if (lower.includes("reliability") || lower.includes("no-show") || lower.includes("late") || lower.includes("don't show") || lower.includes("missing")) {
          return {
            acknowledgment: "Unreliable subbies are incredibly frustrating - you plan your day around them and they don't show. That cascades into missed deadlines and angry clients.\n\nReliability issues usually trace back to how people feel about working for you. Speaking of culture...",
            needsClarification: false
          };
        } else if (lower.includes("quality") || lower.includes("rework") || lower.includes("standards") || lower.includes("workmanship")) {
          return {
            acknowledgment: "Quality issues mean you're paying twice - once for the initial work, again for fixing it. Plus the damage to your reputation.\n\nQuality problems often come from poor onboarding and training. But first, let's look at team morale...",
            needsClarification: false
          };
        } else {
          return {
            acknowledgment: "Cost management is squeezing your margins - you're caught between paying enough to attract good workers and maintaining profitability.\n\nPricing challenges often reflect broader cultural issues. Let me understand your team dynamic...",
            needsClarification: false
          };
        }
      },
      // Question 7: Culture
      (answer: string) => {
        const lower = answer.toLowerCase();
        if (lower.includes("poor") || lower.includes("low") || lower.includes("high turnover") || lower.includes("bad") || lower.includes("terrible") || lower.includes("awful")) {
          return {
            acknowledgment: "Poor morale and high turnover - that's the most expensive problem in trades. Every person who leaves costs you £10K-£15K in recruitment, training, and lost productivity.\n\nBut here's the good news: culture is fixable, and it has the highest ROI of any improvement you can make.\n\nLet me analyze everything you've told me...",
            needsClarification: false
          };
        } else if (lower.includes("good") || lower.includes("stable") || lower.includes("engaged") || lower.includes("strong") || lower.includes("positive")) {
          return {
            acknowledgment: "Strong team culture - that's your biggest asset! Engaged, stable workers are worth their weight in gold. They show up, do quality work, and refer other good people.\n\nWith solid culture in place, any challenges you have are likely system and process issues, which are easier to fix.\n\nLet me analyze your complete picture...",
            needsClarification: false
          };
        } else {
          return {
            acknowledgment: "Average culture with room for improvement - you're not bleeding people, but you're not inspiring loyalty either. That's the danger zone where small issues can snowball.\n\nCulture improvements have the highest ROI because they affect everything - reliability, quality, recruitment, and retention.\n\nLet me pull together your full diagnostic...",
            needsClarification: false
          };
        }
      }
    ];

    return acknowledgments[questionIndex](userAnswer);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Simulated diagnostic flow
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // If in diagnostic mode, progress through questions
      if (inDiagnosticMode && currentStep > 0 && currentStep <= 7) {
        // Store the answer
        const newAnswers = [...userAnswers, userMessage];
        setUserAnswers(newAnswers);

        if (currentStep < 7) {
          const nextStep = currentStep + 1;
          setCurrentStep(nextStep);

          // Generate intelligent acknowledgment
          const result = generateDiagnosticAcknowledgment(currentStep - 1, userMessage);

          if (result.needsClarification && result.clarifyingQuestion) {
            // If answer is ambiguous, ask clarifying question first
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `${result.acknowledgment}\n\n${result.clarifyingQuestion}`,
              },
            ]);
            // Decrement step since we're asking for clarification, not moving forward yet
            setCurrentStep(currentStep);
          } else {
            // Move to next question
            const currentQuestion = DIAGNOSTIC_QUESTIONS[nextStep - 1];

            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `${result.acknowledgment}\n\nQuestion ${currentQuestion.id}: ${currentQuestion.question}`,
                widget: "question-options",
                data: currentQuestion.options,
              },
            ]);
          }
        } else if (currentStep === 7) {
          // After answering question 7, calculate and show results
          const result = generateDiagnosticAcknowledgment(6, userMessage);

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
              content: `${result.acknowledgment}\n\nI've analyzed your complete picture. Here's your A-Team Trades Pipeline™ Score:`,
              widget: "score-display",
              data: scoreData,
            },
          ]);
          setInDiagnosticMode(false);
        }
      } else {
        // Free conversation mode - increment conversation count
        setConversationCount((prev) => prev + 1);

        try {
          // Call AI chat endpoint for real conversation
          const aiResponse = await apiRequest("POST", "/api/chat", {
            message: userMessage,
          });

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: aiResponse.message,
            },
          ]);
        } catch (error) {
          console.error("[Chat] Error getting AI response:", error);
          // Fallback to basic response if API fails
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "I'm having trouble responding right now. Please try again, or book a call with our team for personalized help.",
            },
          ]);
        }

        // Occasional gentle nudge after 7+ messages (only 30% of the time, and every 7 messages)
        const messagesSinceLastNudge = conversationCount - lastNudgeCount;
        if (messagesSinceLastNudge >= 7 && Math.random() < 0.3) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "By the way, if you'd like to see exactly where you're losing money, I can run a quick 3-minute diagnostic for you. No pressure though - happy to keep chatting!",
                widget: "skip-continue",
              },
            ]);
            setLastNudgeCount(conversationCount);
          }, 2000);
        }
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

  // Generate conversational responses based on user input
  const generateConversationalResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Greeting responses
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/i)) {
      return "Hi there! 👋 I'm the A-Team assistant. I help UK builders identify labour pipeline issues that cost them tens of thousands each year.\n\nI can:\n• Answer questions about labour, recruitment, or team management\n• Run a 3-minute diagnostic to find your specific gaps\n• Help you book a call with our team\n\nWhat would you like to explore?";
    }

    // Diagnostic questions
    if (lowerMessage.includes("what") && (lowerMessage.includes("diagnostic") || lowerMessage.includes("test") || lowerMessage.includes("assessment"))) {
      return "Great question! The A-Team Trades Pipeline™ diagnostic is a 7-question assessment that evaluates:\n\n✓ Trading Capacity - How many projects you can handle\n✓ Reliability - Subbie punctuality and completion rates\n✓ Recruitment - Your ability to find skilled labour\n✓ Systems - Management tools and processes\n✓ Profitability - Time spent chasing subbies\n✓ Team Culture - Morale and retention\n✓ Onboarding - Training effectiveness\n\nYou'll get a traffic-light score showing exactly where you're losing money (typically £20K-£90K/year) and the top 3 fixes to plug those leaks.\n\nWant to try it? Takes just 3 minutes.";
    }

    // Time questions
    if (lowerMessage.includes("how") && (lowerMessage.includes("long") || lowerMessage.includes("time") || lowerMessage.includes("quick"))) {
      return "Just 3 minutes! 🚀\n\nHere's what happens:\n• 7 quick multiple-choice questions\n• Instant scoring with visual dashboard\n• Detailed PDF report sent to your email\n• Optional SMS with 3 quick wins\n\nMost builders complete it while on a job site break. No forms to fill, no long essays - just click and get results.";
    }

    // Cost/pricing questions
    if (lowerMessage.includes("cost") || lowerMessage.includes("price") || lowerMessage.includes("pay") || lowerMessage.includes("free") || lowerMessage.includes("money")) {
      return "It's 100% free! 🎉\n\n✓ No credit card required\n✓ No signup or registration\n✓ No hidden catches\n✓ Instant access to your results\n\nWe built this diagnostic to help UK builders like you identify problems before they cost you thousands. The diagnostic itself is our gift to the trades community.";
    }

    // Labour/staffing issues
    if (lowerMessage.includes("labour") || lowerMessage.includes("subbie") || lowerMessage.includes("worker") || lowerMessage.includes("staff") || lowerMessage.includes("team") || lowerMessage.includes("employee")) {
      return "Labour challenges are the #1 issue facing UK builders right now. Here's what we typically see:\n\n🔴 Common Problems:\n• Subbies showing up late or not at all\n• High turnover - constant recruitment cycle\n• Poor quality work requiring rework\n• Scheduling chaos and missed deadlines\n• Good workers getting poached by competitors\n\n💰 Average Cost: £20K-£90K per year in:\n• Lost productivity\n• Emergency recruitment\n• Project delays\n• Customer complaints\n• Owner stress and overtime\n\nThe diagnostic pinpoints YOUR specific issues. Want to find out where you're bleeding money?";
    }

    // Results/report questions
    if (lowerMessage.includes("result") || lowerMessage.includes("report") || lowerMessage.includes("score") || lowerMessage.includes("get")) {
      return "After the diagnostic, you receive:\n\n📊 Instant Score Dashboard:\n• Overall health score (0-100)\n• Traffic-light breakdown across 7 areas\n• Visual charts showing problem zones\n\n📧 Email Report (arrives in 5-10 seconds):\n• Complete analysis of your pipeline\n• Labour leak projection (£ amount per year)\n• Top 3 prioritized fixes with impact estimates\n• Recovery timeline (30-120 days)\n• Specific action steps for each area\n\n📱 Optional SMS Quick Win Pack:\n• 3 immediate actions you can take today\n• £15K-£35K potential savings\n• 20 minutes or less to implement\n\nWant to see your results?";
    }

    // Help/support
    if (lowerMessage.includes("help") || lowerMessage.includes("support") || lowerMessage.includes("guide") || lowerMessage.includes("explain")) {
      return "I'm here to help! I can assist with:\n\n💬 Answering Questions:\n• Labour pipeline challenges\n• Recruitment and retention\n• Team management and culture\n• Systems and processes\n\n🎯 Taking the Diagnostic:\n• Guide you through 7 questions\n• Explain what each section measures\n• Help interpret your results\n\n📅 Booking a Call:\n• Connect with our coaching team\n• Discuss your specific challenges\n• Explore tailored solutions\n\nWhat would be most helpful right now?";
    }

    // Booking/call questions
    if (lowerMessage.includes("book") || lowerMessage.includes("call") || lowerMessage.includes("meeting") || lowerMessage.includes("schedule") || lowerMessage.includes("appointment")) {
      return "I can help you book a Scale Session call right now! 📅\n\nDuring your call, you'll:\n• Review your diagnostic results in detail\n• Identify quick wins for immediate improvement\n• Create a 90-day action plan\n• Discuss how Develop Coaching can support your growth\n\nThese calls are normally £500, but they're free for diagnostic users.\n\nReady to book? I can open our calendar for you.";
    }

    // Problem/challenge expressions
    if (lowerMessage.includes("problem") || lowerMessage.includes("issue") || lowerMessage.includes("challenge") || lowerMessage.includes("struggle") || lowerMessage.includes("difficult")) {
      return "I hear you - running a trades business isn't easy. Common pain points we see:\n\n😤 Most Frustrating Issues:\n1. Can't rely on subbies to show up\n2. Constantly recruiting and training\n3. Projects delayed due to labour gaps\n4. Spending hours per week chasing people\n5. Can't take on more work due to capacity\n\nThe good news? These are all fixable with the right systems.\n\nWould you like to take the diagnostic to see which of these are costing YOU the most money? It'll show you exactly where to focus your energy for maximum impact.";
    }

    // Industry-specific terms
    if (lowerMessage.includes("builder") || lowerMessage.includes("contractor") || lowerMessage.includes("construction") || lowerMessage.includes("trade")) {
      return "You're in the right place! The A-Team diagnostic is built specifically for UK builders and contractors.\n\n🔨 Designed By Trades Experts:\n• Created by Develop Coaching\n• 500+ UK builders have used it\n• Average savings: £45K per year\n• 90-day results timeframe\n\nWe understand your world:\n• Project-based workflow\n• Subcontractor dependencies\n• Scheduling complexity\n• Quality vs. speed trade-offs\n• Seasonal demand fluctuations\n\nThe diagnostic speaks your language and gives you practical, implementable solutions. Want to see how it works?";
    }

    // Start/begin/ready expressions
    if (lowerMessage.includes("start") || lowerMessage.includes("begin") || lowerMessage.includes("ready") || lowerMessage.includes("go") || lowerMessage.includes("yes")) {
      return "Excellent! Let's get started. 🚀\n\nI have two options for you:\n\n1️⃣ Take the 3-Minute Diagnostic\n   → Get your scores and detailed report\n   → Identify specific problem areas\n   → See exactly where you're losing money\n\n2️⃣ Book a Scale Session Call\n   → Talk directly with our team\n   → Get personalized advice\n   → Create an action plan\n\nWhich would you prefer?";
    }

    // Thank you
    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks") || lowerMessage.includes("cheers")) {
      return "You're very welcome! Happy to help. 😊\n\nIs there anything else you'd like to know about your labour pipeline, the diagnostic, or booking a call?\n\nI'm here whenever you need me.";
    }

    // Confused or negative responses
    if (lowerMessage.includes("don't know") || lowerMessage.includes("not sure") || lowerMessage.includes("maybe") || lowerMessage.includes("confused")) {
      return "No worries - let me make it simple!\n\nThink of this like a health check for your business. Just like you'd check your blood pressure to catch issues early, this diagnostic checks your labour pipeline health.\n\n💡 In 3 minutes you'll know:\n• Where you're losing money (specific £ amounts)\n• Which problems to fix first\n• How long it'll take to see improvement\n\nNo commitment, no pressure. Just clarity.\n\nWant to give it a try? Or would you prefer to ask me more questions first?";
    }

    // Default - comprehensive response
    return "That's a great question! Let me help you with that.\n\n**About the A-Team Diagnostic:**\nI'm here to help UK builders identify and fix labour pipeline issues that typically cost £20K-£90K per year.\n\n**What I Can Do:**\n• Answer questions about labour, team management, and recruitment\n• Run a 3-minute diagnostic to find your specific gaps\n• Help you book a free Scale Session call with our team\n\n**Popular Topics:**\n💬 Ask about: diagnostic, results, cost, labour issues, booking a call\n🎯 Or just say: \"Let's start\" to begin the assessment\n\nWhat would be most helpful for you right now?";
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

    // Normalize email to lowercase for consistent session lookup
    const normalizedEmail = email.trim().toLowerCase();

    // Store email in sessionStorage for phone submission later
    sessionStorage.setItem("diagnostic_email", normalizedEmail);

    // Update diagnosticData with email before sending
    const updatedDiagnosticData = {
      ...diagnosticData,
      email: normalizedEmail,
      builderName: `${firstName} ${lastName}`,
    };

    setMessages((prev) => [...prev, { role: "user", content: `${firstName} ${lastName} - ${normalizedEmail}` }]);
    submitEmailMutation.mutate({ email: normalizedEmail, firstName, lastName, diagnosticData: updatedDiagnosticData });
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');

    // Must be 10-13 digits after stripping
    if (digits.length < 10 || digits.length > 13) {
      return false;
    }

    // Valid UK phone number formats
    if (
      digits.startsWith('07') ||    // Local mobile (07xxxxxxxxx)
      digits.startsWith('447') ||   // International without + (447xxxxxxxxx)
      digits.startsWith('44')       // International (447xxxxxxxxx or 440xxxxxxxxx)
    ) {
      return true;
    }

    return false;
  };

  const normalizePhone = (phone: string): string => {
    let digits = phone.replace(/\D/g, '');

    // Convert local format to international
    if (digits.startsWith('07')) {
      digits = '44' + digits.substring(1); // 07700... → 447700...
    }

    // Ensure +44 prefix
    if (!digits.startsWith('44')) {
      digits = '44' + digits;
    }

    return digits;
  };

  const handlePhoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const countryCode = formData.get("countryCode") as string;
    const phoneNumber = formData.get("phone") as string;

    // Guard 1: Phone is required
    if (!phoneNumber || phoneNumber.trim() === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a phone number",
      });
      return;
    }

    // Combine country code + phone for validation
    const fullPhone = countryCode + phoneNumber;

    // Guard 2: Validate phone number format
    if (!validatePhoneNumber(fullPhone)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (e.g., 7700 900000)",
      });
      return;
    }

    // Guard 3: Email must be available (stored during email submission)
    const storedEmail = sessionStorage.getItem("diagnostic_email");
    if (!storedEmail) {
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Please complete the email step first",
      });
      return;
    }

    // Normalize phone to consistent format (44xxxxxxxxxx)
    const normalizedPhone = normalizePhone(fullPhone);

    // Display formatted phone in chat (with country code prefix)
    const displayPhone = `+${countryCode} ${phoneNumber}`;

    setMessages((prev) => [...prev, { role: "user", content: displayPhone }]);
    submitPhoneMutation.mutate({
      phone: normalizedPhone,
      email: storedEmail,
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
      {!embedded && (
        <div className="mb-8">
          {onBack && (
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
          )}
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
      )}

      {/* Progress Bar for Embedded Mode - Only show when in diagnostic */}
      {embedded && inDiagnosticMode && currentStep > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 font-medium">Diagnostic Progress</span>
            <Badge className="bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue text-white px-3 py-1 text-xs font-semibold">
              {currentStep}/7
            </Badge>
          </div>
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }} />
          </div>
        </div>
      )}

      {/* Chat Container */}
      <Card className={`p-6 min-h-[600px] flex flex-col shadow-2xl ${embedded ? 'border-brand-vivid-blue/30 bg-white/95 backdrop-blur-sm' : 'border-brand-vivid-blue/20 bg-gradient-to-b from-white to-gray-50'}`}>
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
                    : embedded || true
                      ? "bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-brand-vivid-blue/20 shadow-md"
                      : "bg-white border-2 border-brand-soft-grey"
                }`}
                data-testid={`message-${message.role}-${index}`}
              >
                {/* AI Icon for assistant messages */}
                {message.role === "assistant" && (
                  <div className={`flex items-center gap-2 mb-3 pb-3 border-b ${embedded ? 'border-gray-200' : 'border-brand-soft-grey'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-vivid-blue to-brand-sky-blue flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-charcoal">A-Team Assistant</span>
                  </div>
                )}
                <p className={`text-base leading-relaxed whitespace-pre-line ${message.role === "user" ? "text-white" : "text-gray-800"}`}>
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
                  <div className="mt-6 space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-brand-dark-navy font-bold text-lg mb-2">WANT TO GO DEEPER?</p>
                      <p className="text-gray-600 text-sm">Enter your email to get a detailed report</p>
                    </div>
                    <form onSubmit={handleEmailSubmit} className="space-y-4 bg-gradient-to-br from-brand-soft-grey/30 to-white p-6 rounded-xl border-2 border-brand-vivid-blue/10">
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
                            SEND ME MY DETAILED PDF REPORT
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                )}

                {message.widget === "phone-form" && (
                  <div className="mt-6 space-y-4 bg-gradient-to-br from-brand-soft-grey/30 to-white p-6 rounded-xl border-2 border-brand-sky-blue/20">
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <div>
                        <Label className="text-brand-charcoal font-semibold text-sm">
                          Mobile Number
                        </Label>
                        <div className="flex gap-2 mt-2">
                          {/* Country Code Selector */}
                          <div className="flex-shrink-0">
                            <select
                              name="countryCode"
                              defaultValue="44"
                              className="w-24 px-3 py-2 border-2 border-brand-soft-grey rounded-lg focus:border-brand-vivid-blue focus:ring-2 focus:ring-brand-vivid-blue/20 transition-colors font-semibold text-sm"
                              data-testid="select-country-code"
                            >
                              <option value="44">🇬🇧 +44</option>
                              <option value="1">🇺🇸 +1</option>
                              <option value="353">🇮🇪 +353</option>
                              <option value="61">🇦🇺 +61</option>
                              <option value="64">🇳🇿 +64</option>
                              <option value="27">🇿🇦 +27</option>
                              <option value="1-876">🇯🇲 +1-876</option>
                              <option value="33">🇫🇷 +33</option>
                              <option value="49">🇩🇪 +49</option>
                            </select>
                          </div>

                          {/* Phone Number Input */}
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="7700 900000"
                            className="flex-1 border-2 border-brand-soft-grey focus:border-brand-vivid-blue transition-colors"
                            data-testid="input-phone"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter number without country code (e.g., 7700 900000)</p>
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

                {message.widget === "start-button" && (
                  <div className="mt-6">
                    <Button
                      onClick={() => {
                        setCurrentStep(1);
                        setInDiagnosticMode(true);
                        setMessages((prev) => [
                          ...prev,
                          { role: "user", content: "Let's start!" },
                          {
                            role: "assistant",
                            content: `Question ${DIAGNOSTIC_QUESTIONS[0].id}: ${DIAGNOSTIC_QUESTIONS[0].question}`,
                            widget: "question-options",
                            data: DIAGNOSTIC_QUESTIONS[0].options,
                          },
                        ]);
                      }}
                      className="w-full bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue hover:from-brand-vivid-blue/90 hover:to-brand-sky-blue/90 text-white font-bold py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                      data-testid="button-start-diagnostic"
                    >
                      <Zap className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                      Start Diagnostic
                      <Sparkles className="h-6 w-6 ml-3 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </div>
                )}

                {message.widget === "skip-continue" && (
                  <div className="mt-6 space-y-3">
                    {/* Primary CTA - Book Calendar */}
                    <Button
                      onClick={() => {
                        onBookingClick?.();
                        setMessages((prev) => [
                          ...prev,
                          { role: "user", content: "Yes, I'm ready to scale!" },
                        ]);
                      }}
                      className="w-full bg-gradient-to-r from-brand-vivid-blue to-brand-sky-blue hover:from-brand-vivid-blue/90 hover:to-brand-sky-blue/90 text-white font-bold py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                      data-testid="button-ready-to-scale"
                    >
                      <Target className="h-6 w-6 mr-2 group-hover:rotate-12 transition-transform" />
                      Yes, I'm Ready to Scale - Book Now
                      <Sparkles className="h-6 w-6 ml-2 group-hover:rotate-12 transition-transform" />
                    </Button>

                    {/* Secondary CTA - Start Diagnostic */}
                    <Button
                      onClick={() => {
                        setCurrentStep(1);
                        setInDiagnosticMode(true);
                        setMessages((prev) => [
                          ...prev,
                          { role: "user", content: "I'd like to take the diagnostic first" },
                          {
                            role: "assistant",
                            content: `Great choice! This will help us identify your specific challenges.\n\nQuestion ${DIAGNOSTIC_QUESTIONS[0].id}: ${DIAGNOSTIC_QUESTIONS[0].question}`,
                            widget: "question-options",
                            data: DIAGNOSTIC_QUESTIONS[0].options,
                          },
                        ]);
                      }}
                      className="w-full border-2 border-brand-vivid-blue bg-brand-vivid-blue hover:bg-brand-vivid-blue/90 text-white font-bold py-5 text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      data-testid="button-start-diagnostic"
                    >
                      <Zap className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Take the 3-Minute Diagnostic First
                    </Button>

                    {/* Tertiary Option - Continue Chatting */}
                    <Button
                      onClick={() => {
                        setMessages((prev) => [
                          ...prev,
                          { role: "user", content: "I'd like to continue chatting" },
                          {
                            role: "assistant",
                            content: "Perfect! I'm here to help. Ask me anything about your labour pipeline, recruitment challenges, team management, or how the diagnostic works. What would you like to know?",
                          },
                        ]);
                      }}
                      variant="ghost"
                      className="w-full text-white hover:text-white hover:bg-white/15 font-medium py-4 text-sm transition-all duration-300 underline underline-offset-2 opacity-80 hover:opacity-100"
                      data-testid="button-skip-continue"
                    >
                      Skip — Continue Chatting
                    </Button>
                  </div>
                )}

                {message.widget === "cta-button" && message.data && (
                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={() => onBookingClick?.()}
                      className="w-full bg-gradient-to-r from-brand-sky-blue to-brand-vivid-blue hover:from-brand-sky-blue/90 hover:to-brand-vivid-blue/90 text-white font-bold py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                      data-testid="button-cta"
                    >
                      <Sparkles className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform" />
                      {message.data.label}
                      <Zap className="h-6 w-6 ml-3 group-hover:rotate-12 transition-transform" />
                    </Button>

                    {/* Continue Chat Option */}
                    <Button
                      onClick={() => {
                        setMessages((prev) => [
                          ...prev,
                          { role: "user", content: "I'd like to keep chatting for now" },
                          {
                            role: "assistant",
                            content: "Perfect! I'm here to help with any other questions about your labour pipeline, recruitment, team management, or how to implement your fixes. What else would you like to know?",
                          },
                        ]);
                      }}
                      variant="outline"
                      className="w-full border-2 border-brand-vivid-blue/40 hover:border-brand-vivid-blue hover:bg-brand-vivid-blue/10 text-gray-700 font-semibold py-5 text-base transition-all duration-300"
                      data-testid="button-continue-chat-after-cta"
                    >
                      Continue Chatting Instead
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className={`max-w-[85%] rounded-2xl p-5 shadow-lg animate-pulse ${embedded ? 'bg-white/95 backdrop-blur-md border-2 border-white/30' : 'bg-white border-2 border-brand-soft-grey'}`}>
                <div className={`flex items-center gap-2 mb-3 pb-3 border-b ${embedded ? 'border-gray-200' : 'border-brand-soft-grey'}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-vivid-blue to-brand-sky-blue flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-charcoal">Analyzing...</span>
                </div>
                <div className="h-4 w-64 rounded mb-2 bg-gray-200"></div>
                <div className="h-4 w-48 rounded bg-gray-100"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input - Always available for conversation or diagnostic */}
        {/* Show input if: not in diagnostic mode OR if user clicked "Continue Chatting" */}
        {(!diagnosticData || messages.some((m) => m.content.includes("keep chatting"))) && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 mt-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                inDiagnosticMode && currentStep > 0
                  ? "Type your answer or choose above..."
                  : "Ask me anything about your labour pipeline..."
              }
              disabled={isLoading}
              className={`flex-1 ${embedded ? 'bg-white border-2 border-white/50 text-gray-900 placeholder:text-gray-500 focus:border-brand-vivid-blue focus:ring-2 focus:ring-brand-vivid-blue/20' : 'border-2'}`}
              data-testid="input-chat"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={embedded ? 'bg-brand-vivid-blue hover:bg-brand-vivid-blue/90' : ''}
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

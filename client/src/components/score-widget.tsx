import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import type { PdfReportData } from "@shared/schema";

interface ScoreWidgetProps {
  data: PdfReportData;
}

export default function ScoreWidget({ data }: ScoreWidgetProps) {
  const getColorClass = (color: "red" | "amber" | "green") => {
    switch (color) {
      case "green":
        return "text-traffic-green";
      case "amber":
        return "text-traffic-amber";
      case "red":
        return "text-traffic-red";
    }
  };

  const getIcon = (color: "red" | "amber" | "green") => {
    switch (color) {
      case "green":
        return <CheckCircle2 className="h-6 w-6" />;
      case "amber":
        return <AlertCircle className="h-6 w-6" />;
      case "red":
        return <XCircle className="h-6 w-6" />;
    }
  };

  const getBgClass = (color: "red" | "amber" | "green") => {
    switch (color) {
      case "green":
        return "bg-traffic-green/10 border-traffic-green/20";
      case "amber":
        return "bg-traffic-amber/10 border-traffic-amber/20";
      case "red":
        return "bg-traffic-red/10 border-traffic-red/20";
    }
  };

  return (
    <div className="space-y-4 bg-background rounded-lg p-4">
      {/* Overall Score */}
      <Card className={`p-6 ${getBgClass(data.scoreColor)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">Overall Score</h3>
            <p className="text-sm text-muted-foreground">
              Your labour pipeline health rating
            </p>
          </div>
          <div className={`text-6xl font-bold ${getColorClass(data.scoreColor)}`}>
            {data.overallScore}
          </div>
        </div>
        <Progress value={data.overallScore} className="h-3" />
        <div className="flex items-center gap-2 mt-4">
          <span className={getColorClass(data.scoreColor)}>{getIcon(data.scoreColor)}</span>
          <span className="text-sm font-medium">
            {data.scoreColor === "green" && "Excellent - Minor improvements needed"}
            {data.scoreColor === "amber" && "Moderate - Significant leaks detected"}
            {data.scoreColor === "red" && "Critical - Major labour issues"}
          </span>
        </div>
      </Card>

      {/* Section Breakdown */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Section Scores
        </h4>

        {Object.entries(data.sectionScores).map(([key, section]) => (
          <Card key={key} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={getColorClass(section.color)}>{getIcon(section.color)}</span>
                <span className="font-medium text-sm capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </div>
              <Badge variant="secondary" className={getColorClass(section.color)}>
                {section.score}/10
              </Badge>
            </div>
            <Progress value={section.score * 10} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">{section.commentary}</p>
          </Card>
        ))}
      </div>

      {/* Labour Leak Projection */}
      <Card className="p-6 bg-destructive/5 border-destructive/20">
        <div className="flex items-start gap-3">
          <TrendingDown className="h-8 w-8 text-destructive flex-shrink-0" />
          <div>
            <h4 className="font-semibold mb-2">Estimated Annual Labour Leak</h4>
            <p className="text-2xl font-bold text-destructive mb-2">
              {data.labourLeakProjection.annualLeak}
            </p>
            <p className="text-sm text-muted-foreground">
              Based on your responses, you're likely losing this much per year through labour
              inefficiencies, delays, and unreliability.
            </p>
          </div>
        </div>
      </Card>

      {/* Top Recommendation */}
      {data.topRecommendations[0] && (
        <Card className="p-6 bg-traffic-green/5 border-traffic-green/20">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-8 w-8 text-traffic-green flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">#1 Quick Win</h4>
              <p className="font-medium mb-1">{data.topRecommendations[0].title}</p>
              <p className="text-sm text-muted-foreground mb-2">
                {data.topRecommendations[0].explanation}
              </p>
              <Badge variant="outline" className="text-traffic-green border-traffic-green">
                Potential Impact: {data.topRecommendations[0].impact}
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

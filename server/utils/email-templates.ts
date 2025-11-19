// Beautiful HTML email templates for A-Team Trades Pipeline reports
import type { PdfReportData } from "@shared/schema";

// Brand colors
const BRAND_DARK_NAVY = "#0A1A2F";
const BRAND_VIVID_BLUE = "#005CFF";
const BRAND_SKY_BLUE = "#62B6FF";
const BRAND_SOFT_GREY = "#F5F6F8";
const BRAND_CHARCOAL = "#2C3E50";

export function generateReportEmailHTML(reportData: PdfReportData): string {
  const scoreColorMap = {
    green: { bg: "#10B981", text: "EXCELLENT - Strong Pipeline" },
    amber: { bg: "#F59E0B", text: "MODERATE RISK - Room for Improvement" },
    red: { bg: "#EF4444", text: "CRITICAL - Immediate Action Needed" },
  };

  const scoreInfo = scoreColorMap[reportData.scoreColor];

  const sectionColorMap = {
    green: "#10B981",
    amber: "#F59E0B",
    red: "#EF4444",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your A-Team Trades Pipeline™ Report</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: ${BRAND_SOFT_GREY};
      color: ${BRAND_CHARCOAL};
      line-height: 1.6;
    }
    .container {
      max-width: 680px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, ${BRAND_DARK_NAVY} 0%, ${BRAND_VIVID_BLUE} 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: ${BRAND_DARK_NAVY};
      margin-bottom: 20px;
    }
    .score-box {
      background: linear-gradient(135deg, ${scoreInfo.bg} 0%, ${scoreInfo.bg}dd 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin: 30px 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .score-number {
      font-size: 72px;
      font-weight: 800;
      line-height: 1;
      margin: 0 0 10px 0;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    .score-label {
      font-size: 20px;
      font-weight: 600;
      opacity: 0.95;
      margin: 0;
    }
    .score-status {
      font-size: 16px;
      font-weight: 600;
      margin-top: 15px;
      padding: 10px 20px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      display: inline-block;
    }
    .section-title {
      color: ${BRAND_DARK_NAVY};
      font-size: 24px;
      font-weight: 700;
      margin: 40px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 3px solid ${BRAND_VIVID_BLUE};
    }
    .section-item {
      background-color: ${BRAND_SOFT_GREY};
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #ddd;
    }
    .section-item.red { border-left-color: #EF4444; }
    .section-item.amber { border-left-color: #F59E0B; }
    .section-item.green { border-left-color: #10B981; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .section-name {
      font-size: 18px;
      font-weight: 700;
      color: ${BRAND_DARK_NAVY};
    }
    .section-score {
      font-size: 24px;
      font-weight: 800;
      padding: 5px 15px;
      border-radius: 20px;
      color: white;
    }
    .section-score.red { background-color: #EF4444; }
    .section-score.amber { background-color: #F59E0B; }
    .section-score.green { background-color: #10B981; }
    .section-commentary {
      font-size: 15px;
      color: #555;
      line-height: 1.5;
    }
    .priority-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      margin-top: 8px;
    }
    .priority-badge.red {
      background-color: #FEE2E2;
      color: #991B1B;
    }
    .priority-badge.amber {
      background-color: #FEF3C7;
      color: #92400E;
    }
    .priority-badge.green {
      background-color: #D1FAE5;
      color: #065F46;
    }
    .recommendation-box {
      background-color: #ffffff;
      border: 2px solid ${BRAND_VIVID_BLUE};
      border-radius: 10px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0, 92, 255, 0.1);
    }
    .recommendation-number {
      display: inline-block;
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, ${BRAND_VIVID_BLUE} 0%, ${BRAND_SKY_BLUE} 100%);
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 36px;
      font-weight: 800;
      font-size: 18px;
      margin-right: 12px;
    }
    .recommendation-title {
      font-size: 20px;
      font-weight: 700;
      color: ${BRAND_DARK_NAVY};
      margin-bottom: 12px;
    }
    .recommendation-text {
      font-size: 15px;
      color: #555;
      margin-bottom: 12px;
      line-height: 1.6;
    }
    .recommendation-impact {
      background-color: #FEF3C7;
      color: #92400E;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      display: inline-block;
    }
    .leak-box {
      background: linear-gradient(135deg, #FEE2E2 0%, #FEF3C7 100%);
      padding: 25px;
      border-radius: 10px;
      margin: 30px 0;
      border-left: 6px solid #EF4444;
    }
    .leak-title {
      font-size: 22px;
      font-weight: 700;
      color: #991B1B;
      margin: 0 0 15px 0;
    }
    .leak-amount {
      font-size: 36px;
      font-weight: 800;
      color: #DC2626;
      margin: 10px 0;
    }
    .leak-list {
      list-style: none;
      padding: 0;
      margin: 15px 0;
    }
    .leak-list li {
      padding: 8px 0 8px 28px;
      position: relative;
      color: #555;
    }
    .leak-list li:before {
      content: "⚠️";
      position: absolute;
      left: 0;
    }
    .recovery-box {
      background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
      border-left: 6px solid #10B981;
    }
    .recovery-text {
      font-size: 16px;
      font-weight: 600;
      color: #065F46;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      padding: 18px 40px;
      background: linear-gradient(135deg, ${BRAND_VIVID_BLUE} 0%, ${BRAND_SKY_BLUE} 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 18px;
      text-align: center;
      margin: 20px 0;
      box-shadow: 0 4px 20px rgba(0, 92, 255, 0.3);
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(0, 92, 255, 0.4);
    }
    .cta-section {
      text-align: center;
      padding: 40px 30px;
      background-color: ${BRAND_SOFT_GREY};
      margin: 40px -30px 0 -30px;
    }
    .cta-headline {
      font-size: 26px;
      font-weight: 700;
      color: ${BRAND_DARK_NAVY};
      margin: 0 0 15px 0;
    }
    .cta-subtext {
      font-size: 16px;
      color: #555;
      margin: 0 0 25px 0;
    }
    .footer {
      background-color: ${BRAND_DARK_NAVY};
      color: white;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
      opacity: 0.8;
    }
    .footer a {
      color: ${BRAND_SKY_BLUE};
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .header h1 { font-size: 24px; }
      .score-number { font-size: 56px; }
      .section-title { font-size: 20px; }
      .content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🏗️ A-Team Trades Pipeline™ Report</h1>
      <p>Your Personalised Labour Pipeline Diagnostic</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting"><strong>Hi ${reportData.builderName || "Builder"},</strong></p>
      <p>Thank you for completing the A-Team Trades Pipeline™ diagnostic. Here's your personalised report showing exactly where your labour pipeline is leaking money and how to fix it.</p>

      <!-- Overall Score -->
      <div class="score-box">
        <div class="score-number">${reportData.overallScore}<span style="font-size: 48px;">/100</span></div>
        <p class="score-label">Your Overall Pipeline Score</p>
        <div class="score-status">${scoreInfo.text}</div>
      </div>

      <!-- Executive Summary -->
      <h2 class="section-title">📊 What This Means For Your Business</h2>
      <p>${
        reportData.scoreColor === "green"
          ? "Your labour pipeline is in good health. You have strong systems in place, but there are still opportunities to optimise and save money. Focus on the improvement areas highlighted below to take your pipeline from good to excellent."
          : reportData.scoreColor === "amber"
            ? "Your pipeline shows moderate risk. You're not in crisis mode, but there are clear gaps costing you time and money. The good news? These are fixable problems with straightforward solutions that can save you £20K-£50K annually."
            : "Your pipeline requires immediate attention. The gaps we've identified are likely costing you serious money through unreliable labour, project delays, and constant firefighting. But don't worry - we'll show you exactly how to fix it."
      }</p>

      <!-- Section Breakdown -->
      <h2 class="section-title">🔍 Your Score Breakdown</h2>
      ${Object.entries(reportData.sectionScores)
        .map(
          ([key, section]) => `
      <div class="section-item ${section.color}">
        <div class="section-header">
          <div class="section-name">${formatSectionName(key)}</div>
          <div class="section-score ${section.color}">${section.score}/10</div>
        </div>
        <div class="section-commentary">${section.commentary}</div>
        <div class="priority-badge ${section.color}">
          ${
            section.color === "red"
              ? "⚠️ Priority Area"
              : section.color === "amber"
                ? "⚡ Improvement Opportunity"
                : "✅ Strength"
          }
        </div>
      </div>
      `
        )
        .join("")}

      <!-- Top Recommendations -->
      <h2 class="section-title">💡 Your Top 3 Fixes (Prioritised by Impact)</h2>
      ${reportData.topRecommendations
        .map(
          (rec, i) => `
      <div class="recommendation-box">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <span class="recommendation-number">${i + 1}</span>
          <span class="recommendation-title">${rec.title}</span>
        </div>
        <p class="recommendation-text">${rec.explanation}</p>
        <div class="recommendation-impact">💰 Potential Savings: ${rec.impact}</div>
      </div>
      `
        )
        .join("")}

      <!-- Labour Leak Projection -->
      <div class="leak-box">
        <h3 class="leak-title">⚠️ Your Estimated Labour Leak</h3>
        <div class="leak-amount">${reportData.labourLeakProjection.annualLeak} per year</div>
        <p style="font-size: 15px; color: #555; margin: 10px 0;">Without fixing these pipeline gaps, you're losing money through:</p>
        <ul class="leak-list">
          <li>No-shows and last-minute cancellations causing project delays</li>
          <li>Paying premium rates for emergency labour</li>
          <li>Time wasted chasing and managing unreliable subbies</li>
          <li>Projects running over budget due to labour issues</li>
          <li>Lost opportunities because you can't scale reliably</li>
        </ul>
        <div class="recovery-box">
          <p class="recovery-text">✅ By implementing the fixes above, you could recover <strong>${reportData.labourLeakProjection.improvementRange}</strong> within the next <strong>${reportData.labourLeakProjection.timeHorizon}</strong>.</p>
        </div>
      </div>

      <!-- Call to Action Section -->
      <div class="cta-section">
        <h3 class="cta-headline">🚀 Want Help Fixing Your Labour Pipeline?</h3>
        <p class="cta-subtext">Book a free Scale Session call with our team. We'll analyse your specific situation and create a custom action plan to plug your labour leaks.</p>
        <a href="https://developcoaching.co.uk/schedule-a-call?utm_source=diagnostic&utm_medium=email&utm_campaign=pipeline-report" class="cta-button">📞 Book My Free Scale Session</a>
        <p style="font-size: 14px; color: #666; margin-top: 15px;">No sales pitch. No BS. Just practical advice from people who understand UK trades businesses.</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Develop Coaching</strong></p>
      <p>Helping UK Builders Scale Profitably</p>
      <p style="margin-top: 15px; font-size: 12px;">
        <a href="https://developcoaching.co.uk">Visit Our Website</a> |
        <a href="mailto:greg@develop-coaching.com">Contact Us</a>
      </p>
      <p style="margin-top: 15px; font-size: 11px; opacity: 0.6;">
        © ${new Date().getFullYear()} Develop Coaching. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function formatSectionName(key: string): string {
  const nameMap: Record<string, string> = {
    tradingCapacity: "Trading Capacity",
    reliability: "Labour Reliability",
    recruitment: "Recruitment Pipeline",
    systems: "Management Systems",
    profitability: "Labour Profitability",
    onboarding: "Onboarding Process",
    culture: "Team Culture & Morale",
  };
  return nameMap[key] || key.replace(/([A-Z])/g, " $1").trim();
}

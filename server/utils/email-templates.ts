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
      <h2 class="section-title">🔍 Your Score Breakdown & Actionable Insights</h2>
      ${Object.entries(reportData.sectionScores)
        .map(
          ([key, section]) => `
      <div class="section-item ${section.color}">
        <div class="section-header">
          <div class="section-name">${formatSectionName(key)}</div>
          <div class="section-score ${section.color}">${section.score}/10</div>
        </div>
        <div class="section-commentary" style="margin-bottom: 12px;">${section.commentary}</div>
        <div style="background-color: ${section.color === 'red' ? '#FEF2F2' : section.color === 'amber' ? '#FFFBEB' : '#F0FDF4'}; padding: 12px 15px; border-radius: 6px; margin-bottom: 10px; font-size: 14px; line-height: 1.6;">
          ${getImprovementInsights(key, section.color as "red" | "amber" | "green")}
        </div>
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

function getImprovementInsights(sectionKey: string, color: "red" | "amber" | "green"): string {
  const insights: Record<string, Record<string, string>> = {
    tradingCapacity: {
      red: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #DC2626; font-size: 15px;">🚨 Critical Issue: You're likely losing £15K-£30K annually from poor capacity management</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Problem:</strong> Without visibility into your workload, you're either turning away profitable work or overcommitting and burning out your team. Both cost you money.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Your 3-Step Fix:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Week 1:</strong> Create a simple capacity spreadsheet. List every active project, estimated hours remaining, and team members assigned. Do this TODAY.</li>
            <li style="margin-bottom: 8px;"><strong>Week 2:</strong> Start tracking actual hours vs estimated. This reveals which job types eat your capacity and which are profitable.</li>
            <li style="margin-bottom: 8px;"><strong>Week 3:</strong> Implement a "2-week look-ahead" review every Monday. Spot gaps before they become emergencies.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Builders who implement this typically recover 15-20% of lost capacity within 90 days - that's £10K-£20K in found revenue.
        </div>`,
      amber: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #D97706; font-size: 15px;">⚡ Optimisation Opportunity: You're leaving £8K-£15K on the table</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Where You Are:</strong> You have some visibility, but inconsistent tracking means you're still missing opportunities or overcommitting occasionally.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Level Up Your Capacity Management:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Add buffer days:</strong> Block out 2 "flex days" per week for overruns. This prevents the panic hiring that costs 20-30% more.</li>
            <li style="margin-bottom: 8px;"><strong>Score your projects:</strong> Rate jobs 1-5 on profitability. Focus your best capacity on 4-5 rated work.</li>
            <li style="margin-bottom: 8px;"><strong>Forecast 8 weeks out:</strong> Longer visibility lets you land bigger, more profitable projects instead of scrambling for filler work.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Moving from reactive to proactive capacity planning typically adds 10-15% to annual profits.
        </div>`,
      green: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #059669; font-size: 15px;">✅ Strength: Your capacity management is above average</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Keep Building:</strong> You've got the foundation right. Here's how to turn this into a major competitive advantage.
        </div>
        <div style="background: #fff; border-left: 3px solid #059669; padding: 12px; margin: 12px 0;">
          <strong style="color: #059669;">Advanced Strategies:</strong>
          <ul style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Utilisation targets:</strong> Aim for 75-80% capacity utilisation. Higher means no flexibility; lower means wasted resources.</li>
            <li style="margin-bottom: 8px;"><strong>Premium pricing windows:</strong> When you're at 80%+ capacity, quote 15% higher. The right clients will wait.</li>
            <li style="margin-bottom: 8px;"><strong>Quarterly reviews:</strong> Analyse which project types give best return on capacity. Double down on winners.</li>
          </ul>
        </div>`
    },
    reliability: {
      red: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #DC2626; font-size: 15px;">🚨 Critical Issue: Unreliable subbies are likely costing you £25K-£50K annually</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Real Cost:</strong> Every no-show costs you: emergency replacement (20-40% premium), project delays (client penalties/reputation), and YOUR time managing the chaos (worth £50-100/hour).
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">The A-Team Reliability System:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Create a Reliability Scorecard:</strong> Rate each subbie 1-10 on: punctuality, quality, communication. Anyone below 6 goes to the bottom of your call list.</li>
            <li style="margin-bottom: 8px;"><strong>Implement the 3-Strike Rule:</strong> Late once = warning. Twice = last chance. Three times = you're done working with them. Be consistent.</li>
            <li style="margin-bottom: 8px;"><strong>Build Backup Depth:</strong> For every trade, have 3 reliable contacts. Never be held hostage by one unreliable person.</li>
            <li style="margin-bottom: 8px;"><strong>Pre-Work Confirmation:</strong> Text 48 hours before AND morning of. "Looking forward to seeing you at [site] at [time]. Any issues, call me now." This catches problems early.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Builders who implement this system typically reduce no-shows by 70% within 60 days and save 5-10 hours per week in crisis management.
        </div>`,
      amber: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #D97706; font-size: 15px;">⚡ Improvement Needed: You're probably losing £10K-£20K to reliability issues</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Pattern:</strong> You have some reliable people, but also some wildcards. The wildcards are costing you more than you realise.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Upgrade Your Subbie Relationships:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Identify your A-Team:</strong> Who are your top 5 most reliable subbies? These are gold - protect these relationships at all costs.</li>
            <li style="margin-bottom: 8px;"><strong>Pre-agree consequences:</strong> "If you no-show, it's 10% off your next job." Put it in writing. Professionals respect clear expectations.</li>
            <li style="margin-bottom: 8px;"><strong>Invest in your best:</strong> Pay your A-players slightly above market rate. The premium is nothing compared to the cost of unreliability.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Focusing on your best relationships while cutting the unreliable ones typically improves overall reliability by 40-50%.
        </div>`,
      green: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #059669; font-size: 15px;">✅ Strength: Reliable labour is your competitive advantage</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Lock It In:</strong> Reliable subbies are worth their weight in gold. Here's how to keep them loyal.
        </div>
        <div style="background: #fff; border-left: 3px solid #059669; padding: 12px; margin: 12px 0;">
          <strong style="color: #059669;">Retention Strategies:</strong>
          <ul style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Quarterly catch-ups:</strong> Coffee or lunch with your top 5. Ask what's working, what could be better. They'll tell you things they wouldn't otherwise.</li>
            <li style="margin-bottom: 8px;"><strong>Reliability bonuses:</strong> £100-£200 bonus for 100% attendance over 3 months. Small cost, massive loyalty.</li>
            <li style="margin-bottom: 8px;"><strong>Preferred scheduling:</strong> Give your best subbies first pick of jobs. They'll prioritise you over competitors.</li>
          </ul>
        </div>`
    },
    recruitment: {
      red: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #DC2626; font-size: 15px;">🚨 Critical Issue: Poor recruitment is capping your growth and costing £20K-£40K in lost opportunities</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Hidden Cost:</strong> Every job you turn away because you can't find labour is money lost. Every desperate hire that doesn't work out costs 3-6 months of their wages to fix.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Build Your Talent Pipeline:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Always Be Recruiting:</strong> Post on Rated People, MyBuilder, and local Facebook trade groups WEEKLY - even when you're not hiring. Build a list of potentials.</li>
            <li style="margin-bottom: 8px;"><strong>Create a "Talent Bank" Spreadsheet:</strong> Every tradesperson you meet who seems decent, add them. Name, trade, contact, notes. This is your recruitment goldmine.</li>
            <li style="margin-bottom: 8px;"><strong>Trial Paid Work:</strong> Before committing to anyone long-term, give them a 2-3 day paid trial on a smaller job. Observe quality, punctuality, attitude.</li>
            <li style="margin-bottom: 8px;"><strong>Ask for Referrals:</strong> Your best subbies know other good tradespeople. "Know anyone reliable looking for work?" Pay £100 referral bonus for successful hires.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Builders with active recruitment pipelines typically fill positions 50% faster and make 30% fewer bad hires.
        </div>`,
      amber: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #D97706; font-size: 15px;">⚡ Improvement Needed: Inconsistent recruitment is limiting your growth</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Pattern:</strong> You find people eventually, but it's stressful, takes too long, and sometimes you compromise on quality because you need someone NOW.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Systematise Your Recruitment:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Monthly pipeline review:</strong> Every first Monday, review your talent bank. Reach out to 3 potentials - even if you don't need them yet.</li>
            <li style="margin-bottom: 8px;"><strong>Standard interview questions:</strong> Create 5 questions you always ask. Consistency helps you compare candidates fairly.</li>
            <li style="margin-bottom: 8px;"><strong>Reference checks:</strong> Always call their last 2 employers. Takes 10 minutes, saves months of problems.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Moving from reactive to proactive recruitment typically cuts time-to-fill by 40% and improves hire quality.
        </div>`,
      green: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #059669; font-size: 15px;">✅ Strength: Strong recruitment capability enables growth</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Scale It Up:</strong> You can find people - now let's make your company the place everyone WANTS to work.
        </div>
        <div style="background: #fff; border-left: 3px solid #059669; padding: 12px; margin: 12px 0;">
          <strong style="color: #059669;">Become an Employer of Choice:</strong>
          <ul style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Reputation building:</strong> Word spreads fast in trades. Fast payments, fair rates, good communication = top talent seeks YOU out.</li>
            <li style="margin-bottom: 8px;"><strong>Training investment:</strong> Offer to upskill your subbies (courses, certifications). They become more valuable AND more loyal.</li>
            <li style="margin-bottom: 8px;"><strong>Exclusive relationships:</strong> Offer your best subbies guaranteed minimum hours in exchange for first refusal on their time.</li>
          </ul>
        </div>`
    },
    systems: {
      red: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #DC2626; font-size: 15px;">🚨 Critical Issue: Lack of systems is costing you 10-15 hours per week and £15K+ annually</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Reality Check:</strong> If you're relying on memory, paper notes, and WhatsApp chaos, you're wasting hours every day on things that should be automatic.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">The Minimum Viable System (Start Here):</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Week 1 - One Calendar:</strong> Put ALL jobs in Google Calendar (free). Share with your team. No more double-bookings or forgotten appointments.</li>
            <li style="margin-bottom: 8px;"><strong>Week 2 - One Contact List:</strong> Every subbie and supplier in one spreadsheet or app. No more searching through messages.</li>
            <li style="margin-bottom: 8px;"><strong>Week 3 - One Job Tracker:</strong> Simple spreadsheet: Job name, status, start date, team assigned, completion %. Review weekly.</li>
            <li style="margin-bottom: 8px;"><strong>Week 4 - Daily Routine:</strong> 10 minutes every morning reviewing today's plan. 10 minutes every evening updating tomorrow. This prevents 90% of chaos.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Basic systems typically save 5-10 hours per week immediately. That's 250-500 hours per year - worth £12,500-£25,000 of your time.
        </div>`,
      amber: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #D97706; font-size: 15px;">⚡ Improvement Needed: Inconsistent systems are causing preventable problems</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Where You Are:</strong> You have some systems, but they're not followed consistently or they don't talk to each other. This creates gaps where things fall through.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Upgrade Your Systems:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Pick ONE focus:</strong> Don't try to fix everything at once. Choose the biggest pain point (scheduling? invoicing? communication?) and fix that first.</li>
            <li style="margin-bottom: 8px;"><strong>30-day commitment:</strong> Use the new system consistently for 30 days before adding anything else. Habits need time to stick.</li>
            <li style="margin-bottom: 8px;"><strong>Simple checklists:</strong> Create 1-page checklists for recurring tasks (job setup, completion, invoicing). Reduces errors by 80%.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Consistent systems typically reduce administrative time by 30-40% and cut errors by half.
        </div>`,
      green: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #059669; font-size: 15px;">✅ Strength: Good systems give you control and scalability</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Level Up:</strong> Your systems work. Now let's automate and optimise.
        </div>
        <div style="background: #fff; border-left: 3px solid #059669; padding: 12px; margin: 12px 0;">
          <strong style="color: #059669;">Advanced System Strategies:</strong>
          <ul style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Automation:</strong> Look for tools that auto-send reminders, generate reports, or trigger follow-ups. Every automated task is time saved.</li>
            <li style="margin-bottom: 8px;"><strong>Integration:</strong> Connect your calendar, job tracker, and invoicing. Data should flow, not be re-entered.</li>
            <li style="margin-bottom: 8px;"><strong>Annual audit:</strong> Review your tech stack yearly. Better tools emerge constantly. Don't stay with something just because "it's always been that way."</li>
          </ul>
        </div>`
    },
    profitability: {
      red: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #DC2626; font-size: 15px;">🚨 Critical Issue: Labour inefficiency is eating 15-25% of your potential profit</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Hidden Drain:</strong> If you're spending 15+ hours per week on labour issues, that's £30K-£50K of your time annually. Add in premium rates for emergency cover, rework, and project delays - you're probably losing £40K-£70K that should be profit.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Reclaim Your Profit:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Track the true cost:</strong> For your next 3 jobs, log EVERY hour spent on labour problems (chasing subbies, covering no-shows, fixing quality issues). You'll be shocked.</li>
            <li style="margin-bottom: 8px;"><strong>Calculate your hourly rate:</strong> Your time is worth £40-100/hour. Every hour firefighting is money lost. Invest that time in systems instead.</li>
            <li style="margin-bottom: 8px;"><strong>Add management overhead:</strong> If you're not charging 10-15% on top of labour costs for your management time, you're working for free.</li>
            <li style="margin-bottom: 8px;"><strong>Cut the worst offenders:</strong> Identify the subbies causing 80% of your problems. Replace them - the short-term pain is worth the long-term gain.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Builders who address labour profitability typically add 8-15% to their net margin within 6 months.
        </div>`,
      amber: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #D97706; font-size: 15px;">⚡ Improvement Needed: You're leaving money on the table</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Opportunity:</strong> You're aware of the cost, but you're probably not maximising your margin or fully recovering your management time.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Optimise Your Labour Profitability:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Review your rates:</strong> When did you last increase your prices? If it's been over a year, you're probably 5-10% behind.</li>
            <li style="margin-bottom: 8px;"><strong>Delegate the delegation:</strong> Can someone else coordinate subbies? A site supervisor at £20/hour is cheaper than your £60/hour time.</li>
            <li style="margin-bottom: 8px;"><strong>Document recurring problems:</strong> Create SOPs for common issues. Empower your team to solve problems without escalating to you.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Small improvements here compound quickly. Even 5% better margins add up to significant annual gains.
        </div>`,
      green: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #059669; font-size: 15px;">✅ Strength: Efficient labour management protects your margins</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Stay Sharp:</strong> Good labour profitability is a competitive advantage. Here's how to widen the gap.
        </div>
        <div style="background: #fff; border-left: 3px solid #059669; padding: 12px; margin: 12px 0;">
          <strong style="color: #059669;">Advanced Profit Strategies:</strong>
          <ul style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Invest savings wisely:</strong> Use profit gains to pay slightly above market for A-players. The reliability premium pays for itself.</li>
            <li style="margin-bottom: 8px;"><strong>Performance bonuses:</strong> Tie subbie bonuses to project profitability. Align incentives and everyone wins.</li>
            <li style="margin-bottom: 8px;"><strong>Benchmark quarterly:</strong> Track labour cost as % of project value. Set targets and review regularly.</li>
          </ul>
        </div>`
    },
    onboarding: {
      red: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #DC2626; font-size: 15px;">🚨 Critical Issue: Poor onboarding causes 40% of new hire failures</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Pattern:</strong> New subbies arrive confused, make mistakes, and either leave frustrated or get let go. Each failed relationship costs you 2-4 weeks of disruption.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">The First Week Framework:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Pre-Start Checklist (Day -1):</strong> Text them: site address, parking, start time, who to ask for, what to bring. Remove all friction.</li>
            <li style="margin-bottom: 8px;"><strong>First Morning (30 mins):</strong> Site tour, introductions, safety briefing, where toilets/breaks are, your communication preferences (calls vs texts, response expectations).</li>
            <li style="margin-bottom: 8px;"><strong>Quality Standards Doc:</strong> One page showing what "good" looks like on your jobs. Photos help. Sets clear expectations.</li>
            <li style="margin-bottom: 8px;"><strong>Week 1 Check-in:</strong> Brief chat at end of first week. "How's it going? Any questions? Anything you need?" Shows you care, catches problems early.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Proper onboarding typically improves new subbie retention by 50% and reduces first-month quality issues by 70%.
        </div>`,
      amber: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #D97706; font-size: 15px;">⚡ Improvement Needed: Inconsistent onboarding creates unnecessary friction</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Gap:</strong> You do some onboarding, but it varies. This means some new subbies thrive while others struggle unnecessarily.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Standardise Your Process:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Create one checklist:</strong> Write down everything a new subbie needs to know. Use it every time. Consistency breeds success.</li>
            <li style="margin-bottom: 8px;"><strong>Buddy system:</strong> Pair new subbies with your most reliable person for the first few days. They learn faster and feel supported.</li>
            <li style="margin-bottom: 8px;"><strong>Feedback loop:</strong> Ask new subbies after 2 weeks: "What would have helped you get up to speed faster?" Use answers to improve.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Consistent onboarding typically reduces time-to-productivity by 30-40%.
        </div>`,
      green: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #059669; font-size: 15px;">✅ Strength: Professional onboarding sets you apart</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Your Advantage:</strong> Good onboarding makes subbies want to work for you. They tell their mates. Talent comes to you.
        </div>
        <div style="background: #fff; border-left: 3px solid #059669; padding: 12px; margin: 12px 0;">
          <strong style="color: #059669;">Make It World-Class:</strong>
          <ul style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Welcome pack:</strong> Professional folder with your processes, payment terms, expectations, useful contacts. Shows you're a proper operation.</li>
            <li style="margin-bottom: 8px;"><strong>30-60-90 day check-ins:</strong> Brief scheduled conversations at each milestone. Prevents problems festering.</li>
            <li style="margin-bottom: 8px;"><strong>Development conversations:</strong> "Where do you want to be in 2 years? How can we help?" This is rare - subbies remember it.</li>
          </ul>
        </div>`
    },
    culture: {
      red: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #DC2626; font-size: 15px;">🚨 Critical Issue: Poor culture is driving away your best people</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Vicious Cycle:</strong> When morale is low, your best people leave first (they have options). You're left with whoever can't find anything better. Quality drops. More stress. More people leave.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Break the Cycle - Start This Week:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Recognition costs nothing:</strong> Text your team after a good day: "Appreciate the work today, well done." People remember this.</li>
            <li style="margin-bottom: 8px;"><strong>Friday gestures:</strong> Bacon rolls, fish and chips, early finish. Small investments that show you value them as people.</li>
            <li style="margin-bottom: 8px;"><strong>Fix the irritants:</strong> Ask: "What's one thing that bugs you about working with us?" Listen. Fix what you can. Respond to what you can't.</li>
            <li style="margin-bottom: 8px;"><strong>Fairness check:</strong> Are you paying on time? Treating people consistently? Being honest about problems? These basics matter more than perks.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Improving culture typically reduces turnover by 30-50% and significantly improves quality and reliability.
        </div>`,
      amber: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #D97706; font-size: 15px;">⚡ Improvement Needed: Culture inconsistency affects retention</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>The Situation:</strong> Morale is OK but not great. Some days are good, some aren't. This inconsistency creates uncertainty that your best people don't like.
        </div>
        <div style="background: #fff; border-left: 3px solid #0063FF; padding: 12px; margin: 12px 0;">
          <strong style="color: #0063FF;">Build Consistent Positive Culture:</strong>
          <ol style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Monthly team touchpoint:</strong> Even 15 minutes together. Updates on what's coming, recognition for good work, chance to raise issues.</li>
            <li style="margin-bottom: 8px;"><strong>Ask for feedback:</strong> "What would make your job easier?" Then actually do something about it. Shows you care.</li>
            <li style="margin-bottom: 8px;"><strong>Celebrate wins:</strong> Job completed well? Client happy? Acknowledge it. Create a culture where success is noticed.</li>
          </ol>
        </div>
        <div style="background: #D1FAE5; padding: 10px; border-radius: 4px; margin-top: 12px;">
          <strong>💰 Expected Result:</strong> Consistent positive culture typically improves productivity by 10-15% and makes recruitment easier.
        </div>`,
      green: `
        <div style="margin-bottom: 16px;">
          <strong style="color: #059669; font-size: 15px;">✅ Strength: Good culture is your secret retention weapon</strong>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Compound the Advantage:</strong> People want to work with you. This makes everything else easier. Here's how to make it even stronger.
        </div>
        <div style="background: #fff; border-left: 3px solid #059669; padding: 12px; margin: 12px 0;">
          <strong style="color: #059669;">World-Class Culture Practices:</strong>
          <ul style="margin: 8px 0 0 16px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Annual thank-you event:</strong> Christmas meal, summer BBQ, team day out. Budget £50-100 per person. Creates memories and loyalty.</li>
            <li style="margin-bottom: 8px;"><strong>Loyalty rewards:</strong> After 1 year, 3 years, 5 years - recognise it. Bonus, gift, public acknowledgment. Long tenure deserves recognition.</li>
            <li style="margin-bottom: 8px;"><strong>Referral culture:</strong> Make it easy for your team to bring in people like them. Good people know good people.</li>
          </ul>
        </div>`
    }
  };

  const sectionInsights = insights[sectionKey];
  if (!sectionInsights) {
    return color === "red" 
      ? `<div><strong>Action Required:</strong> This area needs immediate attention. Contact us for specific guidance tailored to your situation.</div>`
      : color === "amber"
        ? `<div><strong>Opportunity:</strong> Room for improvement exists. Focus on consistency and documentation to level up.</div>`
        : `<div><strong>Well Done:</strong> Keep doing what's working and look for ways to optimise further.</div>`;
  }
  
  return sectionInsights[color];
}

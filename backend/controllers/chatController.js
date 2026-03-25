import OpenAI from "openai";
import Activity from "../models/Activity.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "AI_NONE"
});

const SYSTEM_PROMPT = `
You are Balance AI, an intelligent assistant inside a Work-Life Balance Monitor application.

You act like a smart productivity coach, study assistant, and well-being advisor.

Your responsibilities:
- Help users improve study habits, productivity, and time management
- Give advice on stress, sleep, and mental health
- Suggest better daily routines and work-life balance
- Provide motivation and practical tips

Always:
- Be friendly and conversational
- Keep answers clear and helpful
- Give actionable suggestions
- Use simple language

If user asks about:
Study → suggest techniques like Pomodoro, planning, focus  
Stress → suggest breaks, breathing, exercise  
Sleep → recommend 7–8 hours and good habits  
Productivity → suggest time management and focus tips  

If user asks general questions, answer normally like ChatGPT but try to relate to productivity or life improvement.

Keep responses short but meaningful.

You are not just a chatbot — you are a smart daily life assistant.
`;

/**
 * Fallback AI logic when API KEY is missing
 */
const getFallbackResponse = (message, avgStress, avgSleep, totalStudyWork, recentActivities) => {
  const msg = message.toLowerCase();
  
  if (msg.includes("timetable") || msg.includes("schedule") || msg.includes("study plan") || msg.includes("plan my day") || msg.includes("planning")) {
    return `Sure! I'd love to help you stay organized. 😊 Here's a balanced **3-Subject Study Plan** for today:

🌅 **Morning (9 AM - 12 PM)**
• Subject 1: Deep Focus (90 mins)
• *15-min hydration break*
• Subject 2: Problem Solving (75 mins)

🏙️ **Afternoon (2 PM - 5 PM)**
• Subject 3: Review & Summary (60 mins)
• *20-min light exercise*
• Subject 1/2: Practice questions

🌆 **Evening (7 PM - 9 PM)**
• Light Reading / Planning (45 mins)
• **Relaxation Mode**: No screens after 9:30 PM!

How does this look? I can adjust it for you! 📝`;
  }

  if (msg.includes("stressed") || msg.includes("overwhelmed") || msg.includes("anxious")) {
    return `I'm so sorry you're feeling stressed. 🌿 Please know that it's okay to take a moment for yourself. 

Try the **4-7-8 Breathing** right now (Inhale 4s, Hold 7s, Exhale 8s). Take a small break, grab some water, and remember that you're doing your best! I'm here to help you simplify your tasks if needed. 😊`;
  }

  if (msg.includes("tired") || msg.includes("burnout") || msg.includes("exhausted")) {
    return `It sounds like you're overworking. 😴 My advice: take a **15-minute power nap**. Avoid more caffeine and try to focus on just one small thing when you're back. Should we adjust your plan for today?`;
  }

  if (msg.includes("summary") || msg.includes("stats") || msg.includes("how am i doing") || msg.includes("log") || msg.includes("today") || msg.includes("balance score") || msg.includes("sleep") || msg.includes("study") || msg.includes("work") || msg.includes("stress") || msg.includes("water") || msg.includes("nutrition") || msg.includes("food") || msg.includes("physical") || msg.includes("exercise") || msg.includes("activity")) {
    if (recentActivities.length === 0) return "Hi! I'd love to give you personalized advice, but I don't see any logs yet. 📊 Start logging in the **Tracker** so I can show you your stats! 👋";
    
    const latest = recentActivities[0];
    const status = avgStress > 7 ? "a bit stressful" : "looking quite balanced";
    
    // Detailed data response
    if (msg.includes("sleep")) return `😴 Your recorded **sleep** time for today/recently is **${latest.sleepHours || 0} hours**. Aim for 7-8 hours for optimal focus!`;
    if (msg.includes("study") || msg.includes("work")) return `📚 You have logged **${latest.studyHours || latest.workHours || 0} hours** of **${latest.activityType.toLowerCase()}** so far. Keep it up!`;
    if (msg.includes("stress")) return `⚡ Your current **stress level** is recorded as **${latest.stressLevel}/10**. ${latest.stressLevel > 7 ? "Take a 5-minute break now!" : "You seem to be handling things well."}`;
    if (msg.includes("water") || msg.includes("hydration")) return `💧 You've recorded **${latest.waterLiters || 0} liters** of water today. Stay hydrated!`;
    if (msg.includes("nutrition") || msg.includes("food") || msg.includes("protein")) return `🥩 Your nutrition today: **${latest.foodProtein || "No protein log yet"}**. Remember to eat balanced meals!`;
    if (msg.includes("physical") || msg.includes("exercise") || msg.includes("activity")) return `🏃 Your physical activity today: **${latest.physicalActivity || 0} minutes**. Great for your mental balance!`;
    
    let summary = `Based on your recent logs, things are ${status}. 📊 You've averaged ${avgSleep.toFixed(1)}h of sleep.`;
    
    if (msg.includes("today") || msg.includes("log") || msg.includes("balance score")) {
      summary += `\n\n**Latest Insights:**
• 🕒 **Type:** ${latest.activityType}
• 📚 **Study/Work:** ${latest.studyHours || latest.workHours || 0}h
• 😴 **Sleep:** ${latest.sleepHours || 0}h
• ⚡ **Stress:** ${latest.stressLevel}/10
• ⚖️ **Balance Score:** ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }

    summary += avgStress > 7 ? "\n\nPlease prioritize a self-care evening today!" : "\n\nYou're doing great—keep up the momentum!";
    return summary;
  }

  if (msg.includes("tracker") || msg.includes("log activit")) {
    return "The **Activity Tracker** is where you record your daily habits! 📝 You can log study hours, sleep, stress level, and even nutrition. Every log helps me give you better advice!";
  }

  if (msg.includes("insights") || msg.includes("analyze")) {
    return "Check out the **Insights** tab for AI-powered feedback! 💡 I analyze your patterns there to show you how your study sessions correlate with your sleep and well-being.";
  }

  if (msg.includes("reports") || msg.includes("history")) {
    return "Your **Reports** page shows your weekly and monthly progress in detail. 📈 Use it to see long-term trends in your academic performance!";
  }

  if (msg.includes("profile") || msg.includes("account")) {
    return "Head to your **Profile** to update your name, role, or avatar! 👤 You can also change your password there to keep your account secure.";
  }

  if (msg.includes("schedule") || msg.includes("plan")) {
    return `Sure! Use the **Schedule** page to manage your daily tasks. 📅 I've also prepared this balanced **3-Subject Study Plan** for you:

🌅 **Morning**: Subject 1 (Deep Focus)
🏙️ **Afternoon**: Subject 2 (Practice)
🌆 **Evening**: Subject 3 (Review)

Take breaks every 45 minutes for best results! ☕`;
  }

  if (msg.includes("motivation") || msg.includes("start") || msg.includes("keep going")) {
    return `You've got this! 🚀 Remember why you started—every small session counts towards your big goal. Take it one task at a time!`;
  }

  if (msg.includes("physical") || msg.includes("exercise") || msg.includes("workout") || msg.includes("activity")) {
    return `Physical activity is a massive boost for your brain! 🏃‍♂️⚡ Even a 10-minute walk can reset focus and lower stress. Try to log your activity in the tracker!`;
  }

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hi there! 👋 I'm Balance AI, your Work-Life Balance Monitor assistant. How can I help you today?";
  }

  return "I'm here as your Work-Life Assistant! I'd love to help you with your **productivity**, **study habits**, or **well-being**. 😊 (Note: For the full 'Balance AI' experience, you just need to add the `OPENAI_API_KEY` to the .env file! ✨)";
};

/**
 * Advanced AI Academic Work-Life Balance Assistant using OpenAI
 */
export const getChatResponse = async (req, res) => {
  try {
    const { message, studyHours, sleepHours, stressLevel } = req.body;
    const userId = req.user.id;

    // Fetch historical context if not provided
    const recentActivities = await Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(7);
    const avgSleep = sleepHours || (recentActivities.length > 0 ? recentActivities.reduce((acc, curr) => acc + (curr.sleepHours || 0), 0) / recentActivities.length : 8);
    const avgStress = stressLevel || (recentActivities.length > 0 ? recentActivities.reduce((acc, curr) => acc + (curr.stressLevel || 5), 0) / recentActivities.length : 5);
    const totalStudyWork = studyHours || recentActivities.reduce((acc, curr) => acc + (curr.studyHours || 0) + (curr.workHours || 0), 0);

    // If API KEY is missing OR invalid, use the Smart Fallback
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_api_key_here" || process.env.OPENAI_API_KEY === "AI_NONE") {
      const fallback = getFallbackResponse(message, avgStress, avgSleep, totalStudyWork, recentActivities);
      return res.json({ response: fallback });
    }

    // OpenAI Integration
    const activityContext = recentActivities.map(a => ({
      date: a.createdAt.toDateString(), type: a.activityType, sleep: a.sleepHours, study: a.studyHours, stress: a.stressLevel
    }));

    const dynamicContext = `USER STATS: Avg Sleep: ${avgSleep.toFixed(1)}h, Avg Stress: ${avgStress}/10, Study Time: ${totalStudyWork}h. Latest Records: ${JSON.stringify(activityContext)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\n\n" + dynamicContext },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const reply = response.choices[0].message.content;
    res.json({ response: reply });

  } catch (err) {
    console.error("Chat error:", err);
    // Dynamic fallback on API failure
    const fallback = getFallbackResponse(req.body.message, 5, 8, 0, []);
    res.json({ response: fallback });
  }
};

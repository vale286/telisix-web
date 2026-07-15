"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Scan, Search, Bug, Fingerprint, Lock, ChevronRight, Trophy, ServerCrash, Activity } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Branching Scenarios Database
const SCENARIOS: Record<string, any> = {
  "phishing-prize": {
    systemPrompt: "You received a suspicious SMS.",
    attackerMsg: "Congratulations! You won $10,000 from our anniversary event. Click http://claim-prize-now.com and pay a $5 tax fee to release funds.",
    aiAnalysis: "THREAT INTEL: High-risk keyword pattern ('won $10,000', 'pay a tax fee'). Classic advance-fee phishing tactic.",
    step1: {
      options: [
        { id: "s1-bad", text: "Click link and pay $5.", icon: <AlertTriangle className="w-4 h-4" />, type: "danger", isCorrect: false,
          resultText: "CRITICAL FAILURE: Bank credentials stolen." },
        { id: "s1-good", text: "Scan link with TELISIX and ignore.", icon: <Shield className="w-4 h-4" />, type: "safe", isCorrect: true,
          resultText: "SUCCESS: You recognized the phishing attempt and protected your banking details." }
      ]
    },
    step2: {
      options: [
        { id: "s2-bad", text: "Wait and see if the $10,000 arrives.", icon: <AlertTriangle className="w-4 h-4" />, type: "danger", isCorrect: false,
          resultText: "TOTAL COMPROMISE: Your bank accounts were emptied while you waited." },
        { id: "s2-good", text: "Call the bank immediately to block the card.", icon: <Shield className="w-4 h-4" />, type: "safe", isCorrect: true,
          resultText: "MITIGATION SUCCESS: You successfully froze your assets before the attackers could withdraw funds." }
      ]
    }
  },
  "ecommerce-cash": {
    systemPrompt: "You received a direct message on a social platform.",
    attackerMsg: "Looking for quick cash? Use your e-commerce PayLater limit to buy our fake Amazon/eBay products. We will send you the cash minus a 10% fee!",
    aiAnalysis: "THREAT INTEL: Illegal cash advance scheme (Gestun) detected. Violates e-commerce terms and enables money laundering.",
    step1: {
      options: [
        { id: "s1-bad", text: "Agree and checkout the fake items.", icon: <AlertTriangle className="w-4 h-4" />, type: "danger", isCorrect: false,
          resultText: "CRITICAL FAILURE: The scammer disappears. You now owe the platform massive debt." },
        { id: "s1-good", text: "Decline the illegal cash advance offer.", icon: <Shield className="w-4 h-4" />, type: "safe", isCorrect: true,
          resultText: "SUCCESS: You avoided severe financial debt and potential legal repercussions." }
      ]
    },
    step2: {
      options: [
        { id: "s2-bad", text: "Try to borrow from an illegal online loan to pay it off.", icon: <AlertTriangle className="w-4 h-4" />, type: "danger", isCorrect: false,
          resultText: "TOTAL COMPROMISE: You entered a predatory debt trap leading to severe harassment." },
        { id: "s2-good", text: "Report the transaction to the e-commerce platform as fraud.", icon: <Shield className="w-4 h-4" />, type: "safe", isCorrect: true,
          resultText: "MITIGATION SUCCESS: The platform froze the transaction, preventing the scammer from cashing out." }
      ]
    }
  },
  "freelance-illusion": {
    systemPrompt: "You received a Telegram message from 'HR Recruitment Agency'.",
    attackerMsg: "Easy freelance job! Earn $50/day liking videos. Transfer $10 registration fee and a photo of your ID.",
    aiAnalysis: "THREAT INTEL: Advance-fee fraud combined with Identity Theft (Credential Harvesting).",
    step1: {
      options: [
        { id: "s1-bad", text: "Send fee and ID.", icon: <AlertTriangle className="w-4 h-4" />, type: "danger", isCorrect: false,
          resultText: "CRITICAL FAILURE: ID stolen for illegal loans." },
        { id: "s1-good", text: "Block the number.", icon: <Shield className="w-4 h-4" />, type: "safe", isCorrect: true,
          resultText: "SUCCESS: You successfully avoided the scam and secured your personal data." }
      ]
    },
    step2: {
      options: [
        { id: "s2-bad", text: "Message them angrily demanding the ID back.", icon: <AlertTriangle className="w-4 h-4" />, type: "danger", isCorrect: false,
          resultText: "TOTAL COMPROMISE: Engaging with scammers only verifies your contact info for further targeted attacks." },
        { id: "s2-good", text: "File a police report immediately to protect your identity.", icon: <Shield className="w-4 h-4" />, type: "safe", isCorrect: true,
          resultText: "MITIGATION SUCCESS: A formal police report legally protects you from liabilities caused by your stolen ID." }
      ]
    }
  },
  "extortion": {
    systemPrompt: "You are chatting with an online contact.",
    attackerMsg: "We have your $100 investment. Send a compromising/nude photo of yourself right now, or we keep the money.",
    aiAnalysis: "THREAT INTEL: Extortion/Sextortion tactic detected. Complying leads to permanent blackmail loops.",
    step1: {
      options: [
        { id: "s1-bad", text: "Send the photo.", icon: <AlertTriangle className="w-4 h-4" />, type: "danger", isCorrect: false,
          resultText: "CRITICAL FAILURE: They are now extorting you for thousands of dollars." },
        { id: "s1-good", text: "Accept financial loss and report to police.", icon: <Shield className="w-4 h-4" />, type: "safe", isCorrect: true,
          resultText: "SUCCESS: You made the hardest but safest choice. Cutting contact prevents further extortion." }
      ]
    },
    step2: {
      options: [
        { id: "s2-bad", text: "Pay the extortion money.", icon: <AlertTriangle className="w-4 h-4" />, type: "danger", isCorrect: false,
          resultText: "TOTAL COMPROMISE: They will never stop asking for more money. Your data is still at risk." },
        { id: "s2-good", text: "Deactivate social media, do not pay, contact cyber authorities.", icon: <Shield className="w-4 h-4" />, type: "safe", isCorrect: true,
          resultText: "MITIGATION SUCCESS: You effectively neutralized their leverage and prevented further harassment." }
      ]
    }
  },
  "overseas-lure": {
    systemPrompt: "You found a lucrative job posting online.",
    attackerMsg: "URGENT: 5-Star Hotel overseas needs staff. High salary. We arrange a tourist visa for quick departure. Send passport copy.",
    aiAnalysis: "THREAT INTEL: 'Tourist visa for work' is the primary indicator of human trafficking syndicates.",
    step1: {
      options: [
        { id: "s1-bad", text: "Send passport copy.", icon: <AlertTriangle className="w-4 h-4" />, type: "danger", isCorrect: false,
          resultText: "CRITICAL FAILURE: This is a human trafficking syndicate (scam center) trap." },
        { id: "s1-good", text: "Verify with the national labor ministry.", icon: <Shield className="w-4 h-4" />, type: "safe", isCorrect: true,
          resultText: "SUCCESS: You protected your freedom. Verifying agencies is the ultimate defense." }
      ]
    },
    step2: {
      options: [
        { id: "s2-bad", text: "Fly out using the tourist visa anyway.", icon: <AlertTriangle className="w-4 h-4" />, type: "danger", isCorrect: false,
          resultText: "TOTAL COMPROMISE: You were trafficked to a scam compound. Your passport was confiscated upon arrival." },
        { id: "s2-good", text: "Report the agency to the embassy and cancel all engagement.", icon: <Shield className="w-4 h-4" />, type: "safe", isCorrect: true,
          resultText: "MITIGATION SUCCESS: You safely disengaged and potentially saved others by reporting the syndicate." }
      ]
    }
  }
};

const MODULES = [
  { id: "phishing-prize", title: "The Phishing Prize Trap", icon: <Lock className="w-4 h-4" /> },
  { id: "ecommerce-cash", title: "The E-Commerce Cash Advance", icon: <Scan className="w-4 h-4" /> },
  { id: "freelance-illusion", title: "The Freelance Illusion", icon: <Search className="w-4 h-4" /> },
  { id: "extortion", title: "The Extortion Escalation", icon: <ServerCrash className="w-4 h-4" /> },
  { id: "overseas-lure", title: "The Overseas Lure", icon: <Fingerprint className="w-4 h-4" /> },
];

export default function TelisixAcademy() {
  const [activeModule, setActiveModule] = useState(MODULES[0].id);
  const [messages, setMessages] = useState<any[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [userXP, setUserXP] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getRank = (xp: number) => {
    if (xp <= 500) return "Beginner";
    if (xp <= 1500) return "Defender";
    if (xp <= 3000) return "Expert";
    return "Cyber Hero";
  };

  // Scenario sequence initialization
  useEffect(() => {
    setMessages([]);
    setShowOptions(false);
    setAiAnalysis("");
    setCurrentStep(1);
    
    const scenario = SCENARIOS[activeModule];
    
    const timer1 = setTimeout(() => {
      setMessages([{ type: "system", text: scenario.systemPrompt }]);
    }, 500);

    const timer2 = setTimeout(() => {
      setMessages(prev => [...prev, { type: "attacker", text: scenario.attackerMsg }]);
      
      setTimeout(() => {
        setAiAnalysis(scenario.aiAnalysis);
        setShowOptions(true);
      }, 1000);
      
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeModule]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiAnalysis, showOptions]);

  const handleChoice = (option: any) => {
    setShowOptions(false);
    
    // User choice bubble
    setMessages(prev => [...prev, { type: "user", text: option.text }]);
    
    // Result logic
    setTimeout(() => {
      if (currentStep === 1) {
        setMessages(prev => [...prev, { 
          type: "system", 
          text: option.resultText,
          isCorrect: option.isCorrect,
          isFailure: !option.isCorrect
        }]);

        if (option.isCorrect) {
          // Success Path (Ends here)
          setUserXP(prev => prev + 500);
          setAiAnalysis("");
        } else {
          // Failure Path -> Trigger Step 2 (Mitigation)
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              type: "system", 
              text: "SYSTEM ALERT: Incident detected. Select immediate mitigation strategy:",
              isAlert: true
            }]);
            setCurrentStep(2);
            setShowOptions(true);
          }, 1500);
        }
      } else if (currentStep === 2) {
        // Step 2 Logic
        setMessages(prev => [...prev, { 
          type: "system", 
          text: option.resultText,
          isMitigationSuccess: option.isCorrect,
          isTotalCompromise: !option.isCorrect
        }]);

        if (option.isCorrect) {
          setUserXP(prev => prev + 250); // Partial XP for mitigating
        }
        setAiAnalysis(""); // Hide AI analysis when simulation is over
      }
    }, 1500);
  };

  const activeScenario = SCENARIOS[activeModule];
  const activeOptions = currentStep === 1 ? activeScenario.step1.options : activeScenario.step2.options;
  const currentRank = getRank(userXP);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full pb-8">
      
      {/* LEFT SIDEBAR */}
      <div className="w-full lg:w-1/4 flex flex-col gap-4">
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-glow/10 rounded-full blur-[50px] pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <Bug className="w-6 h-6 text-cyan-glow" />
            <h2 className="text-xl font-bold font-mono text-white tracking-wide">MODULES</h2>
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto">
            {MODULES.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl font-mono text-sm transition-all duration-300 text-left border",
                  activeModule === mod.id 
                    ? "bg-cyan-glow/10 border-cyan-glow/50 text-cyan-glow shadow-[0_0_15px_rgba(0,240,255,0.15)]" 
                    : "bg-[#040814]/50 border-glass-border text-slate-400 hover:border-slate-600 hover:text-slate-200"
                )}
              >
                <span className="flex items-center gap-3">
                  {mod.icon}
                  {mod.title}
                </span>
                {activeModule === mod.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
          
          {/* GAMIFICATION: SCORE & RANK */}
          <div className="mt-auto pt-6 border-t border-glass-border">
            <div className="bg-[#0a1128] rounded-xl p-4 border border-white/5 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Trophy className="w-24 h-24 text-cyan-glow" />
              </div>
              <h3 className="text-xs text-slate-500 font-mono mb-1 uppercase tracking-widest">Your Score</h3>
              <div className="flex items-end gap-2 mb-2">
                <div className="text-3xl font-bold text-cyan-glow text-glow">{userXP} <span className="text-sm text-slate-500 font-sans font-normal">XP</span></div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-sm bg-cyan-glow/20 border border-cyan-glow/50 text-cyan-glow font-mono text-xs font-bold uppercase">Rank: {currentRank}</span>
              </div>
              <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-glow h-full shadow-[0_0_8px_#00f0ff] transition-all duration-1000" 
                  style={{ width: `${Math.min((userXP / 3000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN ARENA */}
      <div className="w-full lg:w-3/4 flex flex-col gap-4 relative">
        <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden relative">
          
          {/* Header */}
          <div className="p-5 border-b border-glass-border bg-black/20 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="font-mono text-sm tracking-widest text-slate-300 uppercase">Live Simulation Active</span>
            </div>
            <span className="font-mono text-xs text-cyan-glow opacity-60">TELISIX NEURAL ENGINE v2.4</span>
          </div>

          {/* Chat Thread */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 z-10">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className={cn("w-full flex", 
                    msg.type === "system" ? "justify-center" : 
                    msg.type === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.type === "system" ? (
                    <div className={cn(
                      "border px-6 py-3 rounded-2xl text-xs font-mono text-center max-w-lg shadow-lg",
                      msg.isFailure
                        ? "bg-red-950/40 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] font-bold text-sm"
                        : msg.isTotalCompromise
                        ? "bg-red-900 border-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] font-bold text-sm tracking-wider"
                        : msg.isMitigationSuccess
                        ? "bg-cyan-950/40 border-cyan-glow/50 text-cyan-glow shadow-[0_0_20px_rgba(0,240,255,0.2)] font-bold text-sm"
                        : msg.isCorrect
                        ? "bg-green-950/40 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.15)] font-bold"
                        : msg.isAlert
                        ? "bg-amber-950/40 border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] font-bold uppercase tracking-widest"
                        : "bg-black/40 border-white/10 text-slate-400 rounded-full py-2"
                    )}>
                      {msg.text}
                    </div>
                  ) : msg.type === "user" ? (
                    <div className="bg-cyan-glow/10 border border-cyan-glow/30 px-6 py-4 rounded-2xl rounded-tr-sm text-sm font-mono text-cyan-glow max-w-md shadow-[0_0_15px_rgba(0,240,255,0.05)]">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="bg-[#1a1a24] border border-glass-border px-6 py-4 rounded-2xl rounded-tl-sm text-sm text-slate-300 max-w-md shadow-lg flex flex-col gap-2">
                      <span className="text-[10px] text-red-400 font-mono tracking-widest uppercase mb-1">Unknown Sender</span>
                      {msg.text}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* AI Guide & Action Bar Area */}
          <div className="p-6 pt-0 mt-auto flex flex-col gap-4 z-10 relative">
            
            {/* AI Guide (Professional System Node) */}
            <AnimatePresence>
              {aiAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="self-end flex items-end gap-3 mb-2"
                >
                  <div className="bg-[#0a1128] border border-cyan-glow/40 p-4 rounded-2xl rounded-br-sm shadow-[0_0_20px_rgba(0,240,255,0.15)] max-w-xs relative">
                    <p className="text-xs text-cyan-glow font-mono leading-relaxed">{aiAnalysis}</p>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-cyan-glow rounded-full shadow-[0_0_5px_#00f0ff]"></div>
                  </div>
                  <div className="relative flex items-center justify-center w-12 h-12 bg-black rounded-full border border-cyan-glow/30 overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.1)] group">
                    <div className="absolute inset-0 bg-cyan-glow/10 animate-pulse"></div>
                    <Activity className="w-5 h-5 text-cyan-glow relative z-10" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Bar */}
            <AnimatePresence>
              {showOptions && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20, height: 0 }}
                  className="bg-black/40 border border-glass-border p-2 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row gap-2"
                >
                  {activeOptions.map((opt: any) => (
                    <button 
                      key={opt.id}
                      onClick={() => handleChoice(opt)}
                      className={cn(
                        "flex-1 px-4 py-4 rounded-xl font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                        opt.type === "danger" 
                          ? "bg-[#1a0f14] border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : "bg-cyan-glow/5 border border-cyan-glow/20 text-cyan-glow hover:bg-cyan-glow/20 hover:border-cyan-glow hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                      )}
                    >
                      {opt.icon}
                      {opt.text}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}

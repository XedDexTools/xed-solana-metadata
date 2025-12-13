"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is XED Screener?",
    answer: "XED Screener is a FREE Solana token metadata registry. We provide permissionless, standardized metadata infrastructure for Solana tokens without the expensive $300+ fees charged by other platforms."
  },
  {
    question: "How much does it cost?",
    answer: "XED Screener is completely FREE for token creators. We cover the underlying infrastructure costs so you don't have to pay the absurd fees charged by trading terminals."
  },
  {
    question: "How long does approval take?",
    answer: "Most submissions are reviewed and approved within 10-15 minutes. You can check the status of your submission anytime using the Status Tracker."
  },
  {
    question: "What information do I need to submit?",
    answer: "You'll need your wallet address, token mint address, token name, symbol, description, and an image. Social links (Twitter, Telegram, Website) are optional but recommended."
  },
  {
    question: "Is there a rate limit?",
    answer: "Yes, to prevent spam you can only submit/update metadata once every 3 hours per wallet + mint combination."
  },
  {
    question: "How do I update my token metadata?",
    answer: "Simply submit a new entry with the same wallet and mint address. The new metadata will replace the old one after approval."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="relative z-10 border-t border-white/10 bg-black py-16">
      <div className="max-w-[1400px] mx-auto px-6">
        <h2 className="text-sm font-mono text-zinc-500 mb-8 text-center">FREQUENTLY ASKED QUESTIONS</h2>
        <div className="max-w-3xl mx-auto space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-white/10">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-medium text-sm">{faq.question}</span>
                <span className="text-zinc-500 text-lg">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


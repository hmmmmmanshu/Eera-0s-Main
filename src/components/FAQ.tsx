import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "About EERA",
    questions: [
      {
        question: "What exactly is EERA?",
        answer: "EERA is an AI Founder & Creator OS: one workspace that helps you plan, market, sell, and operate without juggling multiple tools or hires. It's your complete Founder's Office in the Cloud, powered by the world's smartest evolving AI."
      },
      {
        question: "Who is it for?",
        answer: "Early-stage founders, creators, and 1–10 person teams building SaaS, D2C, services, or content-led businesses. Whether you're launching a startup or scaling a creator business, EERA gives your small team superpowers."
      },
      {
        question: "How is EERA different from ChatGPT or a CRM?",
        answer: "ChatGPT is a single tool. EERA is a connected operating system with hubs for marketing, sales, finance, ops, tech, and legal, plus a cognitive hub that remembers your context and routes tasks to the best model automatically. It's an entire workspace, not just a chatbot."
      }
    ]
  },
  {
    category: "Features & Intelligence",
    questions: [
      {
        question: "Which AI models does EERA use?",
        answer: "We dynamically connect to top-performing models in each category (writing, analysis, vision, code) including GPT, Claude, Gemini, and Grok. EERA chooses what's best for the task, so you don't have to. It's always up-to-date with the latest AI advancements."
      },
      {
        question: "Do I still need subscriptions to other AI tools?",
        answer: "Not for core work. EERA aggregates best-in-class models behind one subscription, so you avoid switching costs and constant retraining. You get the power of multiple AI tools unified in one intelligent workspace."
      },
      {
        question: "Does EERA replace a team?",
        answer: "EERA can replace the early 'Founder's Office' and augment your small team, often doing the work of multiple roles (content, sales ops, FP&A, PM) so you can keep the team lean and move faster."
      },
      {
        question: "How does EERA handle my data and privacy?",
        answer: "Your data lives in your workspace with strict access controls. EERA's cognitive memory is private to your account and used only to serve your outputs. We never train on your data or share it with third parties."
      }
    ]
  },
  {
    category: "Usage & Integration",
    questions: [
      {
        question: "Can EERA post and send on my behalf?",
        answer: "Yes - connect channels (email, LinkedIn, etc.) and EERA can draft, schedule, and send after your approval. You stay in control while EERA handles the execution."
      },
      {
        question: "Is there a mobile app?",
        answer: "We're launching web first; mobile is next so you can work with EERA anywhere. The web version works beautifully on mobile browsers in the meantime."
      },
      {
        question: "Can I cancel anytime?",
        answer: "Yes - no lock-ins. Export your work whenever you like. We believe in earning your subscription every month."
      }
    ]
  },
  {
    category: "Beta & Pricing",
    questions: [
      {
        question: "What does beta include and how do I join?",
        answer: "Beta includes the Dashboard, Marketing Hub, Sales Hub, and early Finance snapshots. Join the waitlist above; we'll onboard in small cohorts of the first 200 users."
      },
      {
        question: "How much will it cost after beta?",
        answer: "We'll offer simple plans for solo builders and small teams. Beta users get preferred pricing for life as a thank you for being early believers."
      }
    ]
  }
];

const FAQ = () => {
  const [openCategory, setOpenCategory] = useState<string | null>(faqs[0].category);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
    setOpenQuestion(null);
  };

  const toggleQuestion = (question: string) => {
    setOpenQuestion(openQuestion === question ? null : question);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-up">
            <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about EERA OS
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border border-border rounded-xl overflow-hidden bg-card">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center">
                      <span className="text-background font-bold text-sm">
                        {category.questions.length}
                      </span>
                    </div>
                    <span className="text-xl font-semibold text-left">{category.category}</span>
                  </div>
                  <div className={cn(
                    "transition-transform duration-200",
                    openCategory === category.category && "rotate-180"
                  )}>
                    {openCategory === category.category ? (
                      <Minus className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </div>
                </button>

                {/* Questions */}
                {openCategory === category.category && (
                  <div className="border-t border-border">
                    {category.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="border-b border-border last:border-b-0">
                        <button
                          onClick={() => toggleQuestion(faq.question)}
                          className="w-full p-6 pl-20 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                        >
                          <span className="font-medium pr-4">{faq.question}</span>
                          <div className={cn(
                            "transition-transform duration-200 flex-shrink-0",
                            openQuestion === faq.question && "rotate-180"
                          )}>
                            {openQuestion === faq.question ? (
                              <Minus className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </div>
                        </button>
                        {openQuestion === faq.question && (
                          <div className="px-6 pb-6 pl-20 text-muted-foreground animate-fade-in">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Support CTA */}
          <div className="text-center pt-8 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <a
              href="mailto:hello@eera.app"
              className="text-foreground font-medium hover:underline"
            >
              Contact our support team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

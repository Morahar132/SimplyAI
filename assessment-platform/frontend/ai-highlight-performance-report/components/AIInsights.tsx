import React from 'react';
import { Sparkles, Lightbulb, TriangleAlert } from 'lucide-react';

export const AIInsights: React.FC = () => {
  return (
    <div className="bg-surface-dark rounded-3xl p-6 relative overflow-hidden ai-glow ai-sparkle-bg border border-primary/30">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">AI Review</h2>
            <div className="mt-1.5">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                Premium Insights
              </span>
            </div>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="space-y-4">
          
          {/* Conceptual Gap */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex gap-3">
              <Lightbulb className="text-yellow-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Conceptual Gap Detected</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  You skipped 18 questions related to fluid dynamics. The AI suggests revisiting{' '}
                  <span className="text-primary font-medium">Bernoulli's Principle</span> before the next quiz.
                </p>
              </div>
            </div>
          </div>

          {/* Common Pitfall */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex gap-3">
              <TriangleAlert className="text-red-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Common Pitfall</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  In Question 3, you confused terminal velocity radius proportionality. Remember:{' '}
                  <span className="italic font-serif">v ∝ r²</span>.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
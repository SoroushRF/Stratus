'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import PremiumBackground from './ui/PremiumBackground';
import AnimatedButton from './ui/AnimatedButton';

interface Props {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CRITICAL UI ERROR:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
          <PremiumBackground weatherCondition="clear" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card p-8 rounded-3xl relative z-10 text-center border-red-500/20"
          >
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-bold mb-4">The Atmosphere is Unstable</h1>
            <p className="text-white/60 mb-8 leading-relaxed">
                Stratus encountered an unexpected gust of wind and couldn't process this page. Our engineers have been notified.
            </p>

            <div className="space-y-4">
                <AnimatedButton 
                    onClick={() => window.location.reload()}
                    className="w-full bg-white/10 border-white/10 hover:bg-white/20"
                >
                    <span className="flex items-center justify-center gap-2">
                        <RefreshCcw className="w-4 h-4" />
                        Reload Compass
                    </span>
                </AnimatedButton>

                <AnimatedButton 
                    onClick={this.handleReset}
                    className="w-full"
                >
                    <span className="flex items-center justify-center gap-2">
                        <Home className="w-4 h-4" />
                        Back to Clear Skies
                    </span>
                </AnimatedButton>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 font-mono text-[10px] text-white/20 uppercase tracking-[0.2em]">
                System Error Code: UI_TREE_FRAGMENTED
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

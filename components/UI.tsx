import React from 'react';
import { LucideIcon } from 'lucide-react';

export const FoundryLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 512 512" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <circle cx="256" cy="256" r="230" stroke="#4F46E5" strokeWidth="32" fill="white"/>
    <path d="M176 138 H356 V208 H236 V248 H336 V318 H236 V384 H176 V138 Z" stroke="#4F46E5" strokeWidth="32" strokeLinejoin="round"/>
  </svg>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode; onClick?: () => void }> = ({ children, className = "", title, action, onClick }) => (
  <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`} onClick={onClick}>
    {(title || action) && (
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-lg">
        {title && <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'black' | 'outline';
  className?: string;
  onClick?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ children, variant = 'primary', className = "", onClick, fullWidth, disabled, size }) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2";
  const variants: Record<string, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    black: "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
    outline: "bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50",
  };

  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";
  // Map size prop to classes if needed, for now just consuming the prop to avoid errors

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${fullWidth ? 'w-full' : ''} ${disabledStyle} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'blue' | 'amber' | 'green' | 'red' | 'slate' | 'purple' | 'emerald' | 'indigo' | 'white'; className?: string; title?: string }> = ({ children, color = 'slate', className = "", title }) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    white: "bg-white text-slate-700 border-slate-200",
  };
  return (
    <span title={title} className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[color] || colors.slate} ${className}`}>
      {children}
    </span>
  );
};

export const AIInsightBox: React.FC<{ type?: 'warning' | 'insight' | 'critical', title?: string, children: React.ReactNode }> = ({ type = 'insight', title, children }) => {
  const styles = {
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    insight: "bg-indigo-50 border-indigo-200 text-indigo-900",
    critical: "bg-red-50 border-red-200 text-red-900"
  };
  const icons = {
    warning: "⚠",
    insight: "✨",
    critical: "🛑"
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} mb-4`}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{icons[type]}</span>
        <div className="flex-1">
          {title && <h4 className="font-bold text-xs uppercase mb-1 opacity-80 tracking-wider">{title}</h4>}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

export const WireframePlaceholder: React.FC<{ height?: string; label?: string }> = ({ height = "h-32", label = "Content Placeholder" }) => (
  <div className={`w-full ${height} bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 p-4`}>
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export const ProgressBar: React.FC<{ value: number; color?: string; className?: string; height?: string }> = ({ value, color = "bg-indigo-600", className = "", height = "h-2" }) => (
  <div className={`w-full ${height} bg-slate-100 rounded-full overflow-hidden ${className}`}>
    <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${value}%` }}></div>
  </div>
);
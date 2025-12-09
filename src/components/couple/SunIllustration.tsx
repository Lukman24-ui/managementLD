export const SunIllustration = () => {
  return (
    <svg viewBox="0 0 120 120" className="w-20 h-20 animate-float">
      {/* Sun rays */}
      <g className="animate-pulse-soft">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={i}
            x1="60"
            y1="60"
            x2={60 + 50 * Math.cos((angle * Math.PI) / 180)}
            y2={60 + 50 * Math.sin((angle * Math.PI) / 180)}
            stroke="hsl(43 91% 63%)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={0.4}
          />
        ))}
      </g>
      
      {/* Sun body */}
      <circle cx="60" cy="60" r="28" fill="url(#sunGradient)" />
      
      {/* Face */}
      <ellipse cx="50" cy="55" rx="4" ry="5" fill="hsl(25 60% 35%)" />
      <ellipse cx="70" cy="55" rx="4" ry="5" fill="hsl(25 60% 35%)" />
      
      {/* Cheeks */}
      <ellipse cx="42" cy="65" rx="6" ry="4" fill="hsl(15 90% 80%)" opacity="0.6" />
      <ellipse cx="78" cy="65" rx="6" ry="4" fill="hsl(15 90% 80%)" opacity="0.6" />
      
      {/* Smile */}
      <path
        d="M 48 68 Q 60 80 72 68"
        fill="none"
        stroke="hsl(25 60% 35%)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      <defs>
        <radialGradient id="sunGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="hsl(50 100% 75%)" />
          <stop offset="100%" stopColor="hsl(43 91% 63%)" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const LandscapeIllustration = () => {
  return (
    <svg viewBox="0 0 300 150" className="w-full h-full">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(184 68% 85%)" />
          <stop offset="50%" stopColor="hsl(43 91% 90%)" />
          <stop offset="100%" stopColor="hsl(25 100% 90%)" />
        </linearGradient>
        <linearGradient id="hillGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(140 65% 76%)" />
          <stop offset="100%" stopColor="hsl(145 56% 65%)" />
        </linearGradient>
        <linearGradient id="hillGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(140 76% 87%)" />
          <stop offset="100%" stopColor="hsl(140 65% 76%)" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="300" height="150" fill="url(#skyGradient)" rx="20" />
      
      {/* Distant hills */}
      <ellipse cx="250" cy="150" rx="100" ry="50" fill="url(#hillGradient2)" opacity="0.7" />
      <ellipse cx="80" cy="150" rx="120" ry="60" fill="url(#hillGradient1)" />
      
      {/* Trees */}
      <g transform="translate(40, 80)">
        <polygon points="15,0 0,40 30,40" fill="hsl(145 50% 45%)" />
        <rect x="12" y="40" width="6" height="10" fill="hsl(25 50% 40%)" />
      </g>
      <g transform="translate(200, 90)">
        <polygon points="12,0 0,35 24,35" fill="hsl(145 50% 50%)" />
        <rect x="10" y="35" width="5" height="8" fill="hsl(25 50% 40%)" />
      </g>
      
      {/* Clouds */}
      <g opacity="0.8">
        <ellipse cx="70" cy="35" rx="20" ry="12" fill="white" />
        <ellipse cx="85" cy="30" rx="15" ry="10" fill="white" />
        <ellipse cx="55" cy="32" rx="12" ry="8" fill="white" />
      </g>
      <g opacity="0.6">
        <ellipse cx="220" cy="45" rx="18" ry="10" fill="white" />
        <ellipse cx="235" cy="40" rx="14" ry="9" fill="white" />
      </g>
    </svg>
  );
};

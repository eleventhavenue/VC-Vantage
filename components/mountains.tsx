export function Mountains() {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="mountain-gradient-1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
              <stop offset="100%" stopColor="rgba(20, 184, 166, 0.2)" />
            </linearGradient>
            <linearGradient id="mountain-gradient-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(5, 150, 105, 0.3)" />
              <stop offset="100%" stopColor="rgba(13, 148, 136, 0.3)" />
            </linearGradient>
            <linearGradient id="mountain-gradient-3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(6, 78, 59, 0.2)" />
              <stop offset="100%" stopColor="rgba(17, 94, 89, 0.2)" />
            </linearGradient>
          </defs>
          <g className="mountains">
            <path d="M0 800L360 500L720 650L1080 400L1440 800" fill="url(#mountain-gradient-1)">
              <animate
                attributeName="d"
                values="
                  M0 800L360 500L720 650L1080 400L1440 800;
                  M0 800L360 600L720 500L1080 600L1440 800;
                  M0 800L360 500L720 650L1080 400L1440 800"
                dur="20s"
                repeatCount="indefinite"
              />
            </path>
            <path d="M0 800L360 600L720 700L1080 550L1440 800" fill="url(#mountain-gradient-2)">
              <animate
                attributeName="d"
                values="
                  M0 800L360 600L720 700L1080 550L1440 800;
                  M0 800L360 650L720 600L1080 700L1440 800;
                  M0 800L360 600L720 700L1080 550L1440 800"
                dur="25s"
                repeatCount="indefinite"
              />
            </path>
            <path d="M0 800L360 700L720 800L1080 700L1440 800" fill="url(#mountain-gradient-3)">
              <animate
                attributeName="d"
                values="
                  M0 800L360 700L720 800L1080 700L1440 800;
                  M0 800L360 750L720 700L1080 750L1440 800;
                  M0 800L360 700L720 800L1080 700L1440 800"
                dur="30s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </svg>
      </div>
    )
  }
  
  
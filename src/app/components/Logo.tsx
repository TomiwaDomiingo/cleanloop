export function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Recycling Symbol - Three chasing arrows, each in a Lagos color */}

      {/* Arrow 1 – Green (#16A34A) – top */}
      <path
        d="M50 8 L62 28 L55 28 C54 38 56 46 62 52 L54 58 C44 50 40 38 42 26 L35 26 Z"
        fill="#16A34A"
      />

      {/* Arrow 2 – Red (#DC2626) – bottom right */}
      <g transform="rotate(120, 50, 50)">
        <path
          d="M50 8 L62 28 L55 28 C54 38 56 46 62 52 L54 58 C44 50 40 38 42 26 L35 26 Z"
          fill="#DC2626"
        />
      </g>

      {/* Arrow 3 – Yellow (#FACC15) – bottom left */}
      <g transform="rotate(240, 50, 50)">
        <path
          d="M50 8 L62 28 L55 28 C54 38 56 46 62 52 L54 58 C44 50 40 38 42 26 L35 26 Z"
          fill="#FACC15"
        />
      </g>

      {/* Center white circle */}
      <circle cx="50" cy="50" r="14" fill="white" />

      {/* Leaf icon in center */}
      <path
        d="M50 44 C50 44 56 46 57 52 C57 57 52 59 48 57 C44 55 43 50 46 47 C47 46 50 44 50 44 Z"
        fill="#16A34A"
      />
      <line x1="50" y1="57" x2="50" y2="44" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

import type { SVGProps } from 'react';

export function LatexifyLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="40"
      height="40"
      aria-label="Latexify Logo"
      {...props}
    >
      <rect width="100" height="100" rx="15" fill="hsl(var(--primary))" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="60"
        fill="hsl(var(--primary-foreground))"
        fontFamily="var(--font-geist-mono), monospace"
      >
        L∫
      </text>
    </svg>
  );
}

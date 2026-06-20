import Link from 'next/link';

export default function Logo({ text, className = '' }: { text: string, className?: string }) {
  return (
    <Link href="/" className={`cursor-pointer select-none block ${className}`}>
      <div className="relative flex items-center justify-center w-full h-auto">
        <svg 
          viewBox="0 0 800 200" 
          className="w-full h-full drop-shadow-xl"
          style={{ overflow: 'visible' }}
        >
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-pokemon tracking-wider"
            style={{
              fontSize: '130px',
              fill: '#F9CF01',
              stroke: '#4276BD',
              strokeWidth: '28px',
              paintOrder: 'stroke fill',
            }}
          >
            {text}
          </text>
        </svg>
      </div>
    </Link>
  );
}

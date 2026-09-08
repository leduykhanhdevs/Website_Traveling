import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface AnimatedCounterProps {
  end: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  decimals = 0,
  duration = 1.6,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [value, setValue] = useState(end);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setValue(end);
      return;
    }

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: end,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 92%',
        once: true,
      },
      onUpdate: () => {
        if (el) {
          setValue(obj.val);
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [end, decimals, duration, prefix, suffix]);

  return (
    <span ref={spanRef} className={className}>
      {`${prefix}${value.toFixed(decimals)}${suffix}`}
    </span>
  );
};

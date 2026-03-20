"use client";
import React from 'react';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
  thickness?: number;
};

const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  color = 'white',
  speed = '6s',
  thickness = 1,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'button';

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-xl ${className}`}
      {...(rest as any)}
      style={{
        padding: `${thickness}px 0`,
        ...(rest as any).style
      }}
    >
      <div
        className="absolute bottom-12.5 right-[-250%] z-0 h-1/2 w-[300%] rounded-full opacity-90"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: `star-movement-bottom ${speed} linear infinite alternate`
        }}
      ></div>
      <div
        className="absolute left-[-250%] top-12.5 z-0 h-1/2 w-[300%] rounded-full opacity-90"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: `star-movement-top ${speed} linear infinite alternate`
        }}
      ></div>
      <div className="relative z-10 rounded-xl border border-transparent bg-linear-to-b from-primary to-primary/95 p-4 text-center text-[16px] text-white">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
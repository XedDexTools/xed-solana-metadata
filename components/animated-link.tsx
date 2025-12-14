"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface AnimatedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

export function AnimatedLink({
  href,
  children,
  className = "",
  external = false,
}: AnimatedLinkProps) {
  const linkContent = (
    <span className="relative inline-block group">
      <span className="relative z-10">{children}</span>
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 group-hover:w-full transition-all duration-300 ease-out" />
    </span>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`cursor-pointer ${className}`}
      >
        {linkContent}
      </a>
    );
  }

  return (
    <Link href={href} className={`cursor-pointer ${className}`}>
      {linkContent}
    </Link>
  );
}

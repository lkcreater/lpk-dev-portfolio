import type { MDXComponents } from "mdx/types";
import Link from "next/link";

const components: MDXComponents = {
  a: ({ href = "", children }) =>
    href.startsWith("http") ? (
      <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="OPEN">
        {children}
      </a>
    ) : (
      <Link href={href}>{children}</Link>
    ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}

import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  a: ({ href = "", children }) =>
    href.startsWith("http") ? (
      <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="OPEN">
        {children}
      </a>
    ) : (
      <a href={href}>{children}</a>
    ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}

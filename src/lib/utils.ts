import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// scroll to element
export function scrollTo(element: Element | null) {
  if (!element) return;

  // centering a section taller than the viewport lands mid-content, so align its top instead
  const tall = element.getBoundingClientRect().height > window.innerHeight;

  element.scrollIntoView({
    behavior: "smooth",
    block: tall ? "start" : "center",
    inline: "center",
  });
}

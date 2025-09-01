interface Bookmarks {
  id: string;
  category?: string;
  url: string;
  href: string;
  title: string;
  subtitle: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const bookmarks: Bookmarks[] = [
  {
    id: "link-1",
    category: "Open Source",
    url: "www.penpot.app",
    href: "https://penpot.app",
    title: "Penpot",
    subtitle: "Penpot is the open source UI design tool alternative to Figma - but better!",
    imageSrc: "/images/bookmarks/penpot.svg",
    imageAlt: "Penpot logo",
  },
  {
    id: "link-2",
    category: "Open Source",
    url: "www.leantime.io",
    href: "https://leantime.io",
    title: "Lean Time Productivity Tool",
    subtitle: "The open source productivity tool for people with ADHD.",
    imageSrc: "/images/bookmarks/leantime.png",
    imageAlt: "Lean Time Logo",
  },
  {
    id: "link-3",
    category: "Open Source",
    url: "www.deno.com",
    href: "https://deno.com",
    title: "Deno",
    subtitle: "The JavaScript runtime and successor to Node.",
    imageSrc: "/images/bookmarks/deno.svg",
    imageAlt: "Deno Logo",
  },
  {
    id: "link-4",
    category: "Open Source",
    url: "www.fresh.deno.dev",
    href: "https://fresh.deno.dev",
    title: "Fresh",
    subtitle: "The fullstack framework for the Deno JavaScript runtime.",
    imageSrc: "/images/bookmarks/deno-fresh.svg",
    imageAlt: "Fresh Logo",
  }
]
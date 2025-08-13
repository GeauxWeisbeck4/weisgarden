export type NavbarLink = {
  path: string;
  title: string;
};

const navbarLinks: NavbarLink[] = [
  { path: "/about", title: "About" },
  { path: "/notes", title: "Notes" },
  { path: "/posts", title: "Posts" },
  { path: "/projects", title: "Projects" },
  { path: "/links", title: "Links" },
  { path: "/support", title: "Support" }
];

export default navbarLinks;
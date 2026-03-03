export const SITE = {
  website: "https://blog.varadrane.com/",
  author: "Varad Rane",
  profile: "https://varadrane.com/",
  desc: "A software engineer writing about projects, engineering, and everything in between.",
  title: "Varad Rane",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/varadrane7/blog/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "America/New_York",
} as const;

// Site configuration
export const SITE_CONFIG = {
  title: "Sakura_re",
  description: "沉淪在無盡的深淵中...",
  author: "bymoye",
  url: "https://nazo-prism.vercel.app",
  
  // Navigation links
  navigation: [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Users", href: "/users" },
  ],
  
  // Social links
  social: {
    github: "https://github.com/bymoye",
    twitter: "https://twitter.com/bymoye",
  },
  
  // Background images API
  backgroundApi: {
    endpoint: "https://api.nmxc.ltd/randimg",
    fallbackImages: [
      "https://fp1.fghrsh.net/2020/01/14/7249e2902b45b4620019519a82db1d2e.jpg!q80.webp",
      "https://fp1.fghrsh.net/2020/01/14/bb445e2a101bbf5a4ca017782dd73b89.jpg!q80.webp",
      "https://fp1.fghrsh.net/2020/01/14/4939be2513c620c6c15b057b3137307e.jpg!q80.webp",
    ]
  },
  
  // Avatar
  avatar: "https://www.nazo.run/wp-content/uploads/2022/03/illust_65428259_20171016_002622-scaled-e1648370671156.jpg",
};

// Article type definition
export interface Article {
  id: number;
  title: string;
  time: string;
  content: string;
  category: string;
  url: string;
  cover: string;
  slug?: string;
}

// Sample articles data
export const SAMPLE_ARTICLES: Article[] = [
  {
    id: 1,
    url: "https://www.baidu.com",
    title: "百度",
    time: "2021-01-01",
    content: "百度一下，你就知道",
    category: "搜索引擎",
    cover: "https://fp1.fghrsh.net/2020/01/14/7249e2902b45b4620019519a82db1d2e.jpg!q80.webp",
  },
  {
    id: 2,
    url: "https://www.google.com",
    title: "谷歌",
    time: "2021-01-01",
    content: "谷歌一下，你就知道",
    category: "搜索引擎",
    cover: "https://fp1.fghrsh.net/2020/01/14/7249e2902b45b4620019519a82db1d2e.jpg!q80.webp",
  },
];

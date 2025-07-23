// Site configuration
export const SITE_CONFIG = {
  title: 'NazoPrism',
  description: '沉淪在無盡的深淵中...',
  author: 'bymoye',
  url: 'https://nazo-prism.vercel.app',

  // Navigation links
  navigation: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Users', href: '/users' },
  ],

  // Social links
  social: {
    github: 'https://github.com/bymoye',
    twitter: 'https://twitter.com/bymoye',
  },

  // Background images API
  backgroundApi: {
    endpoint: 'https://api.nmxc.ltd/randimg',
    fallbackImages: [
      'https://fp1.fghrsh.net/2020/01/14/7249e2902b45b4620019519a82db1d2e.jpg!q80.webp',
      'https://fp1.fghrsh.net/2020/01/14/bb445e2a101bbf5a4ca017782dd73b89.jpg!q80.webp',
      'https://fp1.fghrsh.net/2020/01/14/4939be2513c620c6c15b057b3137307e.jpg!q80.webp',
    ],
  },

  // Avatar
  avatar:
    'https://www.nazo.run/wp-content/uploads/2022/03/illust_65428259_20171016_002622-scaled-e1648370671156.jpg',
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
  author: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  pinned: boolean;
  slug?: string;
}

// Extended Article interface with additional fields
export interface ExtendedArticle extends Article {
}

// Sample articles data - 30 test articles
export const SAMPLE_ARTICLES: ExtendedArticle[] = [
  {
    id: 1,
    url: '/articles/modern-web-development',
    title: '现代Web开发的最佳实践',
    time: '2024-01-15',
    content: '探索现代Web开发中的最新技术栈和最佳实践，包括React、Vue、TypeScript等前沿技术的应用。',
    category: '前端开发',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20web%20development%20coding%20screen%20with%20colorful%20syntax%20highlighting%20clean%20minimalist%20style&image_size=landscape_16_9',
    author: 'NazoPrism',
    readTime: '8分钟',
    tags: ['React', 'TypeScript', 'Web开发'],
    excerpt: '深入理解现代Web开发的核心概念和实践方法，助你构建高质量的Web应用。',
    pinned: true
  },
  {
    id: 2,
    url: '/articles/material-design-3-guide',
    title: 'Material Design 3 设计指南',
    time: '2024-01-12',
    content: 'Material Design 3的完整设计指南，包括颜色系统、组件设计和交互原则。',
    category: 'UI设计',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=material%20design%203%20interface%20colorful%20modern%20ui%20components%20clean%20geometric%20shapes&image_size=landscape_16_9',
    author: 'Design Team',
    readTime: '12分钟',
    tags: ['Material Design', 'UI设计', '用户体验'],
    excerpt: '全面解析Material Design 3的设计理念和实现方法，打造现代化的用户界面。',
    pinned: true
  },
  {
    id: 3,
    url: '/articles/typescript-advanced-features',
    title: 'TypeScript 高级特性深度解析',
    time: '2024-01-10',
    content: '深入探讨TypeScript的高级特性，包括泛型、装饰器、模块系统等核心概念。',
    category: '编程语言',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=typescript%20code%20editor%20with%20type%20annotations%20blue%20theme%20professional%20coding%20environment&image_size=landscape_16_9',
    author: 'Tech Writer',
    readTime: '15分钟',
    tags: ['TypeScript', '编程', '类型系统'],
    excerpt: '掌握TypeScript的高级特性，提升代码质量和开发效率。',
    pinned: false
  },
  {
    id: 4,
    url: '/articles/css-grid-flexbox-mastery',
    title: 'CSS Grid 与 Flexbox 布局精通',
    time: '2024-01-08',
    content: '全面掌握CSS Grid和Flexbox布局技术，构建响应式和灵活的网页布局。',
    category: 'CSS',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=css%20grid%20layout%20visualization%20colorful%20geometric%20boxes%20modern%20web%20design&image_size=landscape_16_9',
    author: 'CSS Expert',
    readTime: '10分钟',
    tags: ['CSS', '布局', '响应式设计'],
    excerpt: '深入理解现代CSS布局技术，创建美观且功能强大的网页布局。',
    pinned: false
  },
  {
    id: 5,
    url: '/articles/astro-static-site-generation',
    title: 'Astro 静态站点生成器完全指南',
    time: '2024-01-05',
    content: '探索Astro框架的强大功能，学习如何构建高性能的静态网站。',
    category: '框架技术',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=astro%20framework%20space%20theme%20static%20site%20generation%20modern%20web%20technology&image_size=landscape_16_9',
    author: 'Astro Team',
    readTime: '14分钟',
    tags: ['Astro', 'SSG', '性能优化'],
    excerpt: '了解Astro框架的核心概念和最佳实践，构建快速的静态网站。',
    pinned: false
  },
  {
    id: 6,
    url: '/articles/javascript-performance-optimization',
    title: 'JavaScript 性能优化实战',
    time: '2024-01-03',
    content: 'JavaScript性能优化的实用技巧和策略，提升应用程序的运行效率。',
    category: '性能优化',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=javascript%20performance%20optimization%20speed%20charts%20code%20analysis%20professional&image_size=landscape_16_9',
    author: 'Performance Expert',
    readTime: '11分钟',
    tags: ['JavaScript', '性能', '优化'],
    excerpt: '掌握JavaScript性能优化的核心技术，让你的应用运行更快。',
    pinned: false
  },
  {
    id: 7,
    url: '/articles/responsive-design-principles',
    title: '响应式设计原则与实践',
    time: '2024-01-01',
    content: '响应式设计的核心原则和实现方法，适配各种设备和屏幕尺寸。',
    category: '响应式设计',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=responsive%20web%20design%20multiple%20devices%20mobile%20tablet%20desktop%20modern%20interface&image_size=landscape_16_9',
    author: 'UX Designer',
    readTime: '9分钟',
    tags: ['响应式', '移动端', 'UX设计'],
    excerpt: '学习响应式设计的最佳实践，创建适配所有设备的用户体验。',
    pinned: false
  },
  {
    id: 8,
    url: '/articles/web-accessibility-guide',
    title: 'Web 无障碍设计完整指南',
    time: '2023-12-28',
    content: 'Web无障碍设计的重要性和实现方法，让网站对所有用户都友好。',
    category: '无障碍设计',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=web%20accessibility%20inclusive%20design%20universal%20access%20friendly%20interface&image_size=landscape_16_9',
    author: 'Accessibility Expert',
    readTime: '13分钟',
    tags: ['无障碍', '包容性设计', 'WCAG'],
    excerpt: '构建包容性的Web体验，确保所有用户都能轻松访问你的网站。',
    pinned: false
  },
  {
    id: 9,
    url: '/articles/progressive-web-apps',
    title: '渐进式Web应用开发指南',
    time: '2023-12-25',
    content: 'PWA开发的完整指南，创建类似原生应用的Web体验。',
    category: 'PWA',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=progressive%20web%20app%20mobile%20interface%20app%20like%20experience%20modern%20technology&image_size=landscape_16_9',
    author: 'PWA Developer',
    readTime: '16分钟',
    tags: ['PWA', '移动开发', 'Service Worker'],
    excerpt: '掌握PWA开发技术，为用户提供原生应用般的Web体验。',
    pinned: false
  },
  {
    id: 10,
    url: '/articles/api-design-best-practices',
    title: 'API 设计最佳实践',
    time: '2023-12-22',
    content: 'RESTful API设计的最佳实践和常见模式，构建可维护的API。',
    category: 'API设计',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=api%20design%20rest%20endpoints%20data%20flow%20technical%20architecture%20diagram&image_size=landscape_16_9',
    author: 'Backend Developer',
    readTime: '12分钟',
    tags: ['API', 'REST', '后端开发'],
    excerpt: '学习API设计的核心原则，创建易用且可扩展的接口。',
    pinned: false
  },
  {
    id: 11,
    url: '/articles/database-optimization-techniques',
    title: '数据库优化技术详解',
    time: '2023-12-20',
    content: '数据库性能优化的实用技术和策略，提升查询效率。',
    category: '数据库',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=database%20optimization%20performance%20charts%20sql%20queries%20technical%20analysis&image_size=landscape_16_9',
    author: 'Database Expert',
    readTime: '14分钟',
    tags: ['数据库', 'SQL', '性能优化'],
    excerpt: '掌握数据库优化的核心技术，显著提升应用性能。',
    pinned: false
  },
  {
    id: 12,
    url: '/articles/microservices-architecture',
    title: '微服务架构设计与实践',
    time: '2023-12-18',
    content: '微服务架构的设计原则和实现方法，构建可扩展的分布式系统。',
    category: '架构设计',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=microservices%20architecture%20distributed%20system%20containers%20cloud%20technology&image_size=landscape_16_9',
    author: 'Architect',
    readTime: '18分钟',
    tags: ['微服务', '架构', '分布式系统'],
    excerpt: '深入理解微服务架构，构建现代化的分布式应用系统。',
    pinned: false
  },
  {
    id: 13,
    url: '/articles/docker-containerization-guide',
    title: 'Docker 容器化完全指南',
    time: '2023-12-15',
    content: 'Docker容器化技术的完整指南，从基础到高级应用。',
    category: 'DevOps',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=docker%20containers%20whale%20logo%20containerization%20technology%20blue%20theme&image_size=landscape_16_9',
    author: 'DevOps Engineer',
    readTime: '15分钟',
    tags: ['Docker', '容器化', 'DevOps'],
    excerpt: '学习Docker容器化技术，简化应用部署和管理流程。',
    pinned: false
  },
  {
    id: 14,
    url: '/articles/kubernetes-orchestration',
    title: 'Kubernetes 容器编排实战',
    time: '2023-12-12',
    content: 'Kubernetes容器编排平台的实战应用和最佳实践。',
    category: '容器编排',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=kubernetes%20orchestration%20cluster%20management%20cloud%20native%20technology&image_size=landscape_16_9',
    author: 'K8s Expert',
    readTime: '20分钟',
    tags: ['Kubernetes', '容器编排', '云原生'],
    excerpt: '掌握Kubernetes容器编排技术，管理大规模容器化应用。',
    pinned: false
  },
  {
    id: 15,
    url: '/articles/cloud-computing-fundamentals',
    title: '云计算基础与实践',
    time: '2023-12-10',
    content: '云计算的基本概念和主要服务模式，AWS、Azure、GCP对比。',
    category: '云计算',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cloud%20computing%20servers%20data%20centers%20digital%20transformation%20technology&image_size=landscape_16_9',
    author: 'Cloud Architect',
    readTime: '13分钟',
    tags: ['云计算', 'AWS', 'Azure'],
    excerpt: '了解云计算的核心概念，选择适合的云服务平台。',
    pinned: false
  },
  {
    id: 16,
    url: '/articles/cybersecurity-best-practices',
    title: '网络安全最佳实践指南',
    time: '2023-12-08',
    content: '网络安全的基本原则和防护策略，保护应用和数据安全。',
    category: '网络安全',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cybersecurity%20shield%20protection%20digital%20security%20lock%20technology&image_size=landscape_16_9',
    author: 'Security Expert',
    readTime: '11分钟',
    tags: ['网络安全', '数据保护', '安全策略'],
    excerpt: '学习网络安全的核心知识，构建安全可靠的应用系统。',
    pinned: false
  },
  {
    id: 17,
    url: '/articles/machine-learning-introduction',
    title: '机器学习入门指南',
    time: '2023-12-05',
    content: '机器学习的基本概念和常用算法，AI技术的实际应用。',
    category: '人工智能',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=machine%20learning%20neural%20networks%20ai%20algorithms%20data%20science%20technology&image_size=landscape_16_9',
    author: 'AI Researcher',
    readTime: '17分钟',
    tags: ['机器学习', 'AI', '数据科学'],
    excerpt: '探索机器学习的奇妙世界，了解AI技术的实际应用。',
    pinned: false
  },
  {
    id: 18,
    url: '/articles/data-visualization-techniques',
    title: '数据可视化技术与工具',
    time: '2023-12-03',
    content: '数据可视化的设计原则和实现工具，让数据更直观易懂。',
    category: '数据可视化',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=data%20visualization%20charts%20graphs%20colorful%20analytics%20dashboard&image_size=landscape_16_9',
    author: 'Data Analyst',
    readTime: '10分钟',
    tags: ['数据可视化', '图表', '分析'],
    excerpt: '掌握数据可视化技术，让复杂数据变得清晰易懂。',
    pinned: false
  },
  {
    id: 19,
    url: '/articles/blockchain-technology-overview',
    title: '区块链技术概览与应用',
    time: '2023-12-01',
    content: '区块链技术的基本原理和实际应用场景，去中心化的未来。',
    category: '区块链',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=blockchain%20technology%20cryptocurrency%20digital%20chain%20decentralized%20network&image_size=landscape_16_9',
    author: 'Blockchain Expert',
    readTime: '16分钟',
    tags: ['区块链', '加密货币', '去中心化'],
    excerpt: '了解区块链技术的核心概念和革命性应用潜力。',
    pinned: false
  },
  {
    id: 20,
    url: '/articles/iot-internet-of-things',
    title: '物联网技术与智能设备',
    time: '2023-11-28',
    content: '物联网技术的发展现状和未来趋势，连接万物的智能世界。',
    category: '物联网',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=internet%20of%20things%20iot%20connected%20devices%20smart%20home%20technology&image_size=landscape_16_9',
    author: 'IoT Developer',
    readTime: '12分钟',
    tags: ['物联网', '智能设备', '连接技术'],
    excerpt: '探索物联网的无限可能，构建智能互联的数字世界。',
    pinned: false
  },
  {
    id: 21,
    url: '/articles/agile-development-methodology',
    title: '敏捷开发方法论实践',
    time: '2023-11-25',
    content: '敏捷开发的核心理念和实践方法，提升团队协作效率。',
    category: '项目管理',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=agile%20development%20scrum%20team%20collaboration%20project%20management&image_size=landscape_16_9',
    author: 'Scrum Master',
    readTime: '9分钟',
    tags: ['敏捷开发', 'Scrum', '团队协作'],
    excerpt: '学习敏捷开发方法，提升项目交付质量和团队效率。',
    pinned: false
  },
  {
    id: 22,
    url: '/articles/version-control-git-mastery',
    title: 'Git 版本控制系统精通',
    time: '2023-11-22',
    content: 'Git版本控制的高级技巧和最佳实践，团队协作必备技能。',
    category: '版本控制',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=git%20version%20control%20branching%20code%20collaboration%20development%20workflow&image_size=landscape_16_9',
    author: 'Git Expert',
    readTime: '11分钟',
    tags: ['Git', '版本控制', '团队协作'],
    excerpt: '掌握Git的高级功能，提升代码管理和团队协作效率。',
    pinned: false
  },
  {
    id: 23,
    url: '/articles/testing-strategies-automation',
    title: '软件测试策略与自动化',
    time: '2023-11-20',
    content: '软件测试的策略和自动化实践，确保代码质量和可靠性。',
    category: '软件测试',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=software%20testing%20automation%20quality%20assurance%20bug%20detection&image_size=landscape_16_9',
    author: 'QA Engineer',
    readTime: '13分钟',
    tags: ['软件测试', '自动化', '质量保证'],
    excerpt: '建立完善的测试体系，确保软件质量和用户体验。',
    pinned: false
  },
  {
    id: 24,
    url: '/articles/code-review-best-practices',
    title: '代码审查最佳实践',
    time: '2023-11-18',
    content: '代码审查的重要性和实施方法，提升代码质量和团队技能。',
    category: '代码质量',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=code%20review%20collaboration%20quality%20improvement%20team%20development&image_size=landscape_16_9',
    author: 'Senior Developer',
    readTime: '8分钟',
    tags: ['代码审查', '代码质量', '团队协作'],
    excerpt: '建立有效的代码审查流程，持续提升代码质量。',
    pinned: false
  },
  {
    id: 25,
    url: '/articles/clean-code-principles',
    title: '整洁代码编写原则',
    time: '2023-11-15',
    content: '整洁代码的编写原则和实践方法，提升代码可读性和维护性。',
    category: '编程规范',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=clean%20code%20programming%20best%20practices%20readable%20maintainable%20code&image_size=landscape_16_9',
    author: 'Code Craftsman',
    readTime: '10分钟',
    tags: ['整洁代码', '编程规范', '代码质量'],
    excerpt: '学习整洁代码的核心原则，编写易读易维护的高质量代码。',
    pinned: false
  },
  {
    id: 26,
    url: '/articles/design-patterns-implementation',
    title: '设计模式的实现与应用',
    time: '2023-11-12',
    content: '常用设计模式的实现方法和应用场景，提升代码设计能力。',
    category: '设计模式',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=design%20patterns%20software%20architecture%20code%20structure%20programming&image_size=landscape_16_9',
    author: 'Software Architect',
    readTime: '15分钟',
    tags: ['设计模式', '软件架构', '编程思想'],
    excerpt: '掌握经典设计模式，提升软件设计和架构能力。',
    pinned: false
  },
  {
    id: 27,
    url: '/articles/functional-programming-concepts',
    title: '函数式编程概念与实践',
    time: '2023-11-10',
    content: '函数式编程的核心概念和实践方法，不同的编程思维方式。',
    category: '编程范式',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=functional%20programming%20lambda%20functions%20mathematical%20concepts&image_size=landscape_16_9',
    author: 'FP Advocate',
    readTime: '14分钟',
    tags: ['函数式编程', '编程范式', 'Lambda'],
    excerpt: '探索函数式编程的优雅世界，学习不同的编程思维方式。',
    pinned: false
  },
  {
    id: 28,
    url: '/articles/mobile-app-development',
    title: '移动应用开发技术选型',
    time: '2023-11-08',
    content: '移动应用开发的技术选型和最佳实践，原生vs跨平台开发。',
    category: '移动开发',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20app%20development%20smartphone%20cross%20platform%20native%20apps&image_size=landscape_16_9',
    author: 'Mobile Developer',
    readTime: '12分钟',
    tags: ['移动开发', '跨平台', '原生应用'],
    excerpt: '了解移动应用开发的技术路线，选择最适合的开发方案。',
    pinned: false
  },
  {
    id: 29,
    url: '/articles/web-performance-monitoring',
    title: 'Web 性能监控与优化',
    time: '2023-11-05',
    content: 'Web应用性能监控的工具和方法，持续优化用户体验。',
    category: '性能监控',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=web%20performance%20monitoring%20analytics%20speed%20optimization%20dashboard&image_size=landscape_16_9',
    author: 'Performance Engineer',
    readTime: '11分钟',
    tags: ['性能监控', 'Web优化', '用户体验'],
    excerpt: '建立完善的性能监控体系，持续优化Web应用性能。',
    pinned: false
  },
  {
    id: 30,
    url: '/articles/future-of-web-development',
    title: 'Web 开发的未来趋势',
    time: '2023-11-03',
    content: 'Web开发技术的未来发展趋势和新兴技术，把握技术发展方向。',
    category: '技术趋势',
    cover: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=future%20web%20development%20emerging%20technologies%20innovation%20digital%20transformation&image_size=landscape_16_9',
    author: 'Tech Visionary',
    readTime: '13分钟',
    tags: ['技术趋势', 'Web未来', '创新技术'],
    excerpt: '展望Web开发的未来，了解即将改变行业的新兴技术。',
    pinned: false
  }
];

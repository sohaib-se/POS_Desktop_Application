export interface ServiceDetail {
  title: string;
  badge: string;
  heroDesc: string;
  bgImage: string;
  capabilities: {
    title: string;
    desc: string;
    tag: string;
  };
  card1: {
    icon: string;
    title: string;
    desc: string;
    stats: { val: string; label: string }[];
    watermark: string;
  };
  card2: {
    icon: string;
    title: string;
    desc: string;
  };
  card3: {
    icon: string;
    title: string;
    desc: string;
  };
  card4: {
    title: string;
    desc: string;
    bars: number[];
  };
  workflow: {
    title: string;
    desc: string;
    steps: {
      num: string;
      title: string;
      desc: string;
      active?: boolean;
    }[];
  };
  cta: {
    title: string;
    desc: string;
    btnText: string;
  };
}

export const STATIC_SERVICES_STRUCTURE: Record<string, ServiceDetail> = {
  'ai-solutions': {
    title: 'AI Solutions & Machine Learning',
    badge: 'Core Engineering Service',
    heroDesc:
      'Precision-engineered intelligence systems designed to scale with your ambition. We bridge the gap between academic theory and production-ready enterprise software through custom neural architectures and automated optimization.',
    bgImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCE-k2TmxG2qE19u_HQBzAcC04l4IEhClIPjRWO2HSPVF4ohxexdONFWbDdyvhPV9Wxp8UZlQHOR_T8Ug24jEEtH5t7Ih1MugoOWWPXXh1Zf6w66kLgMYrHAqnhVqK9TZcvQB2N1Afo4hk3Ckd0XRl2Udao1KkgjZOb9VityLQGpOaku0V5tQB9tjN8D-daVe4xwTtxUPfctcRPf1NXT2k5VmpCoKuwyb7V1jGEOV_bKau32fELmxSgzEwseSZbMO0do4EeGo9Aohw',
    capabilities: {
      title: 'Unmatched Technical Depth',
      desc: "Our AI implementations aren't just wrappers. We build the infrastructure that powers decisions.",
      tag: '01 // CAPABILITIES',
    },
    card1: {
      icon: 'neurology',
      title: 'Custom LLM Orchestration',
      desc: 'Fine-tuned models deployed on private infrastructure ensuring total data sovereignty and latency optimization for real-time applications.',
      stats: [
        { val: '99.9%', label: 'Accuracy Target' },
        { val: '< 50ms', label: 'Inference Lag' },
      ],
      watermark:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCmO6RX2Bd2kaY4bufSZ7vFz4GqHlP1HczXC0Q52uQpY4HMSFrEsHSeo8W-h65qgK-qWRGro7FXIJ-Uvj0BWFb82CuteW6gV6KixdoTSW_ZXwXarJzxhsw69oOkp2pcHYyC_j0IpMufcq6EBJyaAz9d2U4gM_yU6Zo46pb6pMeJa8XrR062x2LSkjYNlZKSvHHCOHXwjTayJuhU_zX25nh8FkJs0s8AJ6t2is26OnpQ-PB5oF5pre61NHoZoiJKbaq_AOCeCtu2c_Y',
    },
    card2: {
      icon: 'dataset',
      title: 'Data Pipeline Engineering',
      desc: 'Robust ETL processes that transform raw noise into high-fidelity training signals.',
    },
    card3: {
      icon: 'security',
      title: 'Ethical Guardrails',
      desc: 'Built-in bias detection and alignment protocols to ensure safe enterprise deployment.',
    },
    card4: {
      title: 'Predictive Analytics',
      desc: 'Move from reactive to proactive with time-series forecasting and anomaly detection algorithms tuned to your business vertical.',
      bars: [20, 45, 30, 60, 85, 95],
    },
    workflow: {
      title: 'The Engineering Workflow',
      desc: 'A transparent, rigorous process designed for precision and predictability.',
      steps: [
        { num: '01', title: 'Discovery', desc: 'Deep technical audit of data assets and business logic requirements.' },
        { num: '02', title: 'Prototyping', desc: 'Rapid model validation using small-scale sandboxed environments.' },
        { num: '03', title: 'Architecture', desc: 'Full-scale system design and infrastructure provisioning.', active: true },
        { num: '04', title: 'Deployment', desc: 'Integration into production workflows with zero-downtime CI/CD.' },
        { num: '05', title: 'Optimization', desc: 'Continuous monitoring and reinforcement learning loops.' },
      ],
    },
    cta: {
      title: 'Ready to Build the Future?',
      desc: "Let's discuss how our AI solutions can integrate into your current ecosystem. Our engineers are ready to solve your most complex data challenges.",
      btnText: 'Book Free Consultation',
    },
  },

  'web-development': {
    title: 'Web Development',
    badge: 'Core Engineering Service',
    heroDesc: 'High-performance websites and web applications built for reliability, clarity, and scalable digital growth.',
    bgImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCE-k2TmxG2qE19u_HQBzAcC04l4IEhClIPjRWO2HSPVF4ohxexdONFWbDdyvhPV9Wxp8UZlQHOR_T8Ug24jEEtH5t7Ih1MugoOWWPXXh1Zf6w66kLgMYrHAqnhVqK9TZcvQB2N1Afo4hk3Ckd0XRl2Udao1KkgjZOb9VityLQGpOaku0V5tQB9tjN8D-daVe4xwTtxUPfctcRPf1NXT2k5VmpCoKuwyb7V1jGEOV_bKau32fELmxSgzEwseSZbMO0do4EeGo9Aohw',
    capabilities: {
      title: 'Built for Performance',
      desc: 'We develop web products that are fast, maintainable, and ready to evolve as your needs change.',
      tag: '01 // CAPABILITIES',
    },
    card1: {
      icon: 'code',
      title: 'Custom Web Applications',
      desc: 'Business platforms, dashboards, and operational tools tailored to your requirements.',
      stats: [
        { val: 'Fast', label: 'Load Times' },
        { val: 'Stable', label: 'Architecture' },
      ],
      watermark:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDq2mN4qR8tD1pF5yH8kW0aG3sL7vC2mN4qR8tD1pF5yH8kW0aG3sL7vC2mN4qR8tD1pF5yH8kW0aG3sL7vC2mN4qR8tD1pF5yH8kW0aG3sL7vC2mN4qR8',
    },
    card2: {
      icon: 'shopping_cart',
      title: 'E-commerce Solutions',
      desc: 'Stores built to convert, scale, and integrate cleanly with your operations.',
    },
    card3: {
      icon: 'dns',
      title: 'CMS Development',
      desc: 'Editable content systems that keep your site flexible without adding complexity.',
    },
    card4: {
      title: 'API Integration & Development',
      desc: 'We connect your web platform to the tools and services your business relies on.',
      bars: [23, 41, 29, 59, 83, 95],
    },
    workflow: {
      title: 'The Web Workflow',
      desc: 'A delivery model that balances design quality, technical depth, and release stability.',
      steps: [
        { num: '01', title: 'Discovery', desc: 'We define the business and technical scope.' },
        { num: '02', title: 'Planning', desc: 'We map information architecture and priorities.' },
        { num: '03', title: 'Development', desc: 'We build the front end, back end, and integrations.', active: true },
        { num: '04', title: 'Testing', desc: 'We verify performance, accessibility, and reliability.' },
        { num: '05', title: 'Launch', desc: 'We deploy and support the release process.' },
      ],
    },
    cta: {
      title: 'Ready to build your next web product?',
      desc: 'Let’s create a website or application that is fast, dependable, and aligned with your business goals.',
      btnText: 'Book Free Consultation',
    },
  },

  'custom-software': {
    title: 'Custom Software Development',
    badge: 'Core Engineering Service',
    heroDesc:
      'Tailor-made solutions designed around your exact workflows, team structure, and business goals. We build software that fits your operation instead of forcing your operation to fit the software.',
    bgImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCE-k2TmxG2qE19u_HQBzAcC04l4IEhClIPjRWO2HSPVF4ohxexdONFWbDdyvhPV9Wxp8UZlQHOR_T8Ug24jEEtH5t7Ih1MugoOWWPXXh1Zf6w66kLgMYrHAqnhVqK9TZcvQB2N1Afo4hk3Ckd0XRl2Udao1KkgjZOb9VityLQGpOaku0V5tQB9tjN8D-daVe4xwTtxUPfctcRPf1NXT2k5VmpCoKuwyb7V1jGEOV_bKau32fELmxSgzEwseSZbMO0do4EeGo9Aohw',
    capabilities: {
      title: 'Built for Complex Operations',
      desc: 'Our software work focuses on reliability, maintainability, and clean integration with the systems you already use.',
      tag: '01 // CAPABILITIES',
    },
    card1: {
      icon: 'build',
      title: 'Enterprise Software Systems',
      desc: 'We design and build core business applications that centralize operations, improve visibility, and support long-term growth.',
      stats: [
        { val: '24/7', label: 'Operational Support' },
        { val: '100%', label: 'Custom Fit' },
      ],
      watermark:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD6xK9s8P3vYpW6VYB9FQF4v7r3m9mD3wU8r7kQxYl4mB1Xc2nWZq9w2Q1u1o6wW5k9mW5qj7T1vLx1p9fU6cU5O8gH7q7f2cM4vL0L8g8R1F5mW2x0J0c5Xc4t7V8sQy4tQ1c2wQ',
    },
    card2: {
      icon: 'dataset',
      title: 'SaaS Product Development',
      desc: 'Subscription platforms built for scale, performance, and product evolution.',
    },
    card3: {
      icon: 'history',
      title: 'Legacy Modernization',
      desc: 'We refactor and modernize older systems without disrupting the business processes that depend on them.',
    },
    card4: {
      title: 'Workflow Automation',
      desc: 'Reduce manual work and remove bottlenecks with custom automation logic, approvals, and operational dashboards.',
      bars: [22, 40, 28, 58, 82, 94],
    },
    workflow: {
      title: 'The Delivery Workflow',
      desc: 'A structured process built to reduce risk and keep delivery predictable.',
      steps: [
        { num: '01', title: 'Discovery', desc: 'We map business goals, constraints, and system requirements.' },
        { num: '02', title: 'Prototyping', desc: 'We validate the solution early with interactive prototypes.' },
        { num: '03', title: 'Architecture', desc: 'We define maintainable technical foundations and integrations.', active: true },
        { num: '04', title: 'Deployment', desc: 'We launch with stable release management and migration support.' },
        { num: '05', title: 'Optimization', desc: 'We refine the product through feedback and performance tuning.' },
      ],
    },
    cta: {
      title: 'Ready to build the right software?',
      desc: 'Let’s discuss how a custom system can streamline your operations and support your next stage of growth.',
      btnText: 'Book Free Consultation',
    },
  },

  'digital-marketing': {
    title: 'Digital Marketing',
    badge: 'Core Engineering Service',
    heroDesc:
      'Performance-focused campaigns designed to increase visibility, traffic, and conversions across the channels that matter most to your business.',
    bgImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCE-k2TmxG2qE19u_HQBzAcC04l4IEhClIPjRWO2HSPVF4ohxexdONFWbDdyvhPV9Wxp8UZlQHOR_T8Ug24jEEtH5t7Ih1MugoOWWPXXh1Zf6w66kLgMYrHAqnhVqK9TZcvQB2N1Afo4hk3Ckd0XRl2Udao1KkgjZOb9VityLQGpOaku0V5tQB9tjN8D-daVe4xwTtxUPfctcRPf1NXT2k5VmpCoKuwyb7V1jGEOV_bKau32fELmxSgzEwseSZbMO0do4EeGo9Aohw',
    capabilities: {
      title: 'Growth That’s Measured',
      desc: 'We combine creative execution with clear analytics so every campaign has a measurable purpose.',
      tag: '01 // CAPABILITIES',
    },
    card1: {
      icon: 'search',
      title: 'SEO Strategy',
      desc: 'Technical and content-driven search optimization built to improve rankings and attract high-intent visitors.',
      stats: [
        { val: '3x', label: 'Visibility Goal' },
        { val: 'ROI', label: 'Focused Growth' },
      ],
      watermark:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDrk5E4mP8xT6sJ2qN9vM3bR1tQ6uP8xM4nK9sT2vY7hJ5mR3wD8fL1qC6pH9sN2tV4yJ7kP0mS5rB8nL3qT6wD1fG4hK7zP2cM9vR5xT8yJ1mQ4n',
    },
    card2: {
      icon: 'ads_click',
      title: 'PPC Campaigns',
      desc: 'Targeted paid media built for immediate traffic and conversion lift.',
    },
    card3: {
      icon: 'groups',
      title: 'Social Media Management',
      desc: 'Brand-first content and community execution across the channels your audience uses most.',
    },
    card4: {
      title: 'Content Marketing',
      desc: 'Strategic content plans that educate prospects, build trust, and support conversion across the funnel.',
      bars: [24, 42, 34, 62, 86, 92],
    },
    workflow: {
      title: 'The Campaign Workflow',
      desc: 'A repeatable process that keeps strategy, execution, and optimization aligned.',
      steps: [
        { num: '01', title: 'Discovery', desc: 'We define audience segments, goals, and current performance gaps.' },
        { num: '02', title: 'Planning', desc: 'We shape the channel mix, messaging, and campaign structure.' },
        { num: '03', title: 'Launch', desc: 'We deploy campaigns with tracking and conversion instrumentation.', active: true },
        { num: '04', title: 'Optimization', desc: 'We refine bids, content, and targeting using live data.' },
        { num: '05', title: 'Reporting', desc: 'We share clear performance insights and next actions.' },
      ],
    },
    cta: {
      title: 'Ready to grow your reach?',
      desc: 'Let’s build a marketing system that drives traffic, leads, and real business outcomes.',
      btnText: 'Book Free Consultation',
    },
  },

  'mobile-app': {
    title: 'Mobile App Development',
    badge: 'Core Engineering Service',
    heroDesc: 'Native and cross-platform mobile experiences that feel fast, intuitive, and reliable across every major device ecosystem.',
    bgImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCE-k2TmxG2qE19u_HQBzAcC04l4IEhClIPjRWO2HSPVF4ohxexdONFWbDdyvhPV9Wxp8UZlQHOR_T8Ug24jEEtH5t7Ih1MugoOWWPXXh1Zf6w66kLgMYrHAqnhVqK9TZcvQB2N1Afo4hk3Ckd0XRl2Udao1KkgjZOb9VityLQGpOaku0V5tQB9tjN8D-daVe4xwTtxUPfctcRPf1NXT2k5VmpCoKuwyb7V1jGEOV_bKau32fELmxSgzEwseSZbMO0do4EeGo9Aohw',
    capabilities: {
      title: 'Built for Modern Devices',
      desc: 'We create mobile products that are designed for performance, usability, and long-term maintainability.',
      tag: '01 // CAPABILITIES',
    },
    card1: {
      icon: 'phone_iphone',
      title: 'iOS & Android Apps',
      desc: 'High-quality native experiences for both major platforms with consistent functionality and polish.',
      stats: [
        { val: 'Native', label: 'Platform Quality' },
        { val: 'Fast', label: 'User Experience' },
      ],
      watermark:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDqP9nL2vH7mK4sR1tY6wJ3pF8nC5vM2qT7rD1pF5yH8kW0aG3sL7vC2mN4qR8tD1pF5yH8kW0aG3sL7vC2mN4qR8tD1pF5yH8kW0aG3sL7vC2mN4qR8',
    },
    card2: {
      icon: 'devices',
      title: 'Cross-Platform Delivery',
      desc: 'Shared-code app builds for efficient launches without sacrificing user quality.',
    },
    card3: {
      icon: 'design_services',
      title: 'Mobile UI/UX Design',
      desc: 'Interfaces optimized for touch, speed, accessibility, and retention.',
    },
    card4: {
      title: 'App Store Ready',
      desc: 'We handle the product details that matter during release, from QA to launch preparation and store submission.',
      bars: [18, 36, 30, 58, 84, 96],
    },
    workflow: {
      title: 'The App Workflow',
      desc: 'A focused delivery process that keeps product, design, and engineering aligned.',
      steps: [
        { num: '01', title: 'Discovery', desc: 'We define the product goals and technical requirements.' },
        { num: '02', title: 'Prototyping', desc: 'We validate screens and flows before development starts.' },
        { num: '03', title: 'Build', desc: 'We develop the app with scalable and maintainable code.', active: true },
        { num: '04', title: 'Launch', desc: 'We prepare for release and deployment to app stores.' },
        { num: '05', title: 'Iteration', desc: 'We improve the product using usage data and feedback.' },
      ],
    },
    cta: {
      title: 'Ready to launch your app?',
      desc: 'Let’s design and build a mobile experience that your customers will actually want to use.',
      btnText: 'Book Free Consultation',
    },
  },

  'ui-ux': {
    title: 'UI/UX Design',
    badge: 'Core Engineering Service',
    heroDesc: 'Intuitive interfaces and thoughtful product experiences that make complex systems feel simple, clear, and enjoyable to use.',
    bgImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCE-k2TmxG2qE19u_HQBzAcC04l4IEhClIPjRWO2HSPVF4ohxexdONFWbDdyvhPV9Wxp8UZlQHOR_T8Ug24jEEtH5t7Ih1MugoOWWPXXh1Zf6w66kLgMYrHAqnhVqK9TZcvQB2N1Afo4hk3Ckd0XRl2Udao1KkgjZOb9VityLQGpOaku0V5tQB9tjN8D-daVe4xwTtxUPfctcRPf1NXT2k5VmpCoKuwyb7V1jGEOV_bKau32fELmxSgzEwseSZbMO0do4EeGo9Aohw',
    capabilities: {
      title: 'Design That Moves Users',
      desc: 'We translate research and product goals into interfaces that are clear, usable, and polished.',
      tag: '01 // CAPABILITIES',
    },
    card1: {
      icon: 'palette',
      title: 'User Research & Strategy',
      desc: 'We start with the people using your product, then shape the experience around their needs and expectations.',
      stats: [
        { val: 'Research', label: 'Driven' },
        { val: 'Clarity', label: 'First' },
      ],
      watermark:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDq7mN3vT1pF5yH8kW0aG3sL7vC2mN4qR8tD1pF5yH8kW0aG3sL7vC2mN4qR8tD1pF5yH8kW0aG3sL7vC2mN4qR8tD1pF5yH8kW0aG3sL7vC2mN4qR8',
    },
    card2: {
      icon: 'vector_pen',
      title: 'Visual Design',
      desc: 'Clean, high-fidelity screens that reinforce your brand and guide action.',
    },
    card3: {
      icon: 'edit_square',
      title: 'Wireframing',
      desc: 'Early structure and layout decisions that make the final product easier to build and use.',
    },
    card4: {
      title: 'Usability Testing',
      desc: 'We validate interaction patterns and refine friction points before launch so the experience feels natural.',
      bars: [20, 38, 33, 56, 80, 90],
    },
    workflow: {
      title: 'The Design Workflow',
      desc: 'A collaborative process that keeps product thinking and interface craft aligned.',
      steps: [
        { num: '01', title: 'Discovery', desc: 'We understand the audience, problem, and product context.' },
        { num: '02', title: 'Wireframes', desc: 'We define structure and flows before visual design begins.' },
        { num: '03', title: 'Visual Design', desc: 'We create polished, on-brand interface directions.', active: true },
        { num: '04', title: 'Prototyping', desc: 'We turn screens into interactive experiences for review.' },
        { num: '05', title: 'Handoff', desc: 'We prepare assets and specs for development teams.' },
      ],
    },
    cta: {
      title: 'Ready to improve your product experience?',
      desc: 'Let’s design interfaces that feel simple to use and strong enough to scale with your business.',
      btnText: 'Book Free Consultation',
    },
  },
};

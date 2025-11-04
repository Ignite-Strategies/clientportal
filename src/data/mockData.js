// BusinessPoint Law Proposal Data
// This structure matches the canonical proposal design and is ready for backend hydration

export const proposalData = {
  client: {
    name: "Joel Reeves",
    company: "BusinessPoint Law",
    contactEmail: "joel@businesspointlaw.com"
  },
  proposal: {
    dateIssued: "Nov 3, 2025",
    duration: "8 Weeks",
    total: 1500,
    currency: "USD",
    paymentStructure: "3 × $500 payments",
    status: "Active" // Options: "Draft", "Active", "Approved"
  },
  purpose: {
    headline: "To successfully onboard BusinessPoint Law into the Ignite Business Development ecosystem",
    description: "this proposal defines the foundational work, integrations, and enrichment steps that establish a scalable, automated growth workflow centered on legal services outreach and the CLE initiative.",
    whyThisMatters: [
      "Automates outreach and follow-up",
      "Creates measurable ROI via data enrichment",
      "Establishes an owned BD pipeline for BusinessPoint"
    ]
  },
  phases: [
    {
      id: 1,
      name: "Foundation",
      weeks: "1-3",
      color: "red",
      goal: "Build the strategic and creative foundation for BD success",
      deliverables: [
        "3 Target Personas",
        "6 Outreach Templates",
        "6 Event / CLE Plans (through Summer 2026)",
        "5 SEO Blog Posts on NDA & Contracts",
        "25-Slide CLE Deck: \"NDAs Demystified\"",
        "CLE Landing Page for Registration"
      ],
      outcome: "A working content and brand foundation that positions BusinessPoint Law as an expert in legal operations."
    },
    {
      id: 2,
      name: "Integrations",
      weeks: "4-5",
      color: "yellow",
      goal: "Connect BusinessPoint's Microsoft ecosystem to Ignite for automation",
      deliverables: [
        "Microsoft Graph OAuth setup (email + calendar)",
        "Teams Meeting Automation",
        "Hunter.io Enrichment Setup (~150 contacts)",
        "Contact Upload + Tagging",
        "Dedicated BusinessPoint Tenant Deployed"
      ],
      outcome: "An integrated system ready to track meetings, communications, and follow-ups natively."
    },
    {
      id: 3,
      name: "Enrichment",
      weeks: "6-8",
      color: "purple",
      goal: "Establish BD intelligence through clean, enriched data",
      deliverables: [
        "Parse LinkedIn / CSV Contact List",
        "Email Verification via Hunter.io",
        "Contact → Persona → Template Mapping",
        "Final Dataset + Campaign-Ready Lists"
      ],
      outcome: "A fully enriched BD pipeline—ready for outreach, analytics, and sustainment."
    }
  ],
  payments: [
    {
      id: 1,
      amount: 500,
      week: 1,
      trigger: "Kickoff",
      description: "Deposit + initial setup",
      status: "pending", // Options: "pending", "paid"
      dueDate: "Week 1"
    },
    {
      id: 2,
      amount: 500,
      week: 4,
      trigger: "Midpoint",
      description: "After integration completion",
      status: "pending",
      dueDate: "Week 4"
    },
    {
      id: 3,
      amount: 500,
      week: 8,
      trigger: "Completion",
      description: "Final delivery + handoff",
      status: "pending",
      dueDate: "Week 8"
    }
  ],
  timeline: [
    {
      week: 1,
      phase: "Foundation",
      phaseColor: "red",
      milestone: "Kickoff",
      deliverable: "Collect materials, define personas, seed contacts.",
      phaseId: 1
    },
    {
      week: 2,
      phase: "Foundation",
      phaseColor: "red",
      milestone: "Personas/Templates",
      deliverable: "Deliver 3 personas + 3 draft email templates.",
      phaseId: 1
    },
    {
      week: 3,
      phase: "Foundation",
      phaseColor: "red",
      milestone: "CLE Development",
      deliverable: "Build 25-slide CLE deck; outline event calendar.",
      phaseId: 1
    },
    {
      week: 4,
      phase: "Integrations",
      phaseColor: "yellow",
      milestone: "Midpoint",
      deliverable: "Graph + Teams integrations online. Payment 2",
      phaseId: 2,
      paymentId: 2
    },
    {
      week: 5,
      phase: "Integrations",
      phaseColor: "yellow",
      milestone: "Data Flow QA",
      deliverable: "Hunter enrichment tested; data hydrated.",
      phaseId: 2
    },
    {
      week: 6,
      phase: "Enrichment",
      phaseColor: "purple",
      milestone: "Content/SEO",
      deliverable: "Publish blogs + CLE landing page.",
      phaseId: 3
    },
    {
      week: 7,
      phase: "Enrichment",
      phaseColor: "purple",
      milestone: "QA & Validation",
      deliverable: "Validate enriched contacts; test templates.",
      phaseId: 3
    },
    {
      week: 8,
      phase: "Enrichment",
      phaseColor: "purple",
      milestone: "Final Handoff",
      deliverable: "Demo and launch of active BD instance. Payment 3",
      phaseId: 3,
      paymentId: 3
    }
  ],
  cleInitiative: {
    title: "NDAs Demystified",
    description: "25-slide training deck and digital registration landing page.",
    value: "Drives leads, demonstrates expertise, fuels ongoing content creation.",
    deliverable: "25-Slide CLE Deck: \"NDAs Demystified\" + CLE Landing Page for Registration"
  }
};

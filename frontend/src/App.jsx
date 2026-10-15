
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Activity,
  BarChart3,
  Check,
  ChevronDown,
  CircleDot,
  FileSearch,
  Menu,
  Route,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./pages/Dashboard";

const gold = "#FFBE00";

const navLinks = [
  { label: "HOME", href: "/home" },
  { label: "INTELLIGENCE", href: "/intelligence" },
  { label: "ROUTES", href: "/routes" },
  { label: "EVIDENCE", href: "/evidence" },
  { label: "ABOUT", href: "/about" },
];

const capabilities = [
  {
    number: "01",
    title: "Know your true route cost.",
    description:
      "Calculate weekly freight cost per tonne-kilometre from freight cost, quantity in tonnes, and distance in kilometres.",
    icon: BarChart3,
    tag: "COST VISIBILITY",
  },
  {
    number: "02",
    title: "Catch the unusual early.",
    description:
      "Compare each route with up to eight previous full weeks and other routes of the same route type in the current week.",
    icon: TrendingUp,
    tag: "ANOMALY DETECTION",
  },
  {
    number: "03",
    title: "Demand evidence, not guesses.",
    description:
      "Match dated context notes to the route and verify that the note supports a cost impact before explaining an increase.",
    icon: FileSearch,
    tag: "EVIDENCE FIRST",
  },
];

const problems = [
  {
    no: "01",
    title: "Cost increases go unnoticed.",
    description:
      "Small changes across individual shipments can become difficult to identify when reviewed only at month end.",
  },
  {
    no: "02",
    title: "Comparisons lack context.",
    description:
      "Compare each route with its own previous eight full weeks and same-week peers sharing the same route type—not an unrelated network average.",
  },
  {
    no: "03",
    title: "Explanations lack proof.",
    description:
      "A plausible story is not evidence. A reason must be supported by a relevant context note for the route and time, with its exact note ID.",
  },
  {
    no: "04",
    title: "Reviews take too much effort.",
    description:
      "Bring route comparisons, cost exceptions, and supporting evidence together in one investigation workflow.",
  },
];

const workflow = [
  {
    no: "01",
    title: "Measure",
    description:
      "Group shipments by origin, destination, and route type; aggregate Monday–Sunday weeks and calculate cost per tonne-kilometre.",
  },
  {
    no: "02",
    title: "Compare",
    description:
      "Compare against the average of up to eight previous full weeks and the same-week average for other routes with the same route type.",
  },
  {
    no: "03",
    title: "Investigate",
    description:
      "Match context notes by route and date, cite the exact note ID, and leave the reason unexplained when evidence is insufficient.",
  },
];

function BrandMark({ dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
        <svg
          viewBox="0 0 36 36"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <path d="M5 22 18 9h5L10 22Z" fill={gold} />
          <path d="M11 28 24 15h5L16 28Z" fill={gold} />
          <path d="M18 28 29 17h3L21 28Z" fill="#20211F" />
        </svg>
      </div>

      <div>
        <div
          className={`text-[15px] font-extrabold tracking-[0.06em] sm:text-lg ${
            dark ? "text-[#20211F]" : "text-white"
          }`}
        >
          FREIGHT TIGER
        </div>

        <div
          className={`mt-0.5 text-[9px] font-medium tracking-[0.19em] ${
            dark ? "text-black/45" : "text-white/45"
          }`}
        >
          COST INTELLIGENCE
        </div>
      </div>
    </div>
  );
}

function NetworkArtwork() {
  const points = [
    [46, 190],
    [100, 115],
    [146, 162],
    [190, 72],
    [235, 124],
    [270, 183],
    [322, 92],
    [370, 146],
    [420, 55],
    [445, 200],
    [335, 235],
    [225, 240],
    [128, 255],
    [80, 310],
    [275, 320],
    [395, 300],
    [465, 275],
    [180, 355],
    [360, 375],
  ];

  const lines = [
    [0, 1], [0, 2], [0, 12], [1, 2], [1, 3], [1, 11],
    [2, 3], [2, 4], [2, 11], [2, 12], [3, 4], [3, 6],
    [3, 11], [4, 5], [4, 6], [4, 10], [4, 11], [5, 6],
    [5, 9], [5, 10], [6, 7], [6, 8], [6, 10], [7, 8],
    [7, 9], [7, 10], [8, 9], [9, 10], [9, 15], [9, 16],
    [10, 11], [10, 14], [10, 15], [11, 12], [11, 13],
    [11, 14], [12, 13], [12, 17], [13, 17], [14, 15],
    [14, 17], [14, 18], [15, 16], [15, 18], [16, 18],
    [17, 18], [5, 14], [1, 13], [7, 15],
  ];

  return (
    <div className="relative mx-auto w-full max-w-[550px]">
      <div className="absolute inset-0 rounded-full bg-[#FFBE00]/[0.06] blur-3xl" />

      <svg
        viewBox="0 0 510 410"
        className="relative w-full overflow-visible"
        role="img"
        aria-label="Illustrative network of connected freight routes"
      >
        <defs>
          <pattern
            id="network-dots"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="#FFBE00" opacity="0.32" />
          </pattern>

          <linearGradient
            id="network-fade"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="#FFBE00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFBE00" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <rect
          width="510"
          height="410"
          fill="url(#network-dots)"
          opacity="0.65"
        />

        {lines.map(([a, b], i) => (
          <line
            key={i}
            x1={points[a][0]}
            y1={points[a][1]}
            x2={points[b][0]}
            y2={points[b][1]}
            stroke="url(#network-fade)"
            strokeWidth={i % 4 === 0 ? 1.7 : 0.8}
          />
        ))}

        {points.map(([x, y], i) => (
          <g key={i}>
            {i % 3 === 0 && (
              <circle
                cx={x}
                cy={y}
                r="10"
                fill="#FFBE00"
                opacity="0.08"
              />
            )}

            <circle
              cx={x}
              cy={y}
              r={i % 3 === 0 ? 3 : 1.8}
              fill={i % 3 === 0 ? gold : "#FFE18A"}
            />
          </g>
        ))}

        <path
          d="M46 190 Q130 60 190 72 T322 92 T445 200 T335 235 T180 355"
          fill="none"
          stroke="#FFBE00"
          strokeWidth="2.2"
          strokeDasharray="5 8"
          opacity="0.8"
        />

        <circle
          cx="190"
          cy="72"
          r="6"
          fill="#171613"
          stroke={gold}
          strokeWidth="2"
        />

        <circle
          cx="445"
          cy="200"
          r="6"
          fill="#171613"
          stroke={gold}
          strokeWidth="2"
        />

        <circle
          cx="180"
          cy="355"
          r="6"
          fill="#171613"
          stroke={gold}
          strokeWidth="2"
        />
      </svg>

      <div className="absolute left-[15%] top-[15%] rounded border border-white/10 bg-[#22211D]/90 px-3 py-2 backdrop-blur">
        <p className="text-[8px] tracking-[0.16em] text-white/45">
          NETWORK
        </p>
        <p className="mt-1 text-xs font-semibold text-white">
          Route intelligence
        </p>
      </div>

      <div className="absolute bottom-[12%] right-[2%] rounded border border-[#FFBE00]/30 bg-[#22211D]/95 px-3 py-2">
        <p className="text-[8px] tracking-[0.16em] text-white/45">
          ANALYSIS
        </p>
        <p className="mt-1 flex items-center gap-2 text-xs text-[#FFBE00]">
          <Activity size={12} /> Evidence-led monitoring
        </p>
      </div>
    </div>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-t-[4px] border-t-[#FFBE00] bg-[#151512]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex min-h-[78px] max-w-[1600px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <a href="#home" aria-label="FreightTiger Cost Intelligence home">
          <BrandMark />
        </a>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="py-3 text-[10px] font-bold tracking-[0.12em] text-white/75 transition hover:text-[#FFBE00] xl:text-[11px]"
            >
              {link.label}
            </a>
          ))}
        </nav>

       <div className="flex items-center gap-3">
  <a
    href="/login"
    className="border border-white/20 px-5 py-3 text-xs font-bold tracking-wider text-white hover:bg-white/10"
  >
    LOGIN
  </a>

  <a
    href="/signup"
    className="border border-[#FFC400] bg-[#FFC400] px-5 py-3 text-xs font-bold tracking-wider text-black hover:bg-[#e8b300]"
  >
    SIGN UP
  </a>

  <a
    href="/dashboard"
    className="bg-[#33332F] px-5 py-3 text-xs font-bold tracking-wider text-white hover:bg-[#44443F]"
  >
    DASHBOARD
  </a>
</div>

        <button
          className="rounded-md border border-white/15 p-2.5 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 bg-[#1D1C18] px-6 py-3 lg:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-white/[0.07] py-3 text-xs font-semibold tracking-wider text-white/75 hover:text-[#FFBE00]"
            >
              {link.label}
            </a>
          ))}

          <a
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="block border-b border-white/[0.07] py-3 text-xs font-semibold tracking-wider text-white/75 hover:text-[#FFBE00]"
          >
            LOGIN
          </a>

          <a
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="block border-b border-white/[0.07] py-3 text-xs font-semibold tracking-wider text-white/75 hover:text-[#FFBE00]"
          >
            DASHBOARD
          </a>

          <a
            href="#routes"
            onClick={() => setMenuOpen(false)}
            className="mt-4 block rounded-sm bg-[#FFBE00] px-4 py-3 text-center text-xs font-bold text-black"
          >
            EXPLORE PRODUCT
          </a>
        </nav>
      )}
    </header>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <p
      className={`text-[10px] font-bold uppercase tracking-[0.19em] ${
        light ? "text-[#FFBE00]" : "text-[#8B7124]"
      }`}
    >
      {children}
    </p>
  );
}

function SectionTitle({ eyebrow, title, description, light = false }) {
  return (
    <div className="max-w-3xl">
      <Eyebrow light={light}>{eyebrow}</Eyebrow>

      <h2
        className={`mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl lg:text-[46px] ${
          light ? "text-white" : "text-[#24251F]"
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-4 max-w-2xl text-sm leading-7 ${
            light ? "text-white/60" : "text-[#72736C]"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function Hero() {
  return (
    <section
      id="home"
      className="relative scroll-mt-24 overflow-hidden bg-[#151512] text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(255,190,0,0.10),transparent_44%)]" />

      <div className="relative mx-auto grid min-h-[650px] max-w-[1600px] items-center gap-6 px-6 py-16 sm:px-10 lg:min-h-[710px] lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-20">
        <div className="relative z-10 max-w-[690px]">
          <div className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-3 py-2 text-[10px] font-medium text-white/70 sm:text-xs">
            <CircleDot size={13} className="text-[#FFBE00]" />
            SHIPPING COST INTELLIGENCE
          </div>

          <h1 className="mt-7 text-[42px] font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-[68px]">
            Understand your freight costs.
            <span className="mt-2 block text-[#FFBE00]">
              Discover why they change.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
            A smarter way to monitor route costs, spot unusual increases,
            compare performance, and investigate every exception with
            evidence you can verify.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-3 rounded-sm bg-[#FFBE00] px-5 py-4 text-[10px] font-extrabold tracking-[0.12em] text-[#151512] transition hover:bg-[#FFD34C]"
            >
              EXPLORE INTELLIGENCE <ArrowRight size={15} />
            </a>

            <a
              href="#intelligence"
              className="inline-flex items-center gap-3 rounded-sm border border-white/20 px-5 py-4 text-[10px] font-bold tracking-[0.12em] text-white transition hover:bg-white/10"
            >
              HOW IT WORKS <ArrowDownRight size={15} />
            </a>
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-3 border-t border-white/15 pt-6">
            <div className="pr-3">
              <p className="text-2xl font-semibold tracking-tight text-[#FFBE00]">
                8-week
              </p>
              <p className="mt-2 text-[10px] leading-5 text-white/55">
                Historical comparison
              </p>
            </div>

            <div className="border-l border-white/15 px-4">
              <p className="text-2xl font-semibold tracking-tight text-[#FFBE00]">
                Route
              </p>
              <p className="mt-2 text-[10px] leading-5 text-white/55">
                Level cost tracking
              </p>
            </div>

            <div className="border-l border-white/15 pl-4">
              <p className="text-2xl font-semibold tracking-tight text-[#FFBE00]">
                Proof
              </p>
              <p className="mt-2 text-[10px] leading-5 text-white/55">
                Evidence-led verdicts
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[570px]">
          <NetworkArtwork />
          <div className="relative mt-1 flex items-center justify-between border-t border-white/10 pt-4 text-[9px] tracking-[0.14em] text-white/40">
            <span>CONNECTED ROUTE NETWORK</span>
            <span>ILLUSTRATIVE VISUAL</span>
          </div>
        </div>
      </div>

      <a
        href="#industries"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[9px] tracking-[0.17em] text-white/40 md:flex"
      >
        SCROLL TO EXPLORE <ChevronDown size={14} />
      </a>
    </section>
  );
}

function IndustryStrip() {
  const items = [
    "SHIPMENT DATA",
    "ROUTE ECONOMICS",
    "HISTORICAL COSTS",
    "PEER COMPARISONS",
    "EVIDENCE NOTES",
  ];

  return (
    <section
      id="industries"
      className="scroll-mt-24 border-b border-[#E7E5DD] bg-white"
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-5 px-6 py-8 sm:px-10 lg:px-16">
        <div className="max-w-xs">
          <p className="text-[9px] font-bold tracking-[0.17em] text-[#898A82]">
            ONE CONNECTED WORKFLOW
          </p>
          <p className="mt-2 text-sm font-semibold text-[#292A24]">
            Built around the way freight costs are analysed.
          </p>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-x-7 gap-y-4">
          {items.map((item, i) => (
            <div key={item} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#C29A16]">
                0{i + 1}
              </span>
              <span className="text-[9px] font-bold tracking-[0.1em] text-[#56574F]">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  const items = [
    {
      number: "01",
      label: "Historical context",
      title: "Previous 8 weeks",
      description: "Compare current route cost with its prior available weeks.",
    },
    {
      number: "02",
      label: "Comparable routes",
      title: "Same route type",
      description: "Compare with other routes of the same type in that week.",
    },
    {
      number: "03",
      label: "Evidence control",
      title: "Exact note IDs",
      description: "Keep the supporting note connected to its verdict.",
    },
    {
      number: "04",
      label: "Weekly consistency",
      title: "Monday–Sunday",
      description: "Use consistent weekly boundaries for every calculation.",
    },
  ];

  return (
    <section className="bg-[#F3F2EC] py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <SectionTitle
              eyebrow="Operational discipline"
              title="Every comparison should mean something."
              description="Freight costs need context. Our workflow is built around consistent time windows, comparable routes, and verifiable explanations."
            />

            <a
              href="#intelligence"
              className="mt-8 inline-flex items-center gap-3 border-b border-[#B99A36] pb-2 text-[10px] font-bold tracking-[0.12em] text-[#282922] hover:text-[#98751A]"
            >
              DISCOVER THE APPROACH <ArrowRight size={14} />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.number}
                className="border border-[#E1DFD6] bg-white p-6 transition hover:border-[#C5A83D]"
              >
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#9A7D28]">
                  {item.number} / {item.label}
                </p>
                <h3 className="mt-8 text-xl font-semibold tracking-tight text-[#292A24]">
                  {item.title}
                </h3>
                <p className="mt-3 text-xs leading-6 text-[#777970]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function IntelligenceSection() {
  return (
    <section
      id="intelligence"
      className="scroll-mt-24 bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
        <SectionTitle
          eyebrow="Freight intelligence"
          title="From a cost change to a defensible decision."
          description="Move from raw shipment records to an explanation that a reviewer can inspect, understand, and verify."
        />

        <div className="mt-12 grid grid-cols-1 border-y border-[#E7E5DD] md:grid-cols-3">
          {capabilities.map(
            ({ number, title, description, icon: Icon, tag }) => (
              <article
                key={number}
                className="group border-b border-[#E7E5DD] px-6 py-8 transition hover:bg-[#FAF9F5] md:border-b-0 md:border-r md:px-8 md:py-10 last:md:border-r-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.14em] text-[#A0832A]">
                    {number}
                  </span>
                  <Icon
                    size={23}
                    strokeWidth={1.5}
                    className="text-[#777970] transition group-hover:text-[#A0832A]"
                  />
                </div>

                <p className="mt-9 text-[9px] font-bold tracking-[0.15em] text-[#8C8D84]">
                  {tag}
                </p>

                <h3 className="mt-3 max-w-xs text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#292A24]">
                  {title}
                </h3>

                <p className="mt-4 text-xs leading-6 text-[#777970]">
                  {description}
                </p>

                <a
                  href={number === "03" ? "#evidence" : "#routes"}
                  className="mt-7 inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] text-[#3D3E36] group-hover:text-[#A0832A]"
                >
                  EXPLORE <ArrowRight size={13} />
                </a>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="bg-[#171613] py-20 text-white sm:py-28">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
        <SectionTitle
          eyebrow="Where cost reviews break down"
          title="Four problems. One coordinated workflow."
          description="The objective is not simply to flag a number. It is to make the cost change understandable without inventing a reason."
          light
        />

        <div className="mt-12 grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem) => (
            <article
              key={problem.no}
              className="bg-[#171613] p-6 transition hover:bg-[#201F1A] sm:p-7"
            >
              <p className="text-[10px] font-bold tracking-[0.15em] text-[#FFBE00]">
                {problem.no}
              </p>
              <h3 className="mt-10 text-xl font-semibold leading-snug tracking-tight">
                {problem.title}
              </h3>
              <p className="mt-4 text-xs leading-6 text-white/55">
                {problem.description}
              </p>
              <div className="mt-7 h-[2px] w-9 bg-[#FFBE00]/60" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="bg-[#F4F3ED] py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
        <SectionTitle
          eyebrow="The solution"
          title="Measure. Compare. Investigate."
          description="A straightforward workflow that keeps deterministic calculations separate from AI-generated explanations."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {workflow.map((item, i) => (
            <article
              key={item.no}
              className="relative min-h-[270px] border border-[#DFDDD4] bg-white p-7 sm:p-9"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl font-semibold tracking-[-0.06em] text-[#D2B65D]">
                  {item.no}
                </span>
                {i < 2 && (
                  <ArrowRight size={19} className="text-[#AAA99F]" />
                )}
              </div>

              <h3 className="mt-10 text-2xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 max-w-sm text-xs leading-6 text-[#777970]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoutePreview() {
  const [activeView, setActiveView] = useState("History");
  const tabs = ["History", "Peer routes", "Method"];

  return (
    <section id="routes" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionTitle
            eyebrow="Product preview"
            title="Explore route costs, trends, and anomalies."
            description="Analyse weekly freight costs, compare routes against historical and peer benchmarks, and investigate unusual changes using supporting context notes."
          />
          <span className="mb-1 inline-flex items-center gap-2 border border-[#E3E1D8] px-3 py-2 text-[9px] font-bold tracking-wider text-[#777970]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B99A36]" />
            PREVIEW MODE
          </span>
        </div>

        <div className="mt-10 overflow-hidden border border-[#DCDAD0]">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1B1A16] px-5 py-5 text-white sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#FFBE00] text-black">
                <Route size={19} />
              </div>
              <div>
                <p className="text-xs font-semibold">
                  Route analysis workspace
                </p>
                <p className="mt-1 text-[9px] text-white/45">
                  Historical and peer comparison
                </p>
              </div>
            </div>
            <span className="border border-white/15 px-3 py-2 text-[9px] tracking-wider text-white/60">
              ANALYSIS WORKSPACE
            </span>
          </div>

          <div className="border-b border-[#E6E4DC] bg-[#F8F7F2] px-5 sm:px-7">
            <div className="flex flex-wrap gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab)}
                  className={`border-b-2 py-4 text-[10px] font-bold transition ${
                    activeView === tab
                      ? "border-[#B99A36] text-[#272821]"
                      : "border-transparent text-[#888980] hover:text-[#272821]"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {activeView === "History" && (
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <Eyebrow>Selected route</Eyebrow>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                    Route cost history
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-[#777970]">
                    Weekly cost per tonne-kilometre = total freight cost in
                    INR ÷ (quantity in tonnes × distance in kilometres).
                    Weeks run Monday through Sunday.
                  </p>

                  <div className="mt-7 space-y-4 border-t border-[#E8E6DE] pt-5">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-[#777970]">
                        Historical baseline
                      </span>
                      <span className="font-semibold">Awaiting data</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-[#777970]">
                        Similar-route baseline
                      </span>
                      <span className="font-semibold">Awaiting data</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-[#777970]">Weekly verdict</span>
                      <span className="font-semibold">Not evaluated</span>
                    </div>
                  </div>
                </div>

                <div className="flex min-h-[230px] flex-col items-center justify-center border border-dashed border-[#DCDAD0] bg-[#FAF9F5] p-6 text-center">
                  <BarChart3 size={28} className="text-[#A28A43]" />
                  <p className="mt-4 text-sm font-semibold">
                    Cost trend will appear here
                  </p>
                  <p className="mt-2 max-w-sm text-xs leading-5 text-[#85867E]">
                    This chart will use the actual shipment records, not
                    illustrative numbers.
                  </p>
                </div>
              </div>
            )}

            {activeView === "Peer routes" && (
              <div className="py-10 text-center">
                <Route size={26} className="mx-auto text-[#A28A43]" />
                <h3 className="mt-4 text-base font-semibold">
                  Same-week peer comparison
                </h3>
                <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#777970]">
                  The comparison will use other routes with the same
                  route_type in the same week, excluding the route being
                  investigated.
                </p>
              </div>
            )}

            {activeView === "Method" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="border border-[#E6E4DC] p-5">
                  <p className="text-[10px] font-bold tracking-wider text-[#947921]">
                    BASELINE A
                  </p>
                  <h3 className="mt-3 text-base font-semibold">
                    Own route history
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-[#777970]">
                    Average the route’s previous eight full weeks where
                    available. Exclude the current week and leave the baseline
                    unavailable when history is insufficient.
                  </p>
                </div>

                <div className="border border-[#E6E4DC] p-5">
                  <p className="text-[10px] font-bold tracking-wider text-[#947921]">
                    BASELINE B
                  </p>
                  <h3 className="mt-3 text-base font-semibold">
                    Similar routes
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-[#777970]">
                    Average other routes with the same route_type in the
                    same week. Exclude the route being evaluated.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function EvidenceSection() {
  return (
    <section
      id="evidence"
      className="scroll-mt-24 bg-[#F3F2EC] py-20 sm:py-28"
    >
      <div className="mx-auto grid max-w-[1600px] items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-16">
        <div>
          <SectionTitle
            eyebrow="Trust and traceability"
            title="An explanation is only as good as its evidence."
            description="The system should not justify a cost increase merely because a note sounds relevant. The route, event, date, and actual meaning must all support the explanation."
          />

          <div className="mt-8 space-y-4">
            {[
              "Match the route and the note’s applicable dates to the flagged week.",
              "Reject notes that state costs were unaffected or do not support the observed increase.",
              "Record the exact supporting note ID in the output.",
              "If no relevant evidence supports a cause, mark the increase unexplained.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8E0C4]">
                  <Check size={12} className="text-[#68531A]" />
                </div>
                <p className="text-xs leading-6 text-[#55574F]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#DFDDD4] bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between border-b border-[#EAE8E0] pb-5">
            <div className="flex items-center gap-3">
              <ShieldCheck size={21} className="text-[#927622]" />
              <div>
                <p className="text-sm font-semibold">Evidence record</p>
                <p className="mt-1 text-[9px] text-[#888980]">
                  Illustrative layout
                </p>
              </div>
            </div>
            <span className="border border-[#E4E2D9] px-2 py-1 text-[9px] text-[#777970]">
              AUDIT VIEW
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-[9px] font-bold tracking-wider text-[#898A82]">
                ROUTE / PERIOD
              </p>
              <p className="mt-2 text-sm font-semibold">
                Actual route and week from dataset
              </p>
            </div>

            <div className="border-l-2 border-[#C6A33A] bg-[#F8F7F2] p-4">
              <p className="text-[9px] font-bold tracking-wider text-[#8C7225]">
                SUPPORTING NOTE
              </p>
              <p className="mt-2 text-xs leading-6 text-[#55574F]">
                Show the original context note, exact note ID, applicable
                dates, route match, and evidence of cost impact. Do not infer
                an unsupported cause.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[#EAE8E0] pt-5">
              <div>
                <p className="text-[9px] font-bold tracking-wider text-[#898A82]">
                  MATCHED NOTE ID
                </p>
                <p className="mt-2 text-sm font-semibold">Not evaluated</p>
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-wider text-[#898A82]">
                  VERDICT
                </p>
                <p className="mt-2 text-sm font-semibold">Pending analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <SectionTitle
            eyebrow="Built for transparent analysis"
            title="Less guesswork. More clarity."
            description="This case study combines reproducible weekly route-cost calculations, historical and peer comparisons, anomaly flags, and evidence-grounded explanations."
          />

          <div className="border-l-2 border-[#FFBE00] pl-6">
            <p className="text-sm font-semibold leading-6 text-[#292A24]">
              Calculations establish what changed. Evidence helps explain
              why. Neither should be confused with the other.
            </p>
            <p className="mt-3 text-xs leading-6 text-[#777970]">
              Developed as a FreightTiger AI case-study project using the
              supplied shipment records, context notes, and required output
              schema.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px bg-[#E4E2D9] sm:grid-cols-3">
          {[
            ["01", "Deterministic core", "Repeatable numerical calculations."],
            ["02", "Grounded explanations", "Traceable source-note references."],
            [
              "03",
              "Reproducible results",
              "Repeatable results in the exact required CSV column order.",
            ],
          ].map(([no, title, description]) => (
            <div key={no} className="bg-[#FAF9F5] p-6 sm:p-8">
              <p className="text-[10px] font-bold tracking-wider text-[#9B7E2A]">
                {no}
              </p>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-xs leading-6 text-[#777970]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-[#171613] py-20 text-white sm:py-24">
      <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-8 px-6 sm:px-10 lg:flex-row lg:items-end lg:px-16">
        <div className="max-w-3xl">
          <Eyebrow light>THE NEXT MOVE</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
            Every cost change deserves a closer look.
            <span className="block text-[#FFBE00]">
              Start with the evidence.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/60">
            Explore the analysis workflow and see how historical comparisons
            and context notes can work together.
          </p>
        </div>

        <a
          href="#routes"
          className="inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-sm bg-[#FFBE00] px-6 py-4 text-[10px] font-extrabold tracking-[0.12em] text-black transition hover:bg-[#FFD34C] lg:self-auto"
        >
          EXPLORE THE PRODUCT <ArrowRight size={15} />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#11110F] text-white">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-6 py-12 sm:px-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr] lg:px-16">
        <div>
          <a href="#home" aria-label="Back to top">
            <BrandMark />
          </a>
          <p className="mt-5 max-w-sm text-xs leading-6 text-white/45">
            A shipping-cost intelligence project focused on route
            comparisons, explainable findings, and verifiable evidence.
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#FFBE00]">
            EXPLORE
          </p>
          <div className="mt-5 space-y-3">
            {navLinks.slice(0, 4).map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-xs text-white/55 transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#FFBE00]">
            PROJECT
          </p>
          <div className="mt-5 space-y-3 text-xs text-white/55">
            <p>Python analytics engine</p>
            <p>Evidence retrieval</p>
            <p>Reproducible evaluation</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-wrap justify-between gap-3 border-t border-white/10 px-6 py-5 text-[9px] tracking-wider text-white/35 sm:px-10 lg:px-16">
        <span>FREIGHT TIGER / COST INTELLIGENCE PROJECT</span>
        <a href="#home" className="hover:text-white">
          BACK TO TOP ↑
        </a>
      </div>
    </footer>
  );
}


function ProtectedDashboard() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          window.location.replace("/login");
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error("Session verification failed:", error);
        window.location.replace("/login");
      }
    }

    checkSession();
  }, []);

  if (checking) {
    return <div style={{ padding: 40 }}>Checking login session...</div>;
  }

  return <Dashboard />;
}


export default function App() {
  const currentPath = window.location.pathname;

  if (currentPath === "/login") {
    return <Login />;
  }

  if (currentPath === "/signup") {
    return <Signup />;
  }

  if (currentPath === "/dashboard") {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-white text-[#24251F]">
      <Navbar />
      <main>
        <Hero />
        <IndustryStrip />
        <ImpactSection />
        <ProblemSection />
        <SolutionSection />
        <RoutePreview />
        <EvidenceSection />
        <AboutSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

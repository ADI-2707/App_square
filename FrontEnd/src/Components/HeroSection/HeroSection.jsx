import GridItem from "./GridItem";
import {
  dashboardVideo,
  recipeVideo,
  trendsVideo,
  userVideo,
  historyVideo,
} from "./heroAssets";
import "./HeroSection.css";

/**
 * Static hero configuration
 * Keeping this outside the component prevents
 * unnecessary re-creation on every render.
 */
const HERO_ITEMS = [
  {
    gridArea: "item-1",
    title: "Recipe Management",
    glowColor: "#fbbf24",
    titleClass: "item-head",
    textClass: "item-p1 text-yellow-400",
    videoSrc: recipeVideo,
    description:
      "Create, version, and control industrial recipes with complete traceability and precise batch execution across the entire production lifecycle. Maintain immutable historical versions, compare revisions, and track every parameter change with full user, timestamp, and reason-for-change visibility. Enforce standardized recipes and operational constraints across multiple plants, lines, and equipment to ensure consistent quality and repeatable outcomes. Built-in approval workflows, role-based access control, and electronic sign-offs support regulatory requirements and internal governance.",
    showStats: true,
    stats: {
      label1: "Batches",
      val1: "#102-B",
      label2: "Yield",
      val2: "99.2%",
    },
  },
  {
    gridArea: "item-2",
    title: "Dashboard Visualization",
    glowColor: "#a855f7",
    titleClass: "item-head",
    textClass: "item-p2 text-purple-400",
    videoSrc: dashboardVideo,
    description:
      "Visualize real-time production metrics, KPIs, and performance trends through interactive and responsive dashboards.",
    showStats: true,
    stats: {
      label1: "Duration",
      val1: "2025-26",
      label2: "Production",
      val2: "+34%",
    },
  },
  {
    gridArea: "item-3",
    title: "Trends",
    glowColor: "#ef4444",
    titleClass: "item-head",
    textClass: "item-p3 text-red-400",
    videoSrc: trendsVideo,
    description:
      "Detect patterns and anomalies using historical and real-time trend analytics.",
    showStats: true,
    stats: {
      label1: "Fault Detection",
      val1: "+23.5%",
      label2: "Efficiency",
      val2: "+32%",
    },
  },
  {
    gridArea: "item-4",
    title: "User Management",
    glowColor: "#22C55E",
    titleClass: "item-head",
    textClass: "item-p4 text-green-400",
    videoSrc: userVideo,
    description:
      "Manage users, roles, and permissions securely, ensuring controlled access.",
    showStats: false,
  },
  {
    gridArea: "item-5",
    title: "History",
    glowColor: "#3B82F6",
    titleClass: "item-head",
    textClass: "item-p5 text-blue-400",
    videoSrc: historyVideo,
    description:
      "Maintain a complete operational timeline with searchable logs, changes, and system activity records. Access historical data and insights to optimize operations and make informed decisions.",
    showStats: false,
  },
];

const HeroSection = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="grid-containers">
        {HERO_ITEMS.map((item) => (
          <GridItem
            key={item.title}
            gridArea={item.gridArea}
            title={item.title}
            glowColor={item.glowColor}
            titleClass={item.titleClass}
            textClass={item.textClass}
            videoSrc={item.videoSrc}
            description={item.description}
            showStats={item.showStats}
            stats={item.stats}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
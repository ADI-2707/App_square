import GridItem from "./GridItem";
import {
  dashboardVideo,
  recipeVideo,
  trendsVideo,
  userVideo,
  historyVideo,
} from "./heroAssets";

const HeroSection = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="grid-containers">

        <GridItem
          gridArea="item-1"
          title="Recipe Management"
          glowColor="#fbbf24"
          titleClass="item-head"
          textClass="item-p1 text-yellow-400"
          videoSrc={recipeVideo}
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit..."
          showStats
          stats={{ label1: "Batches", val1: "#102-B", label2: "Yield", val2: "99.2%" }}
        />

        <GridItem
          gridArea="item-2"
          title="Dashboard Visualization"
          glowColor="#a855f7"
          titleClass="item-head"
          textClass="item-p2 text-purple-400"
          videoSrc={dashboardVideo}
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit..."
          showStats
          stats={{ label1: "Duration", val1: "2025-26", label2: "Production", val2: "+34%" }}
        />

        <GridItem
          gridArea="item-3"
          title="Trends"
          glowColor="#ef4444"
          titleClass="item-head"
          textClass="item-p3 text-red-400"
          videoSrc={trendsVideo}
          showStats
          stats={{ label1: "Fault Detection", val1: "+23.5%", label2: "Efficiency", val2: "+32%" }}
        />

        <GridItem
          gridArea="item-4"
          title="User Management"
          glowColor="#22C55E"
          titleClass="item-head"
          textClass="item-p4 text-green-400"
          videoSrc={userVideo}
          description="Lorem ipsum dolor sit amet..."
        />

        <GridItem
          gridArea="item-5"
          title="History"
          glowColor="#3B82F6"
          titleClass="item-head"
          textClass="item-p5 text-blue-400"
          videoSrc={historyVideo}
          description="Lorem ipsum dolor sit amet..."
        />

      </div>
    </div>
  );
};

export default HeroSection;
import React, { useRef, useState } from "react";
import dashboardVideo from "../assets/dashboard_visualization.mp4";
import recipeVideo from "../assets/recipe-management.mp4";
import trendsVideo from "../assets/trends.mp4";
import userVideo from "../assets/user_management.mp4";
import historyVideo from "../assets/history.mp4";

const GridItem = ({
  title,
  description,
  videoSrc,
  gridArea,
  titleClass,
  textClass,
  glowColor,
  showStats = false,
  stats = { label1: "Active", val1: "0", label2: "Rate", val2: "0%" },
}) => {
  const videoRef = useRef(null);
  const [isActivated, setIsActivated] = useState(false);

  const handleMouseEnter = () => {
    if (!isActivated) {
      setIsActivated(true);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  };

  return (
    <div
      className={`item ${isActivated ? "activated" : ""}`}
      style={{ gridArea: gridArea }}
      onMouseEnter={handleMouseEnter}
    >
      <h2 className={`uppercase ${titleClass}`}>{title}</h2>
      <div className="flex flex-col text-center justify-center items-center mt-6 px-5">
        <p className={`${textClass} text-sm ${isActivated ? "activated" : ""}`}>
          {description}
        </p>
        <div
          className={`video-reveal-container ${isActivated ? "active" : ""}`}
        >
          <video
            ref={videoRef}
            style={{ "--accent-glow": glowColor }}
            className="video-element mt-10"
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
        <div className="flex justify-around w-full mt-6 ">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase opacity-40 tracking-widest">
              {stats.label1}
            </span>
            <span className="text-xs font-mono text-white mt-1">
              {stats.val1}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase opacity-40 tracking-widest">
              {stats.label2}
            </span>
            <span className="text-xs font-mono text-white mt-1">
              {stats.val2}
            </span>
          </div>
        </div>

        <div className="px-4 w-full mt-3">
          <div className="flex justify-between text-[9px] mb-2 opacity-50 uppercase tracking-tighter"></div>
          <div className="h-0.75 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1500 ease-in-out"
              style={{
                width: isActivated ? "100%" : "0%",
                backgroundColor: glowColor,
                boxShadow: `0 0 10px ${glowColor}`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
          description="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptate quia soluta minus? Necessitatibus, perferendis magnam. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptate quia soluta minus? Necessitatibus, perferendis magnam.Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptate quia soluta minus? Necessitatibus, perferendis magnam. Lorem, ipsum dolor sit amet consectetur adipisicing elite. Lorem, ipsum dolor sit amet consectetur adipisicing elite. Lorem, ipsum dolor sit amet consectetur adipisicing elite. Lorem, ipsum dolor sit amet consectetur adipisicing elite. Lorem, ipsum dolor sit amet consectetur."
          showStats={true}
          stats={{
            label1: "Batches",
            val1: "#102-B",
            label2: "Yield",
            val2: "99.2%",
          }}
        />

        <GridItem
          gridArea="item-2"
          title="Dashboard Visualization"
          glowColor="#a855f7"
          titleClass="item-head"
          textClass="item-p2 text-purple-400"
          videoSrc={dashboardVideo}
          description="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptate quia soluta minus? Necessitatibus, perferendis magnam."
          showStats={true}
          stats={{
            label1: "Duration",
            val1: "2025-26",
            label2: "Production",
            val2: "+34%",
          }}
        />

        <GridItem
          gridArea="item-3"
          title="Trends"
          glowColor="#ef4444"
          titleClass="item-head"
          textClass="item-p3 text-red-400"
          videoSrc={trendsVideo}
          description="Lorem, ipsum dolor sit amet consectetur adipisicing elite."
          showStats={true}
          stats={{
            label1: "Fault detection",
            val1: "+23.5%",
            label2: "Efficiency",
            val2: "+32%",
          }}
        />

        <GridItem
          gridArea="item-4"
          title="User Management"
          glowColor="#22C55E"
          titleClass="item-head"
          textClass="item-p4 text-green-400"
          videoSrc={userVideo}
          description="Lorem, ipsum dolor sit amet consectetur adipisicing elite."
          showStats={false}
          stats={{
            label1: "Users",
            val1: "100+",
            label2: "Projects",
            val2: "30K+",
          }}
        />

        <GridItem
          gridArea="item-5"
          title="History"
          glowColor="#3B82F6"
          titleClass="item-head"
          textClass="item-p5 text-blue-400"
          videoSrc={historyVideo}
          description="Lorem, ipsum dolor sit amet consectetur adipisicing elite. Lorem, ipsum dolor sit amet consectetur adipisicing elite."
          showStats={false}
          stats={{
            label1: "Clients",
            val1: "100+",
            label2: "Trust",
            val2: "100%",
          }}
        />

      </div>
    </div>
  );
};

export default HeroSection;
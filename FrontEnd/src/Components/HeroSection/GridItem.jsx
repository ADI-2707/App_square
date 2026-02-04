import { useRef, useState } from "react";

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
      videoRef.current?.play();
    }
  };

  return (
    <div
      className={`item ${isActivated ? "activated" : ""}`}
      style={{ gridArea }}
      onMouseEnter={handleMouseEnter}
    >
      <h2 className={`uppercase ${titleClass}`}>{title}</h2>

      <div className="flex flex-col text-center justify-center items-center mt-6 px-5">
        <p className={`${textClass} text-sm ${isActivated ? "activated" : ""}`}>
          {description}
        </p>

        <div className={`video-reveal-container ${isActivated ? "active" : ""}`}>
          <video
            ref={videoRef}
            className="video-element mt-10"
            loop
            muted
            playsInline
            preload="auto"
            style={{ "--accent-glow": glowColor }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>

        {showStats && (
          <>
            <div className="flex justify-around w-full mt-6">
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
              <div className="h-0.75 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-1500 ease-in-out"
                  style={{
                    width: isActivated ? "100%" : "0%",
                    backgroundColor: glowColor,
                    boxShadow: `0 0 10px ${glowColor}`,
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GridItem;
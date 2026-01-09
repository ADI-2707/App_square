import { useEffect, useRef } from "react";
import { Folder } from "lucide-react";

export default function ProjectSection({
  title,
  projects,
  loadMore,
  hasMore,
  onOpenProject,
}) {
  const observerRef = useRef(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { threshold: 0.6 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  if (!projects.length) return null;

  return (
    <section className="project-section">
      <h2 className="project-section-title">{title}</h2>

      <div className="project-row">
        {projects.map((p) => (
          <div
            key={`${title}-${p.id}`}
            className="project-card card-surface"
            onClick={() => onOpenProject(p)}
          >
            <div className="project-card-icon">
              <Folder size={28} />
            </div>
            
            <div className="project-card-title">{p.name}</div>
            <div className="project-card-meta">
              Role: {p.role.toUpperCase()}
            </div>
          </div>
        ))}

        {hasMore && <div ref={observerRef} className="project-card skeleton" />}
      </div>
    </section>
  );
}

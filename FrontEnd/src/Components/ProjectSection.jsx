import { useEffect, useRef, useCallback } from "react";
import { Folder } from "lucide-react";

export default function ProjectSection({
  title,
  projects = [],
  loadMore,
  hasMore,
  onOpenProject,
}) {
  const observerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const handleIntersect = useCallback(
    ([entry]) => {
      if (entry.isIntersecting && hasMore && projects.length > 0) {
        loadMore?.();
      }
    },
    [hasMore, loadMore]
  );

  useEffect(() => {
    if (!hasMore || !observerRef.current) return;
    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.1,
      rootMargin: "100px",
    });
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [handleIntersect, hasMore, projects.length]);

  // Scroll to the left to show newest items first
  useEffect(() => {
    if (scrollContainerRef.current && projects.length > 0) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [projects.length]);

  if (!projects.length && !hasMore) return null;

  return (
    <section className="project-section">
      <h2 className="project-section-title">{title}</h2>
      <div className="project-row" ref={scrollContainerRef} style={{ overflowX: 'auto' }}>
        {projects.map((p) => (
          <div
            key={`${title}-${p.id}`}
            className="project-card card-surface"
            onClick={() => onOpenProject?.(p)}
          >
            <div className="project-card-icon"><Folder size={28} /></div>
            <div className="project-card-title">{p.name}</div>
            <div className="project-card-meta">Role: {p.role.toUpperCase()}</div>
          </div>
        ))}

        {hasMore && (
          <div ref={observerRef} className="project-card skeleton-card">
             <div className="card-surface skeleton-surface">
                <div className="skeleton-icon pulse"></div>
                <div className="skeleton-title pulse"></div>
                <div className="skeleton-meta pulse"></div>
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
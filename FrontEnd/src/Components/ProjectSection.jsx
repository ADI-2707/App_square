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
  const isLoadingRef = useRef(false);

  /**
   * Stable intersection callback
   */
  const handleIntersect = useCallback(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      if (!hasMore) return;
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      loadMore?.();
    },
    [hasMore, loadMore]
  );

  /**
   * Reset loading lock when projects update
   */
  useEffect(() => {
    isLoadingRef.current = false;
  }, [projects]);

  /**
   * Intersection Observer
   */
  useEffect(() => {
    if (!hasMore || !observerRef.current) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.6,
      root: observerRef.current.parentElement, // important for horizontal scroll
    });

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [handleIntersect, hasMore]);

  if (!projects.length) return null;

  return (
    <section className="project-section">
      <h2 className="project-section-title">{title}</h2>

      <div className="project-row">
        {projects.map((p) => (
          <div
            key={`${title}-${p.id}`}
            className="project-card card-surface"
            onClick={() => onOpenProject?.(p)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onOpenProject?.(p)}
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

        {/* Sentinel / Skeleton */}
        {hasMore && (
          <div
            ref={observerRef}
            className="project-card skeleton"
            aria-hidden
          />
        )}
      </div>
    </section>
  );
}
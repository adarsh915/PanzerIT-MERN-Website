"use client";

import { useEffect, useState, useRef } from "react";

interface SkillItem {
  title: string;
  percentage: number;
}

interface SkillBarsProps {
  skills: SkillItem[];
}

export function SkillBars({ skills }: SkillBarsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="skills" ref={containerRef}>
      {skills.map((skill, index) => (
        <SkillItemRow
          key={`${skill.title}-${index}`}
          title={skill.title}
          targetPercentage={skill.percentage}
          animate={isVisible}
        />
      ))}
    </div>
  );
}

function SkillItemRow({
  title,
  targetPercentage,
  animate,
}: {
  title: string;
  targetPercentage: number;
  animate: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!animate) return;

    let start = 0;
    const duration = 2500;
    const steps = 50;
    const stepTime = duration / steps;
    const increment = targetPercentage / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetPercentage) {
        setCount(targetPercentage);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [animate, targetPercentage]);

  return (
    <div className="skill-item">
      <div className="skill-header">
        <div className="skill-title">{title}</div>
      </div>
      <div className="skill-bar">
        <div className="bar-inner">
          <div
            className="bar progress-line"
            style={{
              width: animate ? `${targetPercentage}%` : "0%",
              transition: "width 2.5s cubic-bezier(0.1, 0.4, 0.2, 1)",
            }}
          >
            <div className="skill-percentage">
              <div className="count-box">
                <span className="count-text">{count}</span>%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

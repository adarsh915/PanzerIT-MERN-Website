"use client"
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ResourceQuestionnaireForm from "./ResourceQuestionnaireForm";

import { sanitizeHtml } from "@/utils/sanitize";

type ResourceItem = {
  id?: string;
  title: string;
  description?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  link: string;
  category?: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

type CategoryNode = Category & {
  children: CategoryNode[];
}

function ResourceDescription({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check length of plain text to decide if we need the read more/less toggle
  const plainText = text.replace(/<[^>]*>/g, '').trim();
  const isLong = plainText.length > 150;

  if (!isLong) {
    return <div className="resource-desc" dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />;
  }

  return (
    <div className="resource-desc-wrapper">
      <div
        className="resource-desc"
        style={isExpanded ? {} : {
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
      />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--theme-color)',
          padding: '0',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          marginTop: '6px',
          marginBottom: '15px',
          display: 'block'
        }}
      >
        {isExpanded ? 'Read Less' : 'Read More'}
      </button>
    </div>
  );
}

export default function ResourcesFilterClient({
  items,
  categories = [],
  questionnaires = []
}: {
  items: ResourceItem[],
  categories?: Category[],
  questionnaires?: any[]
}) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const selectedQuestionnaire = useMemo(() => {
    return questionnaires?.find(q => q.id === selectedFormId) || null;
  }, [questionnaires, selectedFormId]);

  // Filter categories to only include those that have items (and their ancestors)
  const activeCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const usedNames = new Set(items.map(it => it.category || "Uncategorized"));
    const validIds = new Set<string>();

    categories.forEach(c => {
      if (usedNames.has(c.name)) validIds.add(c.id);
    });

    let changed = true;
    while (changed) {
      changed = false;
      categories.forEach(c => {
        if (!validIds.has(c.id) && categories.some(child => child.parentId === c.id && validIds.has(child.id))) {
          validIds.add(c.id);
          changed = true;
        }
      });
    }

    return categories.filter(c => validIds.has(c.id));
  }, [categories, items]);

  // Build tree from filtered categories
  const tree = useMemo(() => {
    const map = new Map<string, CategoryNode>();
    activeCategories.forEach(c => map.set(c.id, { ...c, children: [] }));
    const rootNodes: CategoryNode[] = [];
    activeCategories.forEach(c => {
      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) parent.children.push(map.get(c.id)!);
      } else {
        rootNodes.push(map.get(c.id)!);
      }
    });
    return rootNodes;
  }, [activeCategories]);

  // Helper to get all descendant category names including itself
  const getCategoryNamesToFilter = (categoryName: string): string[] => {
    if (categoryName === "All") return [];
    const cat = categories.find(c => c.name === categoryName);
    if (!cat) return [categoryName];

    const names: string[] = [];
    const dfs = (id: string) => {
      const node = categories.find(c => c.id === id);
      if (node) {
        names.push(node.name);
        categories.filter(c => c.parentId === id).forEach(child => dfs(child.id));
      }
    };
    dfs(cat.id);
    return names;
  };

  const filtered = useMemo(() => {
    if (activeCategory === "All") return items;
    const allowedNames = getCategoryNamesToFilter(activeCategory);
    return items.filter((it) => allowedNames.includes(it.category || "Uncategorized"));
  }, [items, activeCategory, categories]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderTree = (nodes: CategoryNode[], depth = 0) => {
    return (
      <ul style={{ paddingLeft: depth === 0 ? 0 : '15px', listStyle: 'none', margin: 0 }}>
        {nodes.map(node => {
          const isActive = activeCategory === node.name;
          const isExpanded = expandedNodes.has(node.id); // Rely on state instead of forced isActive
          const hasChildren = node.children.length > 0;

          return (
            <li key={node.id} style={{ marginBottom: depth === 0 ? '5px' : '2px' }}>
              <div style={{ marginBottom: depth === 0 ? '5px' : '2px' }}>
                <a
                  href="#"
                  className={`category-btn ${isActive ? "active" : ""}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: depth === 0 ? '10px 15px' : '8px 10px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: depth === 0 ? '16px' : '15px',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategory(node.name);
                    setSelectedFormId(null);
                    // Toggle expansion when clicked
                    if (hasChildren) {
                      toggleExpand(node.id, e);
                    }
                  }}
                >
                  <span style={{ flex: 1 }}>{node.name}</span>
                  {!hasChildren && depth === 0 && <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>}
                  {hasChildren && (
                    <i className={`fa-solid ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`} style={{ fontSize: '12px', paddingLeft: '10px' }}></i>
                  )}
                </a>
              </div>

              {hasChildren && isExpanded && (
                <div style={{ marginTop: '5px' }}>
                  {renderTree(node.children, depth + 1)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  // If there are no DB categories, fallback to extracting them from items just in case
  const fallbackCategories = useMemo(() => {
    if (categories.length > 0) return [];
    const set = new Set<string>();
    items.forEach((it) => set.add(it.category || "Uncategorized"));
    return Array.from(set).map(name => ({ id: name, name, slug: name, children: [] }));
  }, [items, categories]);

  return (
    <div className="panzer-solution-detail-layout">
      <style>{`
        .panzer-solution-detail-side-card nav a.category-btn,
        .panzer-solution-detail-side-card a.category-btn {
          background-color: var(--bs-bg-color23, #edf3fe) !important;
          color: var(--theme-navy-darker, #061238) !important;
          transition: all 0.25s ease-in-out !important;
        }

        .panzer-solution-detail-side-card nav a.category-btn i,
        .panzer-solution-detail-side-card a.category-btn i {
          color: var(--theme-navy-darker, #061238) !important;
          transition: all 0.25s ease-in-out !important;
        }

        .panzer-solution-detail-side-card nav a.category-btn:hover,
        .panzer-solution-detail-side-card nav a.category-btn.active,
        .panzer-solution-detail-side-card a.category-btn:hover,
        .panzer-solution-detail-side-card a.category-btn.active {
          background-color: var(--theme-color, #1053f3) !important;
          color: #ffffff !important;
        }

        .panzer-solution-detail-side-card nav a.category-btn:hover i,
        .panzer-solution-detail-side-card nav a.category-btn.active i,
        .panzer-solution-detail-side-card a.category-btn:hover i,
        .panzer-solution-detail-side-card a.category-btn.active i {
          color: #ffffff !important;
        }
      `}</style>
      <aside className="panzer-solution-detail-sidebar" aria-label="Resource categories">
        <div className="panzer-solution-detail-sidebar-inner">
          <div className="panzer-solution-detail-side-card" style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Categories</h2>

            {/* "All" button */}
            <a
              href="#"
              className={`category-btn ${activeCategory === "All" ? "active" : ""}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '10px 15px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '16px',
                marginBottom: '10px',
                fontWeight: activeCategory === "All" ? 600 : 500,
              }}
              onClick={(e) => {
                e.preventDefault();
                setActiveCategory("All");
                setSelectedFormId(null);
              }}
            >
              <span style={{ flex: 1 }}>All Resources</span>
              <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }}></i>
            </a>

            <nav>
              {renderTree(activeCategories.length > 0 ? tree : fallbackCategories)}
            </nav>
          </div>


          <div className="panzer-solution-detail-side-card mt-4" style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Directories</h2>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
              Access and fill out our questionnaires by clicking the link below.
            </p>
            <a
              href="https://codespine.in/test-panzer/"
              target="_blank"
              rel="noopener noreferrer"
              className="category-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '12px 15px',
                borderRadius: '4px',
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              <i className="fa-solid fa-clipboard-list" style={{ marginRight: '8px' }}></i>
              Open Questionnaire
            </a>
          </div>
        </div>
      </aside>
      <div className="panzer-solution-detail-content">
        {selectedQuestionnaire ? (
          <ResourceQuestionnaireForm
            questionnaire={selectedQuestionnaire}
            onCancel={() => setSelectedFormId(null)}
          />
        ) : (
          <div className="row gy-25 resource-row">
            {filtered.map((item, idx) => (
              <div key={item.id || idx} className="col-lg-6 col-xl-6 col-md-6">
                <div className="service-box-five">
                  <div className="icon-top">
                    <div className="icon">
                      <span>{idx + 1}</span>
                    </div>
                  </div>
                  <div className="service-top">
                    <div className="logo">
                      {item.image && (
                        <Image src={item.image} alt={item.title} width={item.imageWidth || 46} height={item.imageHeight || 46} sizes="100vw" />
                      )}
                    </div>
                    <h4>{item.title}</h4>
                  </div>
                  <ResourceDescription text={item.description || ''} />
                  <a href={`/api/resources/download?id=${item.id}&url=${encodeURIComponent(item.link || '')}`} className="theme-btn style2 br-30 mt-auto" download>
                    <span className="link-effect">
                      <span className="effect-1">Download now</span>
                      <span className="effect-1">Download now</span>
                    </span>
                    <span className="arrow-all-2">
                      <i>
                        <svg width="10" height="10" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.0035 3.90804L1.41153 12.5L0 11.0885L8.59097 2.49651H1.01922V0.5H12V11.4808H10.0035V3.90804Z"></path>
                        </svg>
                        <svg width="10" height="10" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.0035 3.90804L1.41153 12.5L0 11.0885L8.59097 2.49651H1.01922V0.5H12V11.4808H10.0035V3.90804Z"></path>
                        </svg>
                      </i>
                    </span>
                  </a>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-12 text-center py-5">
                <p>No resources in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

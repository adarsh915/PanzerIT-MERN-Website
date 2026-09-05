import { Breadcrumb } from "@/components/frontend/Breadcrumb";
import { searchSolutions } from "@/app/admin/solutions/solutionStore";
import { searchBrands } from "@/app/admin/brands/brandStore";
import { searchPosts } from "@/app/admin/posts/blogStore";
import Link from "next/link";
import Image from "next/image";
import { sanitizeHtml } from "@/utils/sanitize";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Search Results | Panzer IT",
  description: "Search for solutions, brands, and blogs on Panzer IT.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const queryParam = (await searchParams).q;
  const q = typeof queryParam === 'string' ? queryParam.toLowerCase() : '';

  const [solutions, brands, posts] = await Promise.all([
    q ? searchSolutions(q) : Promise.resolve([]),
    q ? searchBrands(q) : Promise.resolve([]),
    q ? searchPosts(q) : Promise.resolve([])
  ]);

  const totalResults = solutions.length + brands.length + posts.length;

  return (
    <>
      <Breadcrumb 
        title="Search Results" 
        paths={[{ name: "Search" }]} 
        image="/assets/images/hero/brand.png" 
      />

      <section className="search-results-section bg-light" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="search-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2>Search Results for &quot;{q}&quot;</h2>
            <p>Found {totalResults} result{totalResults !== 1 ? 's' : ''}</p>
          </div>

          {totalResults === 0 ? (
            <div className="no-results text-center" style={{ padding: '60px 20px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
              <h3>No results found</h3>
              <p>Try adjusting your search terms or exploring our main menu.</p>
              <Link href="/solution" className="panzer-header-cta" style={{ display: 'inline-block', marginTop: '20px' }}>View All Solutions</Link>
            </div>
          ) : (
            <div className="search-results-grid" style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
              
              {/* Solutions Section */}
              {solutions.length > 0 && (
                <div className="results-group">
                  <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '10px', marginBottom: '20px' }}>
                    <i className="fa-solid fa-shield-halved" style={{ marginRight: '10px', color: '#0056b3' }}></i>
                    Solutions & Services
                  </h3>
                  <div className="row g-4">
                    {solutions.map(solution => (
                      <div className="col-lg-4 col-md-6" key={solution.id}>
                        <Link href={`/solution/${solution.slug}`} className="result-card" style={{ display: 'block', background: '#fff', borderRadius: '12px', padding: '24px', height: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.3s' }}>
                          {solution.image && (
                            <div style={{ marginBottom: '15px', borderRadius: '8px', overflow: 'hidden', height: '160px', position: 'relative' }}>
                              <Image src={solution.image} alt={solution.title || ""} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
                            </div>
                          )}
                          <h4 style={{ fontSize: '18px', marginBottom: '10px', color: '#111' }}>{solution.title}</h4>
                          <p style={{ fontSize: '14px', color: '#666', marginBottom: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml((solution.description || '').replace(/<[^>]+>/g, '')) }}></p>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands Section */}
              {brands.length > 0 && (
                <div className="results-group">
                  <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '10px', marginBottom: '20px' }}>
                    <i className="fa-solid fa-building" style={{ marginRight: '10px', color: '#0056b3' }}></i>
                    Brands & Partners
                  </h3>
                  <div className="row g-4">
                    {brands.map(brand => (
                      <div className="col-lg-4 col-md-6" key={brand.id}>
                        <Link href={`/brand/${brand.slug}`} className="result-card" style={{ display: 'block', background: '#fff', borderRadius: '12px', padding: '24px', height: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.3s' }}>
                          {brand.logo && (
                            <div style={{ marginBottom: '15px', borderRadius: '8px', overflow: 'hidden', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', position: 'relative' }}>
                              <Image src={brand.logo} alt={brand.name || ""} fill style={{ objectFit: 'contain', padding: '10px' }} sizes="(max-width: 768px) 100vw, 33vw" />
                            </div>
                          )}
                          <h4 style={{ fontSize: '18px', marginBottom: '10px', color: '#111' }}>{brand.name}</h4>
                          <p style={{ fontSize: '14px', color: '#666', marginBottom: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml((brand.description || '').replace(/<[^>]+>/g, '')) }}></p>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blogs Section */}
              {posts.length > 0 && (
                <div className="results-group">
                  <h3 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '10px', marginBottom: '20px' }}>
                    <i className="fa-solid fa-newspaper" style={{ marginRight: '10px', color: '#0056b3' }}></i>
                    Blog & News
                  </h3>
                  <div className="row g-4">
                    {posts.map(post => (
                      <div className="col-lg-4 col-md-6" key={post.id}>
                        <Link href={`/blog/${post.slug}`} className="result-card" style={{ display: 'block', background: '#fff', borderRadius: '12px', padding: '24px', height: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.3s' }}>
                          {post.image && (
                            <div style={{ marginBottom: '15px', borderRadius: '8px', overflow: 'hidden', height: '160px', position: 'relative' }}>
                              <Image src={post.image} alt={post.title || ""} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
                            </div>
                          )}
                          <h4 style={{ fontSize: '18px', marginBottom: '10px', color: '#111' }}>{post.title}</h4>
                          <p style={{ fontSize: '14px', color: '#666', marginBottom: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml((post.description || '').replace(/<[^>]+>/g, '')) }}></p>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </section>
    </>
  );
}

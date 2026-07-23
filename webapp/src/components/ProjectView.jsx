import { useEffect } from 'react';

// Two case-study layouts share this component:
// - dashboard_url: embeds an external interactive dashboard (bespoke to the
//   CriptoRadar Power BI project — title/description/dashboard_url/github_url only).
// - study: a self-contained research write-up rendered entirely in-page (no
//   iframe, no external site) — fully data-driven from content.json's
//   `study` object, so any future analysis-style solution can reuse it.
export default function ProjectView({ project }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project]);

  const { title, description, dashboard_url, github_url, study } = project;

  if (study) {
    return <StudyView title={title} description={description} study={study} />;
  }

  return (
    <div style={{ padding: '120px 20px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.8rem', color: '#1a1a1a', marginBottom: '15px' }}>{title}</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>{description}</p>
      </div>

      <div style={{ background: '#000', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', marginBottom: '80px', height: '75vh' }}>
        <iframe src={dashboard_url} width="100%" height="100%" frameBorder="0" allowFullScreen title={title} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '80px' }}>
        <div>
          <h2 style={{ color: '#c8943a', marginBottom: '20px', fontSize: '1.8rem' }}>Technical Executive Summary</h2>
          <p style={{ marginBottom: '20px', lineHeight: 1.7 }}>
            <strong>The Challenge:</strong> Transforming raw market volatility into actionable indicators. Beyond simple extraction, this required normalizing heterogeneous data structures and real-time calculation of local minima.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <strong>The Architecture:</strong> A modular Python ETL engine with rate-limiting handling and rolling window logic, enriched by statistical segmentation based on dynamic percentiles.
          </p>
        </div>
        <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '12px', borderLeft: '4px solid #c8943a' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Data Pipeline Flow</h3>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2 }}>
            <li>🔍 <strong>Ingestion:</strong> CoinGecko API w/ Time-Delay</li>
            <li>⚙️ <strong>ETL Engine:</strong> Python Data Normalization</li>
            <li>📈 <strong>Engineering:</strong> 7-day MA & Valley Detection</li>
            <li>📊 <strong>Statistical Layer:</strong> Dynamic Percentiles</li>
            <li>🚀 <strong>Visuals:</strong> Power BI Integration</li>
          </ul>
        </div>
      </div>

      <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '40px', borderRadius: '15px', fontFamily: "'Courier New', Courier, monospace", position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', right: '20px', color: '#666', fontSize: '0.8rem' }}>Python / Pandas</div>
        <h3 style={{ color: '#c8943a', fontFamily: 'sans-serif', marginBottom: '25px' }}>Engineering Code Spotlight</h3>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.5 }}>
{`# 1. Algorithmic 'Valley' Identification
df['valley'] = ((df['price'] < df['price'].shift(1)) &
                (df['price'] < df['price'].shift(-1))).astype(int)

# 2. Dynamic Categorization: Percentile-based segmentation
percentiles = df['price'].quantile([0.2, 0.4, 0.6, 0.8]).values
bins = [df['price'].min()] + percentiles.tolist() + [df['price'].max()]
labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
df['price_category'] = pd.cut(df['price'], bins=bins, labels=labels)`}
        </pre>
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <a href={github_url} target="_blank" rel="noopener" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Explore Full Repository on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

function StudyView({ title, description, study }) {
  const { challenge, architecture, pipeline, code_lang, code_spotlight, charts, github_url } = study;

  return (
    <div style={{ padding: '120px 20px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.8rem', color: '#1a1a1a', marginBottom: '15px' }}>{title}</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>{description}</p>
      </div>

      {charts && charts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '80px' }}>
          {charts.map((c) => (
            <figure key={c.src} style={{ margin: 0 }}>
              <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', border: '1px solid #eee' }}>
                <img src={c.src} alt={c.caption} style={{ width: '100%', display: 'block' }} />
              </div>
              {c.caption && (
                <figcaption style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginTop: '12px' }}>{c.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '80px' }}>
        <div>
          <h2 style={{ color: '#c8943a', marginBottom: '20px', fontSize: '1.8rem' }}>Technical Executive Summary</h2>
          {challenge && (
            <p style={{ marginBottom: '20px', lineHeight: 1.7 }}>
              <strong>The Challenge:</strong> {challenge}
            </p>
          )}
          {architecture && (
            <p style={{ lineHeight: 1.7 }}>
              <strong>The Approach:</strong> {architecture}
            </p>
          )}
        </div>
        {pipeline && pipeline.length > 0 && (
          <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '12px', borderLeft: '4px solid #c8943a' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Pipeline</h3>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2 }}>
              {pipeline.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {code_spotlight && (
        <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '40px', borderRadius: '15px', fontFamily: "'Courier New', Courier, monospace", position: 'relative' }}>
          <div style={{ position: 'absolute', top: '15px', right: '20px', color: '#666', fontSize: '0.8rem' }}>{code_lang}</div>
          <h3 style={{ color: '#c8943a', fontFamily: 'sans-serif', marginBottom: '25px' }}>Engineering Code Spotlight</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.5 }}>{code_spotlight}</pre>
          {github_url && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <a href={github_url} target="_blank" rel="noopener" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Explore Full Repository on GitHub
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

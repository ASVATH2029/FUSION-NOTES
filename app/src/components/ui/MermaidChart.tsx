import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'var(--font-base)'
});

export const MermaidChart: React.FC<{ chart: string }> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && chart) {
      containerRef.current.innerHTML = ''; // reset
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        mermaid.render(id, chart).then((result) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = result.svg;
          }
        });
      } catch (err) {
        console.error('Mermaid render failed', err);
        if (containerRef.current) containerRef.current.innerHTML = `<p style="color:#ef4444;font-size:12px;">Diagram error: ${err}</p>`;
      }
    }
  }, [chart]);

  return <div ref={containerRef} className="mermaid-chart-container" style={{ margin: '1rem 0', display: 'flex', justifyContent: 'center' }} />;
};

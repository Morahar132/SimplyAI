import { InlineMath } from 'react-katex';
import { useMemo } from 'react';
import 'katex/dist/katex.min.css';

export const RichText = ({ content, latexes = [] }) => {
  const processedContent = useMemo(() => {
    if (!content) return null;

    // Clean non-breaking spaces from LaTeX
    const cleanLatexes = latexes?.map(latex => ({
      ...latex,
      latex: latex.latex?.replace(/\u00A0/g, ' ') || ''
    })) || [];

    let processedText = content;
    const elements = [];
    let lastIndex = 0;

    // Replace both <tm-math id="X" /> and #latexX# formats
    cleanLatexes.forEach((latex, index) => {
      const tmMathPattern = `<tm-math id="${index}" />`;
      const hashPattern = `#latex${index}#`;
      
      // Try tm-math format first
      let placeholderIndex = processedText.indexOf(tmMathPattern);
      let placeholder = tmMathPattern;
      
      // Fallback to hash format
      if (placeholderIndex === -1) {
        placeholderIndex = processedText.indexOf(hashPattern);
        placeholder = hashPattern;
      }
      
      if (placeholderIndex !== -1) {
        if (placeholderIndex > lastIndex) {
          elements.push({ type: 'text', content: processedText.slice(lastIndex, placeholderIndex) });
        }
        elements.push({ type: 'latex', content: latex.latex });
        lastIndex = placeholderIndex + placeholder.length;
      }
    });

    if (lastIndex < processedText.length) {
      elements.push({ type: 'text', content: processedText.slice(lastIndex) });
    }

    // If no elements were created, just render the text
    if (elements.length === 0) {
      return <span dangerouslySetInnerHTML={{ __html: content }} />;
    }

    return (
      <span style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {elements.map((el, idx) => {
          if (el.type === 'latex') {
            return <InlineMath key={idx} math={el.content} errorColor="#cc0000" strict={false} />;
          }
          return <span key={idx} dangerouslySetInnerHTML={{ __html: el.content }} />;
        })}
      </span>
    );
  }, [content, latexes]);

  return processedContent;
};

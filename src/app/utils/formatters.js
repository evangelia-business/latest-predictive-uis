/**
 * Parses markdown-style formatting (bold and italic) in text
 * @param {string} text - The text to parse
 * @returns {Array|string} - Array of React elements or original text
 */
export const parseMarkdown = (text) => {
  if (!text) return text;

  const parts = [];
  let lastIndex = 0;

  // Match **bold** and *italic*
  const markdownRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let match;

  while ((match = markdownRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add the formatted text
    if (match[1]) {
      // Bold text (**text**)
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      // Italic text (*text*)
      parts.push(<em key={match.index}>{match[4]}</em>);
    }

    lastIndex = markdownRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

/**
 * Formats answer text into structured HTML with numbered lists and paragraphs
 * @param {string} text - The answer text to format
 * @returns {JSX.Element|null} - Formatted JSX or null
 */
export const formatAnswer = (text) => {
  if (!text) return null;

  // Check if text contains numbered items like "1)", "2)", etc.
  const numberedPattern = /(\d+\)|\d+\.)\s+/g;
  const hasNumberedList = numberedPattern.test(text);

  if (hasNumberedList) {
    return formatNumberedList(text, numberedPattern);
  }

  // Split into paragraphs for better readability
  const paragraphs = text.split("\n\n").filter((p) => p.trim());

  if (paragraphs.length > 1) {
    return formatMultipleParagraphs(paragraphs);
  }

  return <p>{parseMarkdown(text)}</p>;
};

/**
 * Formats text with numbered list into an ordered list
 * @param {string} text - Text containing numbered items
 * @param {RegExp} numberedPattern - Pattern to match numbered items
 * @returns {JSX.Element}
 */
const formatNumberedList = (text, numberedPattern) => {
  const parts = text.split(/(?=\d+[\)\.]\s+)/);
  const intro = parts[0].replace(numberedPattern, "").trim();
  const items = parts
    .slice(1)
    .map((part) => part.replace(/^\d+[\)\.]\s+/, "").trim())
    .filter((item) => item.length > 0);

  return (
    <>
      {intro && <p>{parseMarkdown(intro)}</p>}
      {items.length > 0 && (
        <ol>
          {items.map((item, index) => (
            <li key={index}>{parseMarkdown(item)}</li>
          ))}
        </ol>
      )}
    </>
  );
};

/**
 * Formats multiple paragraphs with proper spacing
 * @param {string[]} paragraphs - Array of paragraph strings
 * @returns {JSX.Element}
 */
const formatMultipleParagraphs = (paragraphs) => {
  return (
    <>
      {paragraphs.map((para, index) => (
        <p key={index}>{parseMarkdown(para.trim())}</p>
      ))}
    </>
  );
};

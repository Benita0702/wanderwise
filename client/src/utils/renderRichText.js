// utils/renderRichText.js
import React from "react";

const renderNode = (node, index) => {
  if (!node) return null;

  switch (node.type) {
    case "heading":
      if (node.level === 1) return <h1 key={index}>{node.children.map(renderNode)}</h1>;
      if (node.level === 2) return <h2 key={index}>{node.children.map(renderNode)}</h2>;
      if (node.level === 3) return <h3 key={index}>{node.children.map(renderNode)}</h3>;
      return <h4 key={index}>{node.children.map(renderNode)}</h4>;

    case "paragraph":
      return <p key={index}>{node.children.map(renderNode)}</p>;

    case "list":
      if (node.format === "unordered") {
        return <ul key={index}>{node.children.map(renderNode)}</ul>;
      } else {
        return <ol key={index}>{node.children.map(renderNode)}</ol>;
      }

    case "list-item":
      return <li key={index}>{node.children.map(renderNode)}</li>;

    case "text":
      return node.text;

    default:
      return node.children ? node.children.map(renderNode) : null;
  }
};

const renderRichText = (content) => {
  if (!content) return null;

  try {
    return content.map((node, index) => renderNode(node, index));
  } catch (error) {
    console.error("Error rendering rich text:", error);
    return <p>Error displaying content</p>;
  }
};

export default renderRichText;

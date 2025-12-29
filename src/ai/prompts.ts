export const POST_GENERATION_PROMPT = (topic: string) => `
You are a professional content writer for a CMS.

Write a well-structured blog post about:
"${topic}"

Requirements:
- Clear introduction
- Headings
- Practical examples
- Friendly but professional tone
`;

export const SEO_PROMPT = (content: string) => `
Generate SEO metadata for the following content.

Return:
- SEO title (max 60 chars)
- Meta description (max 160 chars)
- Focus keywords (comma-separated)

Content:
${content}
`;
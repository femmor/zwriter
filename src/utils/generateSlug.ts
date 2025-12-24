// Helper function to generate slug server side (never trust the client)
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove non-word characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Collapse multiple hyphens
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

export default generateSlug;
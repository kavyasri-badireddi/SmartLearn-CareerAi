const NAME_RE = /^[A-Za-z0-9 _-]+$/;

export function normalizeTemplateName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function validateTemplateName(name: string) {
  const n = normalizeTemplateName(name);
  if (n.length < 3 || n.length > 100) {
    throw new Error("VALIDATION: name must be 3-100 characters.");
  }
  if (!NAME_RE.test(n)) {
    throw new Error("VALIDATION: name may contain letters, numbers, spaces, hyphens, underscores only.");
  }
  return n;
}

export function validateRegistryPath(registryPath: string) {
  const p = (registryPath || "").trim();
  if (!p) throw new Error("VALIDATION: registry_path is required.");

  // Basic OCI image reference with mandatory tag (no digest-only references for now).
  // Examples:
  // - ghcr.io/org/image:v1
  // - registry.example.com:5000/ns/image:tag
  const hasTag = /:[^/]+$/.test(p);
  if (!hasTag) {
    throw new Error("VALIDATION: registry_path must include a mandatory tag (e.g., ghcr.io/org/image:v1).");
  }
  return p;
}

export function validateDescription(description: string) {
  const d = (description || "").trim();
  if (!d) throw new Error("VALIDATION: description is required.");
  if (d.length > 300) throw new Error("VALIDATION: description max length is 300.");
  // "Plain text only" guard: reject obvious markup.
  if (/[<>]/.test(d)) throw new Error("VALIDATION: description must be plain text.");
  return d;
}

export const AllowedCategories = new Set([
  "Deep Learning",
  "LLM Inference",
  "Image Generation",
  "Fine-Tuning",
  "Model Serving",
  "Development",
  "Training",
]);

export function validateCategory(category: string) {
  if (!AllowedCategories.has(category)) {
    throw new Error(`VALIDATION: category must be one of: ${Array.from(AllowedCategories).join(", ")}.`);
  }
  return category;
}


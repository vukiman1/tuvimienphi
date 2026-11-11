const GOOGLE_IDENTITY_SCRIPT_TAGS = /<script\b[^>]*accounts\.google\.com\/gsi\/[^>]*><\/script>/g;
const GOOGLE_IDENTITY_LINK_TAGS = /<link\b[^>]*accounts\.google\.com\/gsi\/[^>]*>/g;

export function stripGoogleIdentityTags(html) {
  return html.replace(GOOGLE_IDENTITY_SCRIPT_TAGS, '').replace(GOOGLE_IDENTITY_LINK_TAGS, '');
}

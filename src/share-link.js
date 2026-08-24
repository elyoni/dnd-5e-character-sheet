// Encodes/decodes a character (or a wrapped {lang, state} / {lang, characters})
// into the base64 payload both dnd_character_sheet.src.html's `#char=...`/
// `#charbundle=...` share links and field-guide.src.html's "Open in
// Character Sheet" links use — the same functions, not two copies that could
// drift out of sync, injected into both files via the
// <!-- BUILD:MODULE src/share-link.js --> marker in build.js.
function encodeStateToBase64(obj){
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}
function decodeBase64ToState(b64){
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}

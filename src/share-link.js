// Encodes/decodes a character (or a wrapped {lang, state} / {lang, characters})
// into the base64 payload both dnd_character_sheet.src.html's `#char=...`/
// `#charbundle=...` share links and field-guide.src.html's "Open in
// Character Sheet" links use — the same functions, not two copies that could
// drift out of sync, injected into both files via the
// <!-- BUILD:MODULE src/share-link.js --> marker in build.js.
//
// The payload is gzip-compressed (via the native CompressionStream API)
// before base64-encoding, since an uncompressed filled-out character can run
// to ~17,000 URL characters — long enough that some messaging apps split it
// across multiple messages when pasted. There's no explicit format marker:
// decoding tries gunzip first and falls back to the old plain-JSON path if
// that throws, so links already shared before compression was added (and
// links opened in browsers without CompressionStream, which fall back to
// the uncompressed encoding on write) keep decoding correctly forever. See
// docs/adr/0009-compressed-share-links.md.
function bytesToBase64(bytes){
  let bin = "";
  for(let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function base64ToBytes(b64){
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
async function encodeStateToBase64(obj){
  const json = JSON.stringify(obj);
  if(typeof CompressionStream === "function"){
    try{
      const cs = new CompressionStream("gzip");
      const writer = cs.writable.getWriter();
      writer.write(new TextEncoder().encode(json));
      writer.close();
      const buf = await new Response(cs.readable).arrayBuffer();
      return bytesToBase64(new Uint8Array(buf));
    }catch(err){}
  }
  return btoa(unescape(encodeURIComponent(json)));
}
async function decodeBase64ToState(b64){
  if(typeof DecompressionStream === "function"){
    try{
      const ds = new DecompressionStream("gzip");
      const writer = ds.writable.getWriter();
      writer.write(base64ToBytes(b64));
      writer.close();
      const buf = await new Response(ds.readable).arrayBuffer();
      return JSON.parse(new TextDecoder().decode(buf));
    }catch(err){}
  }
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}

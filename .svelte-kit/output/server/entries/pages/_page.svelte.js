import { y as bind_props, v as pop, t as push } from "../../chunks/index.js";
import { a as attr } from "../../chunks/attributes.js";
function _page($$payload, $$props) {
  push();
  let data = $$props["data"];
  const imgUrl = data.webcam?.imageUrl ?? "";
  if (data.webcam) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<img${attr("src", imgUrl)}${attr("alt", data.webcam.title || "Rainy webcam")} style="position:fixed;inset:0;width:100vw;height:100vh;object-fit:cover;"/>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div style="display:grid;place-items:center;position:fixed;inset:0;font-family:system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji;"><div style="text-align:center;color:#888;"><div style="font-size:20px;margin-bottom:8px;">No rainy webcam found right now.</div> <div style="font-size:14px;">Try again in a moment.</div> `);
    if (data.hasWindyKey === false) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div style="font-size:13px;margin-top:8px;color:#a66;">Missing WINDY_WEBCAMS_API_KEY. See README for setup.</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { data });
  pop();
}
export {
  _page as default
};

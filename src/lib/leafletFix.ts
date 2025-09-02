// lib/leafletFix.ts
// import L from "leaflet";

// import markerIcon2x from "../../public/leaflet/marker-icon-2x.png"
// import markerIcon from "../../public/leaflet/marker-icon.png";
// import markerShadow from "../../public/leaflet/marker-shadow.png";

// // @ts-ignore (TypeScript doesn't like overriding prototype internals)
// delete (L.Icon.Default.prototype as any)._getIconUrl;

// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// export default L;

// src/lib/leafletFix.ts
import L from "leaflet";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

export default L;


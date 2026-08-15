import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const requiredFiles = ["index.html", "styles.css", "app.js", "README.md", "KIRO_HANDOFF.md"];
const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length) throw new Error(`Missing required files: ${missing.join(", ")}`);

const html = readFileSync("index.html", "utf8");
const js = readFileSync("app.js", "utf8");
const readme = readFileSync("README.md", "utf8");

for (const asset of ["styles.css", "app.js"]) {
  if (!html.includes(asset)) throw new Error(`index.html does not reference ${asset}`);
}

new vm.Script(js, { filename: "app.js" });

const markers = [
  "Admission Nurse",
  "Case Manager",
  "Director of Nursing",
  "Executive",
  "Clinician",
  "Duplicate",
  "Verified with Vendor",
  "Contribution Margin",
  "Preventable Service",
  "Pickup ETA",
  "Delivery ETA"
];

const normalizedJs = js.toLocaleLowerCase("en-US");
const absentMarkers = markers.filter((marker) => !normalizedJs.includes(marker.toLocaleLowerCase("en-US")));
if (absentMarkers.length) throw new Error(`Expected workflow markers are absent: ${absentMarkers.join(", ")}`);
if (!readme.includes("synthetic") && !readme.includes("Synthetic")) {
  throw new Error("README must preserve the synthetic-data boundary.");
}

console.log("BetterRX DME Direct validation passed.");

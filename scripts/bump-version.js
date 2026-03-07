#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const newVersion = process.argv[2];
if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error("Usage: node scripts/bump-version.js <version>");
  console.error("Example: node scripts/bump-version.js 3.9.0");
  process.exit(1);
}

const root = path.resolve(__dirname, "..");

// 1. package.json
const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const oldVersion = pkg.version;
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`package.json: ${oldVersion} -> ${newVersion}`);

// 2. android/app/build.gradle
const gradlePath = path.join(root, "android/app/build.gradle");
let gradle = fs.readFileSync(gradlePath, "utf8");
const versionCodeMatch = gradle.match(/versionCode (\d+)/);
if (!versionCodeMatch) {
  console.error("Could not find versionCode in build.gradle");
  process.exit(1);
}
const oldCode = parseInt(versionCodeMatch[1], 10);
const newCode = oldCode + 1;
gradle = gradle.replace(/versionCode \d+/, `versionCode ${newCode}`);
gradle = gradle.replace(/versionName ".*?"/, `versionName "${newVersion}"`);
fs.writeFileSync(gradlePath, gradle);
console.log(`build.gradle: versionName "${oldVersion}" -> "${newVersion}", versionCode ${oldCode} -> ${newCode}`);

// 3. ios/B1Mobile/Info.plist
const plistPath = path.join(root, "ios/B1Mobile/Info.plist");
let plist = fs.readFileSync(plistPath, "utf8");
plist = plist.replace(
  /(<key>CFBundleShortVersionString<\/key>\s*<string>).*?(<\/string>)/,
  `$1${newVersion}$2`
);
const buildNumMatch = plist.match(/<key>CFBundleVersion<\/key>\s*<string>(\d+)<\/string>/);
if (!buildNumMatch) {
  console.error("Could not find CFBundleVersion in Info.plist");
  process.exit(1);
}
const oldBuild = parseInt(buildNumMatch[1], 10);
const newBuild = oldBuild + 1;
plist = plist.replace(
  /(<key>CFBundleVersion<\/key>\s*<string>)\d+(<\/string>)/,
  `$1${newBuild}$2`
);
fs.writeFileSync(plistPath, plist);
console.log(`Info.plist: ${oldVersion} -> ${newVersion}, build ${oldBuild} -> ${newBuild}`);

// 4. ios project.pbxproj
const pbxPath = path.join(root, "ios/B1Mobile.xcodeproj/project.pbxproj");
let pbx = fs.readFileSync(pbxPath, "utf8");
pbx = pbx.replace(/MARKETING_VERSION = .*?;/g, `MARKETING_VERSION = ${newVersion};`);
pbx = pbx.replace(/CURRENT_PROJECT_VERSION = \d+;/g, `CURRENT_PROJECT_VERSION = ${newBuild};`);
fs.writeFileSync(pbxPath, pbx);
console.log(`project.pbxproj: MARKETING_VERSION -> ${newVersion}, CURRENT_PROJECT_VERSION -> ${newBuild}`);

console.log(`\nVersion bumped to ${newVersion} successfully.`);

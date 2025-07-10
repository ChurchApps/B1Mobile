#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const settingsGradlePath = path.join(__dirname, '..', 'android', 'settings.gradle');
const fixToAdd = `
// Manually include expo-json-utils since it's required by expo-manifests
include ':expo-json-utils'
project(':expo-json-utils').projectDir = new File(rootProject.projectDir, '../node_modules/expo-manifests/node_modules/expo-json-utils/android')`;

try {
  const content = fs.readFileSync(settingsGradlePath, 'utf8');
  
  // Check if the fix is already applied
  if (content.includes(':expo-json-utils')) {
    console.log('expo-json-utils fix already applied');
    return;
  }
  
  // Add the fix to the end of the file
  const updatedContent = content + fixToAdd;
  fs.writeFileSync(settingsGradlePath, updatedContent);
  
  console.log('Applied expo-json-utils fix to android/settings.gradle');
} catch (error) {
  console.error('Error applying expo-json-utils fix:', error.message);
}
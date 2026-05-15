/**
 * Regenerates ./android when `expo prebuild` fails with "files.map is not a function"
 * (glob / rename step on Windows). Copies the Expo template, then applies config plugins.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { getConfig } = require('@expo/config');
const { getPrebuildConfigAsync } = require('@expo/prebuild-config');
const { compileModsAsync } = require('@expo/config-plugins');
const { copyTemplateFiles } = require('@expo/cli/build/src/prebuild/copyTemplateFiles');
const { cloneTemplateAsync } = require('@expo/cli/build/src/prebuild/resolveTemplate');
const { getTemplateFilesToRenameAsync, renameTemplateAppNameAsync } =
  require('@expo/cli/build/src/prebuild/renameTemplateAppName');

async function main() {
  const androidDir = path.join(projectRoot, 'android');
  if (fs.existsSync(androidDir)) {
    console.log('android/ already exists — run with FORCE=1 to regenerate');
    if (process.env.FORCE !== '1') return;
    fs.rmSync(androidDir, { recursive: true, force: true });
  }

  const { exp, pkg } = getConfig(projectRoot);
  const templateDirectory = path.join(projectRoot, '.expo-template-cache');
  fs.mkdirSync(templateDirectory, { recursive: true });

  console.log('Downloading Expo native template…');
  await cloneTemplateAsync({
    templateDirectory,
    projectRoot,
    template: undefined,
    exp,
    ora: { start: () => { }, succeed: () => { }, fail: () => { } },
  });

  console.log('Copying android/ from template…');
  copyTemplateFiles(projectRoot, {
    templateDirectory,
    platforms: ['android'],
  });

  console.log('Renaming HelloWorld → app name…');
  const files = await getTemplateFilesToRenameAsync(projectRoot);
  if (!Array.isArray(files)) {
    throw new Error(
      `getTemplateFilesToRenameAsync returned ${files?.constructor?.name}, expected string[]`,
    );
  }
  await renameTemplateAppNameAsync(projectRoot, { files, expName: exp.name });

  console.log('Applying Expo config plugins (WatermelonDB, etc.)…');
  const { exp: config } = await getPrebuildConfigAsync(projectRoot, {
    platforms: ['android'],
  });
  await compileModsAsync(config, {
    projectRoot,
    platforms: ['android'],
    introspect: false,
  });

  console.log('Done. Run: npx expo run:android');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

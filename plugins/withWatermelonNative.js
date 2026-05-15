const { withDangerousMod, withMainApplication, withPodfile } = require('@expo/config-plugins');
const fs = require('fs/promises');
const path = require('path');

const WM_IMPORT = 'import com.nozbe.watermelondb.WatermelonDBPackage';
const WM_ADD = 'add(WatermelonDBPackage())';

/**
 * WatermelonDB needs the iOS simdjson pod; Android needs WatermelonDBPackage on the host when
 * autolinking does not surface WMDatabaseBridge (common with Expo's PackageList template).
 *
 * Expo SDK 55+ uses Kotlin MainApplication with:
 *   PackageList(this).packages.apply { ... }
 * The injection must match flexible whitespace and must not skip when only an import exists.
 */
function addWatermelonImport(contents) {
  if (!contents.includes('import com.facebook.react.PackageList') || contents.includes(WM_IMPORT)) {
    return contents;
  }
  return contents.replace(
    'import com.facebook.react.PackageList',
    `import com.facebook.react.PackageList\n${WM_IMPORT}`,
  );
}

/** @returns {string} */
function addWatermelonPackageRegistration(contents) {
  if (contents.includes(WM_ADD)) {
    return contents;
  }

  // Expo / RN Kotlin template: PackageList(this).packages.apply { ... }
  const kotlinApply = /PackageList\s*\(\s*this\s*\)\s*\.\s*packages\s*\.\s*apply\s*\{\s*\r?\n/;
  if (kotlinApply.test(contents)) {
    return contents.replace(kotlinApply, (m) => `${m}          ${WM_ADD}\n`);
  }

  // Legacy comment anchor (Java or older templates)
  if (contents.includes('// add(MyReactNativePackage())')) {
    return contents.replace(
      '// add(MyReactNativePackage())',
      `// add(MyReactNativePackage())\n          ${WM_ADD}`,
    );
  }

  return contents;
}

function withWatermelonNative(config) {
  config = withMainApplication(config, (modConfig) => {
    const { modResults } = modConfig;
    if (!modResults?.contents) {
      return modConfig;
    }

    let contents = modResults.contents;
    // Only skip when the package is actually registered, not merely mentioned in a comment.
    if (contents.includes(WM_ADD)) {
      return modConfig;
    }

    if (!contents.includes('PackageList')) {
      return modConfig;
    }

    const next = addWatermelonPackageRegistration(addWatermelonImport(contents));
    if (next !== contents) {
      modResults.contents = next;
    }
    return modConfig;
  });

  config = withPodfile(config, (modConfig) => {
    let contents = modConfig.modResults.contents;
    if (contents.includes("pod 'simdjson'") || contents.includes('pod "simdjson"')) {
      return modConfig;
    }
    const simdjsonPod =
      "  pod 'simdjson', path: '../node_modules/@nozbe/simdjson', :modular_headers => true\n";
    if (contents.includes('post_install do |installer|')) {
      contents = contents.replace(
        /post_install do \|installer\|/,
        `${simdjsonPod}\npost_install do |installer|`,
      );
    } else {
      contents += `\n${simdjsonPod}`;
    }
    modConfig.modResults.contents = contents;
    return modConfig;
  });

  config = withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const proguardPath = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro',
      );
      try {
        let pro = await fs.readFile(proguardPath, 'utf8');
        const keep = '-keep class com.nozbe.watermelondb.** { *; }';
        if (!pro.includes(keep)) {
          pro += `\n# @nozbe/watermelondb\n${keep}\n`;
          await fs.writeFile(proguardPath, pro);
        }
      } catch {
        /* prebuild may not have android yet */
      }
      return modConfig;
    },
  ]);

  return config;
}

module.exports = withWatermelonNative;

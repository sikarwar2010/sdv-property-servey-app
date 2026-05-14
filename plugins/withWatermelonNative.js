const { withDangerousMod, withMainApplication, withPodfile } = require('@expo/config-plugins');
const fs = require('fs/promises');
const path = require('path');

/**
 * WatermelonDB needs the iOS simdjson pod; Android needs WatermelonDBPackage on the host when
 * autolinking does not surface WMDatabaseBridge (common with Expo's PackageList template).
 */
function withWatermelonNative(config) {
  config = withMainApplication(config, (modConfig) => {
    const { modResults } = modConfig;
    if (!modResults?.contents || modResults.contents.includes('WatermelonDBPackage')) {
      return modConfig;
    }
    let contents = modResults.contents;
    if (!contents.includes('PackageList(this)')) {
      return modConfig;
    }

    contents = contents.replace(
      'import com.facebook.react.PackageList',
      'import com.facebook.react.PackageList\nimport com.nozbe.watermelondb.WatermelonDBPackage',
    );

    if (contents.includes('// add(MyReactNativePackage())')) {
      contents = contents.replace(
        '// add(MyReactNativePackage())',
        '// add(MyReactNativePackage())\n          add(WatermelonDBPackage())',
      );
    } else {
      contents = contents.replace(
        /PackageList\(this\)\.packages\.apply\s*\{\s*\n/,
        'PackageList(this).packages.apply {\n          add(WatermelonDBPackage())\n',
      );
    }

    modResults.contents = contents;
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

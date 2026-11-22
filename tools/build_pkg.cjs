const { TVWebApp } = require('C:/Users/diego/.vscode/extensions/tizensdk.tizentv-1.3.3/node_modules/@tizentv/webide-common-tizentv');

(async () => {
  try {
    const projectPath = 'C:/Users/diego/cleanyourtizen/launcher';
    const profilePath = 'C:/Users/diego/tizen-studio-data/profile/profiles.xml';

    const webApp = TVWebApp.openProject(projectPath);
    if (!webApp) {
      console.error('Failed to open project at', projectPath);
      process.exit(1);
    }
    console.log('Building signed widget with profile:', profilePath);
    await webApp.buildWidget(profilePath, []);
    console.log('BUILD_PACKAGE_SUCCESS');
  } catch (err) {
    console.error('BUILD_PACKAGE_ERROR:', err);
    process.exit(1);
  }
})();

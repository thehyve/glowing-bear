// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

exports.config = {
  ignoreUncaughtExceptions: true,
  allScriptsTimeout: 20000,

  specs: [
    './e2e/features/*.feature'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  directConnect: true,

  baseUrl: 'http://localhost:4200/',

  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),

  cucumberOpts: {
    compiler: "ts:ts-node/register",
    strict: true,
    require: ['./e2e/stepdefinitions/**/*.ts'],
  },

  onPrepare: function () {
    browser.driver.manage().window().setSize(1280, 1024);
  },

  useAllAngular2AppRoots: true
};

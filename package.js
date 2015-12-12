'use strict';

Package.describe({
  name: 'tuul:autoform-selectize',
  summary: 'Fork of vazco:universe-autoform-select with better control over css and some bug fixes',
  version: '0.1.20',
  git: 'https://github.com/tuulbox/autoform-selectize'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use('ecmascript');

  if(!api.addAssets) {
    api.addAssets = function(files, platform){
      api.addFiles(files, platform, {isAsset: true})
    };
  }

  api.use('templating');
  api.use('aldeed:autoform@4.0.0 || 5.0.0');
  api.use('fourseven:scss@3.1.1');

  api.use(['underscore', 'reactive-var'], 'client');

  api.addFiles('vendor/speakingurl.min.js', 'client');

  api.addFiles([
    'universe-autoform-select.html',
    'universe-autoform-select.js',
    'stylesheets/_selectize.default.scss',
    'stylesheets/_universe-autoform-select.scss'
  ], 'client');

  api.addAssets('img/loading.gif', 'client');
});

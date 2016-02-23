'use strict';

Package.describe({
  name: 'tuul:autoform-selectize',
  summary: 'Fork of vazco:universe-autoform-select with better control over css and some bug fixes',
  version: '0.1.28',
  git: 'https://github.com/tuulbox/autoform-selectize'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');
  api.use('ecmascript');
  api.use('templating');
  api.use('aldeed:autoform@5.8.0');
  api.use('fourseven:scss@3.1.1');
  api.use(['underscore', 'reactive-var'], 'client');

  if(!api.addAssets) {
    api.addAssets = function(files, platform){
      api.addFiles(files, platform, {isAsset: true})
    };
  }

  api.addFiles([
    'vendor/speakingurl.min.js',
    'universe-autoform-select.html',
    'universe-autoform-select.js',
    'universe-autoform-label.html',
  ], 'client');

  api.addFiles([
    'stylesheets/_selectize.default.scss',
    'stylesheets/_universe-autoform-select.scss',
  ], 'client',  {isImport: true});

  api.addAssets('img/loading.gif', 'client');
});

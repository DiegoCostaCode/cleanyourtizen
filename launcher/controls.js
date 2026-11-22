// Pure helpers for the control center and its About (Giới thiệu) view. ES5 for the Tizen 6.5 browser.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CytControls = factory();
}(this, function () {
  'use strict';
  var FAILED = 'Não disponível', PREVIEW = 'Modo Demonstração';
  var NOTE = 'Privacidade total · Sem coleta de dados · Sem conexão externa';
  var PLATFORM_VERSION = 'http://tizen.org/feature/platform.version';
  var MODES = {guard: 'Manter launcher ao pressionar Home', observe: 'Apenas observar'};

  // TV strings are shown as text only; still trim them, collapse spaces and bound the length.
  function text(value, max) {
    if (typeof value !== 'string') return '';
    var clean = value.replace(/\s+/g, ' ').trim();
    return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
  }
  function formatVersion(value) {
    var clean = text(value, 32);
    return /^[0-9]{1,4}(\.[0-9]{1,6}){0,3}([-+][0-9A-Za-z.-]{1,20})?$/.test(clean) ? clean : '';
  }
  function formatPlatform(value) {
    var clean = typeof value === 'number' && isFinite(value) ? String(value) : text(value, 16);
    return /^[0-9]{1,2}(\.[0-9]{1,3}){0,2}$/.test(clean) ? 'Tizen ' + clean : '';
  }
  function dimension(value) { return typeof value === 'number' && value % 1 === 0 && value > 0 && value <= 16384; }
  function formatResolution(display) {
    if (!display || !dimension(display.resolutionWidth) || !dimension(display.resolutionHeight)) return '';
    return display.resolutionWidth + ' × ' + display.resolutionHeight;
  }
  function formatServiceMode(mode) {
    return typeof mode === 'string' && Object.prototype.hasOwnProperty.call(MODES, mode) ? MODES[mode] : '';
  }
  function count(value) { return typeof value === 'number' && value % 1 === 0 && value >= 0 && value < 1000; }
  function formatDock(apps, inputs) {
    if (!count(apps)) return '';
    return String(apps) + (count(inputs) && inputs > 0 ? '  ·  ' + inputs + ' entradas' : '');
  }
  // [label, value] pairs for the About view.
  function aboutRows(info) {
    var data = info && typeof info === 'object' ? info : {};
    var missing = data.preview === true ? PREVIEW : FAILED, build = data.build && typeof data.build === 'object' ? data.build : {};
    return [
      ['Versão do Launcher', formatVersion(data.version) || missing],
      ['Modelo da TV', text(build.model, 40) || missing],
      ['Versão do Software', text(build.buildVersion, 40) || missing],
      ['Sistema Operacional', formatPlatform(data.platform) || missing],
      ['Resolução', formatResolution(data.display) || missing],
      ['Apps na Barra', formatDock(data.dockApps, data.dockInputs) || FAILED],
      ['Serviço em Segundo Plano', formatServiceMode(data.serviceMode) || missing]
    ];
  }
  // Read-only TV facts for the About view. Every call is guarded; a TV that never answers is cut off after waitMs.
  function readAbout(api, done, waitMs) {
    var result = {preview: !api, build: null, display: null, platform: null};
    var names = ['BUILD', 'DISPLAY'], pending = names.length, finished = false, timer = null;
    function finish() {
      if (finished) return;
      finished = true; if (timer !== null) clearTimeout(timer); done(result);
    }
    if (!api || !api.systeminfo) { finish(); return; }
    var info = api.systeminfo;
    try { result.platform = info.getCapability(PLATFORM_VERSION); } catch (error) { result.platform = null; }
    timer = setTimeout(finish, typeof waitMs === 'number' ? waitMs : 3000);
    names.forEach(function (name) {
      var answered = false;
      function settle(value) {
        if (answered || finished) return;
        answered = true;
        if (value && typeof value === 'object') result[name.toLowerCase()] = value;
        pending -= 1; if (pending <= 0) finish();
      }
      try { info.getPropertyValue(name, settle, function () { settle(null); }); }
      catch (error) { settle(null); }
    });
  }
  return {aboutRows: aboutRows, readAbout: readAbout, formatVersion: formatVersion, formatPlatform: formatPlatform,
    formatResolution: formatResolution, formatServiceMode: formatServiceMode, formatDock: formatDock,
    FAILED: FAILED, PREVIEW: PREVIEW, NOTE: NOTE};
}));

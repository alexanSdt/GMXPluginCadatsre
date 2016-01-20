gmxCore.addModule('CadastreLoader', {}, {
    css: 'L.Cadastre/src/L.Cadastre.css',
    init: function(module, modulePath) {
        var path = modulePath + 'L.Cadastre/src/',
            corePluginLoader = gmxCore.loadScript(path + 'L.Cadastre.js')
                .then(gmxCore.loadScript.bind(gmxCore, path + 'L.Cadastre.Info.js', null, null)),
            imageOverlayLoader = gmxCore.loadModule('L.ImageOverlay.Pane');
        
        return $.when(corePluginLoader, imageOverlayLoader);
    }
});
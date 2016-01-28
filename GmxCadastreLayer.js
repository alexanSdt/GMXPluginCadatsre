(function () {

"use strict";

var DEFAULT_ZINDEX = 3000000;
var loadScripts = _.once(function() {
    if (!L.Cadastre && 'gmxCore' in window) {
        return gmxCore.loadModule('CadastreLoader', gmxCore.getModulePath('CadastreVirtualLayer') + 'DynamicLoader.js');
    } else {
        return $.Deferred().resolve();
    }
});

var CadastreVirtualLayer = L.LayerGroup.extend({
    initFromDescription: function(layerDescription) {
        this._gmxProperties = layerDescription.properties;
        this._loadAndAddLayer = _.once(this._loadAndAddLayer);
        return this;
    },
    getGmxProperties: function() {
        return this._gmxProperties;
    },
    
    _loadAndAddLayer: function() {
        loadScripts().then(function() {
            var options = {
                zIndex: DEFAULT_ZINDEX
            };
            
            var meta = this._gmxProperties.MetaProperties;
            if (meta['cadastre-infoMode']) {
                options.infoMode = true;
            }
            
            if (meta['cadastre-dx'] || meta['cadastre-dy']) {
                var dx = meta['cadastre-dx'] ? Number(meta['cadastre-dx'].Value) : 0,
                    dy = meta['cadastre-dy'] ? Number(meta['cadastre-dy'].Value) : 0;
                options.shiftPosition = L.point(dx, dy);
            };
            
            var cadastreLayer = new L.Cadastre(null, options);
            this.addLayer(cadastreLayer);
        }.bind(this));
    },
    
    onAdd: function(map) {
        L.LayerGroup.prototype.onAdd.call(this, map);
        this._loadAndAddLayer();
    }
});

L.gmx.addLayerClass('Cadastre', CadastreVirtualLayer);

window.gmxCore && gmxCore.addModule('CadastreVirtualLayer', {layerClass: CadastreVirtualLayer});

})();

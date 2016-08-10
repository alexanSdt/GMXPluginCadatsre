(function () {
    'use strict';

    window._translationsHash.addtext("rus", {
        '$$search$$_Cadastre_0' : 'Поиск по адресам, координатам',
        '$$search$$_Cadastre_1' : 'Поиск по адресам, координатам, кадастровым номерам',
        cadastrePlugin: {
            name: 'Кадастр Росреестра',
            doSearch: 'Найти'
        }
    });

    window._translationsHash.addtext("eng", {
        '$$search$$_Cadastre_0' : 'Search by addresses, coordinates',
        '$$search$$_Cadastre_1' : 'Search by addresses, coordinates, cadastre number',
        cadastrePlugin: {
            name: 'Cadastre',
            doSearch: 'Search'
        }
    });

    var lmap, layerWMS;

    var publicInterface = {
        pluginName: 'Cadastre',

        afterViewer: function (params, map) {
            var lmap = nsGmx.leafletMap,
				gmxLayers = lmap.gmxControlsManager.get('layers'),
				layerGroup = L.layerGroup(),
				layerWMS;

            gmxLayers.addOverlay(layerGroup, window._gtxt('cadastrePlugin.name'));

            lmap
                .on('layeradd', function (ev) {
                    if (ev.layer === layerGroup) {
						if (!layerWMS) {
							L.gmx.loadLayer('E7FDC4AA37E94F8FB7F7DA8D62D92D2E', '601A1D04DD5140388BF5C1A3AD5588F5').then(function(cadastreLayer) {
								layerWMS = cadastreLayer;
								layerGroup.addLayer(cadastreLayer);
								layerWMS.getContainer().style.cursor = 'help';
							});
						} else {
							layerWMS.getContainer().style.cursor = 'help';
						}
					}
				});
        }
    };

    window.gmxCore && window.gmxCore.addModule('cadastre', publicInterface, {});
})();

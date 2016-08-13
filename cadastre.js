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
    L.CadUtils = {
        overlays: {},
        setOverlay: function(attr) {
            var ids = attr.type === 5 ? [0, 1 , 2, 3, 4, 5] : [6, 7],
                params = {
                    size: attr.size.join(','),
                    bbox: attr.bbox.join(','),
                    layers: 'show:' + ids.join(','),
                    layerDefs: '{' + ids.map(function(nm) {
                        return '\"' + nm + '\":\"ID = \'' + attr.id + '\'"'
                    }).join(',') + '}',
                    format: 'png32',
                    dpi: 96,
                    transparent: 'true',
                    imageSR: 102100,
                    bboxSR: 102100
                },
                imageUrl = 'http://pkk5.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/export?f=image';

            for (var key in params) {
                imageUrl += '&' + key + '=' + params[key];
            }
            var overlay = new L.ImageOverlay(imageUrl, attr.map.getBounds(), {opacity: 0.5, clickable: true})
                .on('load', function(ev) {
                    L.DomUtil.addClass(overlay._image, 'help-cadastre');
                });
            return overlay;
        },
        getFeatureExtent: function(attr, map) {
            var R = 6378137,
                crs = L.Projection.SphericalMercator,
                bounds = map.getPixelBounds(),
                ne = map.options.crs.project(map.unproject(bounds.getTopRight())),
                sw = map.options.crs.project(map.unproject(bounds.getBottomLeft())),
                latLngBounds = L.latLngBounds(
                    crs.unproject(L.point(attr.extent.xmin, attr.extent.ymin).divideBy(R)),
                    crs.unproject(L.point(attr.extent.xmax, attr.extent.ymax).divideBy(R))
                );
            
            return {
                map: map,
                id: attr.attrs.id,
                type: attr.type,
                size: [bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y],
                bbox: [sw.x, sw.y, ne.x, ne.y],
                latlng: crs.unproject(L.point(attr.center.x, attr.center.y).divideBy(R)),
                latLngBounds: latLngBounds
            };
        },
        parseData: function(data) {
            for (var i = 0, len = data.features.length; i < len; i++) {
                var it = data.features[i];
                if (it.attrs.address) {
                    return it;
                }
            }
            return null;
        },
        getContent: function(it, cadastrePkk5, popup) {
            var map = cadastrePkk5._map,
                res = L.DomUtil.create('div', 'cadInfo'),
                div = L.DomUtil.create('div', 'cadItem', res);
            L.DomUtil.create('div', 'cadNum', div).innerHTML = it.attrs.cn || '';
            L.DomUtil.create('div', 'address', div).innerHTML = it.attrs.address || '';
            var inputShowObject = L.DomUtil.create('input', 'ShowObject', div),
                showObject = L.DomUtil.create('span', 'ShowObjectLabel', div);
            showObject.innerHTML = 'показать участок';
            inputShowObject.type = 'checkbox';
            inputShowObject._cad = it.attrs.cn;
            if (cadastrePkk5._overlays[inputShowObject._cad]) {
                inputShowObject.checked = true;
            }
            L.DomEvent.on(inputShowObject, 'change', function() {
                var id = this._cad;
                if (cadastrePkk5._overlays[id]) {
                    map.removeLayer(cadastrePkk5._overlays[id]);
                    delete cadastrePkk5._overlays[id];
                }
                if (this.checked) {
                    var it = popup._its;
                    var featureExtent = L.CadUtils.getFeatureExtent(it, map);

                    var onViewreset = function() {
                        map.off('moveend', onViewreset);
                        featureExtent = L.CadUtils.getFeatureExtent(it, map);
                        cadastrePkk5._overlays[id] = L.CadUtils.setOverlay(featureExtent).addTo(map);
                    };
                    map.on('moveend', onViewreset);
                    map.fitBounds(featureExtent.latLngBounds, {reset: true});
                }
            });
            popup._its = it;
            return res;
        },
        balloon: function(ev) {
            if (ev.type === 'click') {
                var cadastrePkk5 = this,
                    map = this._map,
                    latlng = ev.latlng;

                if (this._lastOpenedPopup && map.hasLayer(this._lastOpenedPopup)) { map.removeLayer(this._lastOpenedPopup); }
                var popup = L.popup()
                    .setLatLng(latlng)
                    .setContent('<div class="cadInfo">Поиск информации...</div>')
                    .openOn(map);

                this._lastOpenedPopup = popup;
                L.gmxUtil.getCadastreFeatures(L.extend(ev, {callbackParamName: 'callback'})).then(function(data) {
                    var res = 'В данной точке объекты не найдены.<br><div class="red">Возможно участок свободен !</div>';
                    var it = L.CadUtils.parseData(data);
                    if (it) {
                        res = L.CadUtils.getContent(it, cadastrePkk5, popup);
                    }
                    popup.setContent(res);
                    return 1;
                });
            }
        }
    };

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
                                cadastreLayer._overlays = {};
								layerWMS = cadastreLayer;
								layerGroup.addLayer(cadastreLayer);
								layerWMS.getContainer().style.cursor = 'help';
                                lmap.on('click', function(ev) {
                                    L.CadUtils.balloon.call(layerWMS, {type: 'click', latlng: ev.latlng});
                                });
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

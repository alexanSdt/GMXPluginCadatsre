(function () {
    'use strict';

    window._translationsHash.addtext("rus", {
        '$$search$$_Cadastre_0' : 'Поиск по адресам, координатам',
        '$$search$$_Cadastre_1' : 'Поиск по кадастру, адресам, координатам',
        cadastrePlugin: {
            name: 'Кадастр Росреестра',
            doSearch: 'Найти'
        }
    });

    window._translationsHash.addtext("eng", {
        '$$search$$_Cadastre_0' : 'Search by addresses, coordinates',
        '$$search$$_Cadastre_1' : 'Search by cadastre, addresses, coordinates',
        cadastrePlugin: {
            name: 'Cadastre',
            doSearch: 'Search'
        }
    });
	L.ImageOverlay.CrossOrigin = L.ImageOverlay.extend({
	  _updateOpacity: function () {
		this._image.crossOrigin = 'anonymous';
		L.DomUtil.setOpacity(this._image, this.options.opacity);
	  },
	  onRemove: function (map) {
		L.ImageOverlay.prototype.onRemove.call(this, map);
		if (this._dObj) {
			this._dObj.remove();
		}
	  },
	  exportGeometry: function () {
		var pathPoints = MSQR(this._image, {path2D: false, maxShapes: 10}),
			_map = this._map;
		var rings = pathPoints.map(function (it) {
			var ring = it.map(function (p) {
				return L.point(p.x, p.y);
			});
			ring = L.LineUtil.simplify(ring, 1);
			return ring.map(function (p) {
				return _map.containerPointToLatLng(p);
			});
		});
		if (rings.length) {
			var obj = rings.length > 1 ? L.multiPolygon(rings) : L.polygon(rings[0]);
			this._dObj = _map.gmxDrawing.add(obj);
			_map.addLayer(this._dObj);
			this.bringToBack();
			_map._pathRoot.style.cursor = 'help';
		}
	  }
	});

	/*
		MSQR v0.2.1 alpha
		(c) 2016 K3N / Epistemex
		www.epistemex.com
		MIT License
	*/
	function MSQR(C,u){u=u||{};var g;if(C instanceof CanvasRenderingContext2D){g=C}else{if(C instanceof HTMLCanvasElement){g=C.getContext("2d")}else{if(C instanceof HTMLImageElement||C instanceof HTMLVideoElement){g=q(C)}else{throw"Invalid source."}}}var G=g.canvas.width,o=g.canvas.height,l=(u.x||0)|0,m=(u.y||0)|0,k=(u.width||G)|0,f=(u.height||o)|0,e,y=[],x,s=3,p,A,d=Math.max(1,u.bleed||5),t=Math.max(1,u.maxShapes||1),b=Math.max(0,Math.min(254,u.alpha||0)),v=u.padding||0,E=Math.max(0,u.tolerance||0),n=!!u.align,a=u.alignWeight||0.95,B=!!u.path2D,j,r;if(l<0||m<0||l>=G||m>=o||k<1||f<1||l+k>G||m+f>o){return[]}if(t>1||v){e=q(g.canvas);g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle=g.strokeStyle="#000";g.globalAlpha=1;g.shadowColor="rgba(0,0,0,0)";if(v){j=q(g.canvas);r=v<0?4:(v>5?16:8);g.globalCompositeOperation=v<0?"destination-in":"source-over";v=Math.min(10,Math.abs(v));for(var c=0,D=Math.PI*2/r;c<6.28;c+=D){g.drawImage(j.canvas,v*Math.cos(c),v*Math.sin(c))}}g.globalCompositeOperation="destination-out";g.lineWidth=d;g.miterLimit=1;do{x=F();if(x.length){y.push(B?z(x):x);g.beginPath();p=x.length-1;while(A=x[p--]){g.lineTo(A.x,A.y)}g.closePath();g.fill();g.stroke()}}while(x.length&&--t);g.globalCompositeOperation="source-over";g.clearRect(0,0,g.canvas.width,g.canvas.height);g.drawImage(e.canvas,0,0);g.restore();return y}else{x=F();y.push(B?z(x):x)}return y;function F(){var N=[],w,M,L,V,W,T,U,Q=-1,R,O=9,S=[9,0,3,3,2,0,9,3,1,9,1,1,2,0,2,9];w=new Uint32Array(g.getImageData(l,m,k,f).data.buffer);M=w.length;for(L=s;L<M;L++){if((w[L]>>>24)>b){Q=s=L;break}}if(Q>=0){V=T=(Q%k)|0;W=U=(Q/k)|0;do{R=J(V,W);if(R===0){W--}else{if(R===1){W++}else{if(R===2){V--}else{if(R===3){V++}}}}if(R!==O){N.push({x:V+l,y:W+m});O=R}}while(V!==T||W!==U);if(E){N=P(N,E)}if(n&&!v){N=h(N,a)}}function K(i,X){return(i>=0&&X>=0&&i<k&&X<f)?(w[X*k+i]>>>24)>b:false}function J(X,Y){var i=0;if(K(X-1,Y-1)){i|=1}if(K(X,Y-1)){i|=2}if(K(X-1,Y)){i|=4}if(K(X,Y)){i|=8}if(i===6){return O===0?2:3}else{if(i===9){return O===3?0:1}else{return S[i]}}}function P(ai,Z){var ag=ai.length-1;if(ag<2){return ai}var ab=ai[0],ah=ai[ag],aa=Z*Z,ac,ad=-1,X,Y=0,ae,af,aj,ak;for(ac=1;ac<ag;ac++){X=I(ai[ac],ab,ah);if(X>Y){Y=X;ad=ac}}if(Y>aa){ae=ai.slice(0,ad+1);af=ai.slice(ad);aj=P(ae,Z);ak=P(af,Z);return aj.slice(0,aj.length-1).concat(ak)}else{return[ab,ah]}}function I(Z,i,X){var Y=H(i,X),aa;if(!Y){return 0}aa=((Z.x-i.x)*(X.x-i.x)+(Z.y-i.y)*(X.y-i.y))/Y;if(aa<0){return H(Z,i)}else{if(aa>1){return H(Z,X)}else{return H(Z,{x:i.x+aa*(X.x-i.x),y:i.y+aa*(X.y-i.y)})}}}function H(Y,Z){var i=Y.x-Z.x,X=Y.y-Z.y;return i*i+X*X}function h(ad,ah){var aa=[1,-1,-1,1],ab=[1,1,-1,-1],ac,ae=0;while(ac=ad[ae++]){ac.x=Math.round(ac.x);ac.y=Math.round(ac.y);for(var Z=0,af,ag,X,Y;Z<4;Z++){X=aa[Z];Y=ab[Z];af=ac.x+(X<<1);ag=ac.y+(Y<<1);if(af>l&&ag>m&&af<k-1&&ag<f-1){if(!K(af,ag)){af-=X;ag-=Y;if(K(af,ag)){ac.x+=X*ah;ac.y+=Y*ah}}}}}return ad}return N}function q(w){var h=document.createElement("canvas"),i;h.width=w.naturalWidth||w.videoWidth||w.width;h.height=w.naturalHeight||w.videoHeight||w.height;i=h.getContext("2d");i.drawImage(w,0,0);return i}function z(I){var w=new Path2D(),h=0,H;while(H=I[h++]){w.lineTo(H.x,H.y)}w.closePath();return w}}MSQR.getBounds=function(g){var e=9999999,f=9999999,c=-9999999,d=-9999999,a,b=g.length;for(a=0;a<b;a++){if(g[a].x>c){c=g[a].x}if(g[a].x<e){e=g[a].x}if(g[a].y>d){d=g[a].y}if(g[a].y<f){f=g[a].y}}return{x:e|0,y:f|0,width:Math.ceil(c-e),height:Math.ceil(d-f)}};if(typeof exports!=="undefined"){exports.MSQR=MSQR};

    L.CadUtils = {
        overlays: {},
        setOverlay: function(attr) {
            // var ids = attr.type === 5 ? [0, 1 , 2, 3, 4, 5] : [6, 7],
            var ids = [0, 1 , 2, 3, 4, 5, 6, 7, 8, 9, 10],
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
            var overlay = new L.ImageOverlay.CrossOrigin(imageUrl, attr.map.getBounds(), {opacity: 0.5, clickable: true})
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
        parseData: function(data, tolerance) {
            var out = [];
			for (var i = 0, len = data.features.length; i < len; i++) {
                var it = data.features[i],
					cnArr = (it.attrs.cn || '').split(':');

				if (!Number(cnArr[cnArr.length - 1])) { continue; }
				it.title = it.attrs.address || it.attrs.name;
                if (it.extent && it.title && tolerance < Math.max(it.extent.xmax - it.extent.xmin, it.extent.ymax - it.extent.ymin)) {
                    out.push(it);
                }
            }
            return out.sort(function (a, b) {
				return b.sort - a.sort;
			});
		},
        setBoundsView: function(id, it, cadastrePkk5) {
            var map = cadastrePkk5._map,
				featureExtent = L.CadUtils.getFeatureExtent(it, map);

			var onViewreset = function() {
				map.off('moveend', onViewreset);
				featureExtent = L.CadUtils.getFeatureExtent(it, map);
				L.CadUtils._clearOverlays(cadastrePkk5);
				cadastrePkk5._overlays[id] = L.CadUtils.setOverlay(featureExtent).addTo(map).on('load', function() {
					this.exportGeometry();
				});
				
				cadastrePkk5._overlays[id]._image.style.cursor = 'help';
			};
			map.on('moveend', onViewreset);
			map.fitBounds(featureExtent.latLngBounds, {reset: true});
        },
        getContent: function(cadastrePkk5, popup) {
            var map = cadastrePkk5._map,
				curr = popup._itsCurr,
				len = popup._its.length,
				it = popup._its[curr],
				cn = it.attrs.cn || '',
				layer = L.CadUtils.getCadastreLayer(cn.trim()),
				title = (layer.title || '').toUpperCase(),
                res = L.DomUtil.create('div', 'cadInfo'),
                div = L.DomUtil.create('div', 'cadItem', res);

			var cadNav = L.DomUtil.create('div', 'cadNav', div);
			var cadLeft = L.DomUtil.create('span', 'cadLeft', cadNav);
			var cadCount = L.DomUtil.create('span', 'cadCount', cadNav);
			var cadRight = L.DomUtil.create('span', 'cadRight', cadNav);
			cadCount.innerHTML = title + ' (' + (curr + 1) + '/' + len + ')';
			cadLeft.style.visibility = curr ? 'visible' : 'hidden';
			cadLeft.innerHTML = '<';
			cadRight.style.visibility = curr < len - 1 ? 'visible' : 'hidden';
			cadRight.innerHTML = '>';
            L.DomEvent.on(cadLeft, 'click', function() {
				L.CadUtils._clearOverlays(cadastrePkk5);
                popup._itsCurr--;
				popup.setContent(L.CadUtils.getContent(cadastrePkk5, popup));
            });
            L.DomEvent.on(cadRight, 'click', function() {
				L.CadUtils._clearOverlays(cadastrePkk5);
                popup._itsCurr++;
				popup.setContent(L.CadUtils.getContent(cadastrePkk5, popup));
            });

			L.DomUtil.create('div', 'cadNum', div).innerHTML = cn;
            L.DomUtil.create('div', 'address', div).innerHTML = it.title || '';
            var inputShowObject = L.DomUtil.create('input', 'ShowObject', div),
                showObject = L.DomUtil.create('span', 'ShowObjectLabel', div);
            showObject.innerHTML = 'Выделить границу';
            inputShowObject.type = 'checkbox';
            inputShowObject._cad = cn;
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
					L.CadUtils.setBoundsView(id, popup._its[popup._itsCurr], cadastrePkk5);
                }
            });
            return res;
        },
        _clearOverlays: function(cadastrePkk5, map) {
			map = map || cadastrePkk5._map;
			for(var id in cadastrePkk5._overlays) {
				var overlay = cadastrePkk5._overlays[id];
				map.removeLayer(overlay);
				if (overlay._dObj) {
					overlay._dObj.remove();
				}
			}
			cadastrePkk5._overlays = {};
        },
        _clearLastBalloon: function(map) {
			if (this._lastOpenedPopup && map.hasLayer(this._lastOpenedPopup)) { map.removeLayer(this._lastOpenedPopup); }
			this._lastOpenedPopup = null;
        },
        balloon: function(ev) {
            if (ev.type === 'click' && this._map) {
                var cadastrePkk5 = this,
                    map = this._map,
                    latlng = ev.latlng,
					tolerance = Math.floor(1049038 / Math.pow(2, map.getZoom()));

                L.CadUtils._clearLastBalloon(map);
                var popup = L.popup({minWidth: 200})
                    .setLatLng(latlng)
                    .setContent('<div class="cadInfo">Поиск информации...</div>')
                    .openOn(map);

                L.CadUtils._lastOpenedPopup = popup;
                L.gmxUtil.getCadastreFeatures(L.extend(ev, {callbackParamName: 'callback'})).then(function(data) {
                    // var res = 'В данной точке объекты не найдены.<br><div class="red">Возможно участок свободен !</div>';
                    var res = 'В данной точке объекты не найдены.<br><div class="red"></div>';
                    var arr = L.CadUtils.parseData(data, tolerance);
                    if (arr.length) {
						popup._its = arr;
						popup._itsCurr = 0;
                        res = L.CadUtils.getContent(cadastrePkk5, popup);
                    }
                    popup.setContent(res);
                    return 1;
                });
            }
        },
		_cadastreLayers: [
			{id: 5, title: 'ОКС', 		reg: /^\d\d:\d+:\d+:\d+:\d+$/},
			{id: 1, title: 'Участок', 	reg: /^\d\d:\d+:\d+:\d+$/},
			{id: 2, title: 'Квартал',	reg: /^\d\d:\d+:\d+$/},
			{id: 3, title: 'Район', 	reg: /^\d\d:\d+$/},
			{id: 4, title: 'Округ', 	reg: /^\d\d$/},
			{id: 10, title: 'ЗОУИТ', 	reg: /^\d+\.\d+/}
			// ,
			// {id: 7, title: 'Границы', 	reg: /^\w+$/},
			// {id: 6, title: 'Тер.зоны', 	reg: /^\w+$/},
			// {id: 12, title: 'Лес', 		reg: /^\w+$/},
			// {id: 13, title: 'Красные линии', 		reg: /^\w+$/},
			// {id: 15, title: 'СРЗУ', 	reg: /^\w+$/},
			// {id: 16, title: 'ОЭЗ', 		reg: /^\w+$/},
			// {id: 9, title: 'ГОК', 		reg: /^\w+$/},
			// {id: 10, title: 'ЗОУИТ', 	reg: /^\w+$/}
			// /[^\d\:]/g,
			// /\d\d:\d+$/,
			// /\d\d:\d+:\d+$/,
			// /\d\d:\d+:\d+:\d+$/
		],
		getCadastreLayer: function (str) {
			for (var i = 0, len = this._cadastreLayers.length; i < len; i++) {
				var it = this._cadastreLayers[i];
				if (it.reg.exec(str)) { return it; }
			}
			return null;
		}
    };

    var layerGroup,
		searchControl;

    var publicInterface = {
        pluginName: 'Cadastre',

        afterViewer: function (params, map) {
			if (!layerGroup) {
                var lmap = nsGmx.leafletMap,
                    gmxLayers = lmap.gmxControlsManager.get('layers'),
                    layerWMS,
					cadNeedClickLatLng,
					flagSetHook = true;

                layerGroup = L.layerGroup();
                gmxLayers.addOverlay(layerGroup, window._gtxt('cadastrePlugin.name'));
				var clickOn = function(ev) {
					if (!lmap.isGmxDrawing()) {
						lmap._skipClick = true;
						layerGroup._cadClickLatLng = ev.latlng;
						L.CadUtils.balloon.call(layerWMS, {type: 'click', latlng: layerGroup._cadClickLatLng});
					}
				};
                var searchHook = function(str) {
                    str = str.trim();
					var it = L.CadUtils.getCadastreLayer(str);
                    if (!searchControl || !it) { return false; }
					L.gmxUtil.requestJSONP('http://pkk5.rosreestr.ru/api/features/' + it.id,
						{
							WrapStyle: 'func',
							text: str,
							limit: it.limit || 11,
							tolerance: it.tolerance || 64
						},
						{
							callbackParamName: 'callback'
						}
					).then(function(result) {
						// console.log('result', result);
						if (result && result.features && result.features.length) {
							var res = result.features[0];
							L.CadUtils.setBoundsView(res.attrs.cn, res, layerWMS);
						}
					});
                    return true;
                };
				var toogleSearch = function (flag) {
					if (flag) {
						if (!searchControl) {
							searchControl = window.oSearchControl && 'getSearchControl' in window.oSearchControl ? window.oSearchControl.getSearchControl() : null;
						}
						if (searchControl) {
							if (flagSetHook) {
								searchControl.addSearchByStringHook(searchHook, 1001);
								searchControl.SetPlaceholder(_gtxt('$$search$$_Cadastre_1'));
							}
							flagSetHook = false;
						}
					} else {
						if (searchControl) {
							searchControl.removeSearchByStringHook(searchHook);
							searchControl.SetPlaceholder(_gtxt('$$search$$_Cadastre_0'));
						}
						searchControl = null;
						flagSetHook = true;
					}
				};

                lmap
                    .on('layerremove', function (ev) {
                        if (ev.layer === layerGroup) {
							lmap.off('click', clickOn);
							if (layerWMS) { L.CadUtils._clearOverlays(layerWMS, lmap); }
							L.CadUtils._clearLastBalloon(lmap);
							toogleSearch(false);
						}
					})
					.on('layeradd', function (ev) {
                        if (ev.layer === layerGroup) {
                            if (!layerWMS) {
                                L.gmx.loadLayer('E7FDC4AA37E94F8FB7F7DA8D62D92D2E', '601A1D04DD5140388BF5C1A3AD5588F5').then(function(cadastreLayer) {
                                    cadastreLayer._overlays = {};
                                    layerWMS = cadastreLayer;
									cadastreLayer.options.zIndex = 1000000;
                                    layerGroup.addLayer(cadastreLayer);
                                    layerWMS.getContainer().style.cursor = 'help';
									if (cadNeedClickLatLng) {
										clickOn({latlng: cadNeedClickLatLng});
									}
                                });
                            } else {
                                layerWMS.getContainer().style.cursor = 'help';
                            }
							lmap.on('click', clickOn);
							toogleSearch(true);
                        }
                    });
            }
            _mapHelper.customParamsManager.addProvider({
                name: 'CadastrePlugin',
                loadState: function(state) {
                    if (state.isVisible) {
                        lmap.addLayer(layerGroup);
						cadNeedClickLatLng = state.latlng;
                    }
                },
                saveState: function() {
                    return {
                        version: '1.0.0',
                        isVisible: lmap.hasLayer(layerGroup),
						latlng: layerGroup._cadClickLatLng
                    }
                }
            });
        }
    };

    window.gmxCore && window.gmxCore.addModule('cadastre', publicInterface, {});
})();

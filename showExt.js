var ShowExt = function (dx, dy) {
    this.imageLayers = [];
    this.imagesExtentCache = {};
    this._queryCounter = 0;
    this._listeners = {};
    this._visible = false;
    this._images = [];

    //Сдесь хранится смещение экстента(в меркаторе)
    this.dx = dx || 0;
    this.dy = dy || 0;
    this.dragging = false;
};

ShowExt.READY = 100;
ShowExt.EMPTY = 101;
ShowExt.LOADING = 102;

ShowExt.worldsCount = 7;
ShowExt.buildWorlds = function (count) {
    var arr = [];
    var start = -count * 180;
    for (var i = 0; i < count; i++) {
        var d = i * 360;
        var min = start + d,
            max = start + 360 + d;
        var seg = { "min": min, "max": max, center: min + (max - min) * 0.5 };
        arr.push(seg);
    }
    return arr;
};

ShowExt.getWorldByLon = function (lon) {
    for (var i = 0; i < ShowExt._worlds.length; i++) {
        if (ShowExt._worlds[i].min <= lon && lon <= ShowExt._worlds[i].max)
            return ShowExt._worlds[i];
    }
};

ShowExt._worlds = ShowExt.buildWorlds(ShowExt.worldsCount);

ShowExt.NORTH_LIMIT = 83.0;//gmxAPI.from_merc_y(gmxAPI.merc_x(180.0));
ShowExt.SOUTH_LIMIT = -ShowExt.NORTH_LIMIT;


ShowExt.prototype.enableDragging = function (callback, dragendCallback) {
    var xOut, yOut, ex, ey, sx, sy, sdy, sdx;
    var ext = ShowExt.getImagesExtents(this.dx, this.dy);

    var that = this;

    sdx = this.dx;
    sdy = this.dy;

    // Вызывается при mouseMove при нажатой мышке
    var drag = function (x, y, o) {

        xOut = (sx - gmxAPI.merc_x(x) - that.dx) * (-1);
        yOut = (sy - gmxAPI.merc_y(y) - that.dy) * (-1);

        for (var i = 0; i < ext.length; i++) {
            var itx = ShowExt.dxLon(ext[i].globalExtent.minX, -sdx),
                ity = ShowExt.dyLat(ext[i].globalExtent.maxY, -sdy);

            var obj = that.imageLayers[i],
                lObj = gmxAPI._leaflet.mapNodes[obj.objectId].leaflet;
            lObj.setLatLng(new L.LatLng(ShowExt.dyLat(ity, yOut), ShowExt.dxLon(itx, xOut)));
        }

        if (callback)
            callback(xOut, yOut);
    };

    // Вызывается при mouseUp
    var dragEnd = function (x, y, o) {
        ex = gmxAPI.merc_x(x);
        ey = gmxAPI.merc_y(y);

        that.dx = xOut;
        that.dy = yOut;

        if (dragendCallback)
            dragendCallback(that.dx, that.dy);
    };

    // Вызывается при mouseDown
    var dragStart = function (x, y, o) {
        sx = gmxAPI.merc_x(x);
        sy = gmxAPI.merc_y(y);
    };

    for (var i = 0; i < ext.length; i++) {
        this.imageLayers[i].enableDragging(drag, dragStart, dragEnd);
    }

    this.dragging = true;
};

ShowExt.prototype.disableDragging = function () {
    if (this.dragging) {
        for (var i = 0; i < this.imageLayers.length; i++) {
            this.imageLayers[i].disableDragging();
        }
        this.dragging = false;
    }
};

ShowExt.prototype.initialize = function () {
    this._queryCounter = 0;
    for (var i = 0; i < ShowExt.worldsCount; i++) {
        if (!this.imageLayers[i])
            this.imageLayers[i] = gmxAPI.map.addObject();
    }
};

ShowExt.dxLon = function (lon, dx) {
    return gmxAPI.from_merc_x(gmxAPI.merc_x(lon) + dx);
};

ShowExt.dyLat = function (lat, dy) {
    return gmxAPI.from_merc_y(gmxAPI.merc_y(lat) + dy);
};

ShowExt.dxdyExtent = function (extent, dx, dy) {
    return {
        minX: ShowExt.dxLon(extent.minX, dx),
        minY: ShowExt.dyLat(extent.minY, dy),
        maxX: ShowExt.dxLon(extent.maxX, dx),
        maxY: ShowExt.dyLat(extent.maxY, dy)
    };
};

ShowExt.prototype.clearImagesCache = function () {
    for (var c in this.imagesExtentCache) {
        this.imagesExtentCache[c].imageObject = null;
        this.imagesExtentCache[c] = null;
    }
    this.imagesExtentCache = null;
    this.imagesExtentCache = {};
};

ShowExt.prototype.addListener = function (eventName, callback) {
    for (var i = 0; i < this.imageLayers.length; i++) {
        if (this.imageLayers[i]) {
            if (!this._listeners[eventName]) {
                this._listeners[eventName] = [];
            }
            this._listeners[eventName][i] = this.imageLayers[i].addListener(eventName, callback);
        }
    }
};

ShowExt.prototype.removeListener = function (eventName) {
    if (this._listeners[eventName] &&
        this._listeners[eventName].length) {
        for (var i = 0; i < this.imageLayers.length; i++) {
            if (this.imageLayers[i])
                this.imageLayers[i].removeListener(eventName, this._listeners[eventName][i]);
        }
        this._listeners[eventName].length = 0;
    }
};

ShowExt.prototype.setVisibility = function (visibility) {
    this._visible = visibility;
    for (var i = 0; i < this.imageLayers.length; i++) {
        if (this.imageLayers[i])
            this.imageLayers[i].setVisible(visibility);
    }
};

ShowExt.prototype.setCopyright = function (html) {
    this.imageLayers[0].setCopyright(html);
};

ShowExt.prototype.setDepth = function (depth) {
    for (var i = 0; i < this.imageLayers.length; i++) {
        if (this.imageLayers[i])
            this.imageLayers[i].setDepth(depth);
    }
};

ShowExt.prototype.remove = function () {
    for (var l in this._listeners) {
        this.removeListener(l);
    }

    for (var i = 0; i < this.imageLayers.length; i++) {
        if (this.imageLayers[i]) {
            this.imageLayers[i].remove();
            this.imageLayers[i] = null;
        }
    }
};

ShowExt.replaceTemplate = function (template, params) {
    return template.replace(/{[^{}]+}/g, function (key) {
        return params[key.replace(/[{}]+/g, "")] || "";
    });
};

ShowExt.getUrlCadastre = function (urlTemplate, imageExtent) {
    var extent = imageExtent.normalExtent,
        size = imageExtent.imageSize;

    return ShowExt.replaceTemplate(urlTemplate, {
        "minX": extent.minX, "minY": extent.minY,
        "maxX": extent.maxX, "maxY": extent.maxY,
        "width": size.width, "height": size.height
    });
};

//загружает и показывает экстенты всех миров отображаемых на экране
ShowExt.prototype.showScreenExtent = function (urlTemplate, callback) {

    var extents = ShowExt.getImagesExtents(this.dx, this.dy);

    for (var i = 0; i < extents.length; i++) {
        var img = new Image();
        ext = extents[i];
        this._setImagesExtents(urlTemplate, img, ext, i, callback);
    }
};

ShowExt.prototype.abortLoading = function () {
    var imgs = this._images;
    var i = imgs.length;
    while (i--) {
        imgs[i].src = "";
    }
    imgs.length = 0;
};

ShowExt.equal = function (a, b) {
    return a.minX == b.minX && a.minY == b.minY && a.maxX == b.maxX && a.maxY == b.maxY;
};

ShowExt.prototype._setImagesExtents = function (urlTemplate, img, imageExtent, index, callback) {
    var addr = ShowExt.getCacheString(imageExtent);

    if (this.imagesExtentCache[addr] && this.imagesExtentCache[addr].status == ShowExt.READY) {

        this.imageLayers[index].setImageExtent({
            "image": this.imagesExtentCache[addr].imageObject,
            "extent": imageExtent.globalExtent
        });

    } else {
        var that = this;
        img.onload = function () {
            that._queryCounter--;
            that.imagesExtentCache[addr].imageObject = this;
            that.imagesExtentCache[addr].status = ShowExt.READY;

            //Дополнительная проверка на то - что экстенты на экране не изменились.            
            var currExt = ShowExt.getImagesExtents(that.dx, that.dy);
            if (ShowExt.equal(currExt[index].globalExtent, imageExtent.globalExtent)) {
                that.imageLayers[index].setImageExtent({
                    "image": this,
                    "extent": imageExtent.globalExtent
                });
            }

            if (that._queryCounter == 0) {
                that._images.length = 0;
                if (callback)
                    callback();
            }
        };

        img.onerror = function (err) {
            that._queryCounter--;
            console.log(err);
            that.imagesExtentCache[addr].imageObject = null;
            that.imagesExtentCache[addr].status = ShowExt.EMPTY;
            if (that._queryCounter == 0) {
                that._images.length = 0;
                if (callback)
                    callback();
            }
        };

        this._images.push(img);

        this.imagesExtentCache[addr] = { "imageObject": null, "imageExtent": imageExtent, "status": ShowExt.LOADING };
        this._queryCounter++;
        img.src = ShowExt.getUrlCadastre(urlTemplate, imageExtent);
    }

    if (this._queryCounter == 0) {
        if (callback)
            callback();
    }
};

//кешрующая строка для запроса по экстенту и размерам картинки
ShowExt.getCacheString = function (imageExtent) {
    var extent = imageExtent.normalExtent,
        size = imageExtent.imageSize;

    return extent.minX + "_" + extent.minY + "_" + extent.maxX + "_" + extent.maxY + "_" + size.width + "_" + size.height;
};

//Возвращает размеры изображения по долготе, по его начальной и конечной координате на экране
ShowExt.getImageHeight = function (lat_min, lat_max) {
    return ShowExt.merc_to_size(gmxAPI.merc_y(lat_max) - gmxAPI.merc_y(lat_min));
};

//Возвращает размеры изображения по широте, по его начальной и конечной координате на экране
ShowExt.getImageWidth = function (lon_min, lon_max) {
    return ShowExt.merc_to_size(gmxAPI.merc_x(lon_max) - gmxAPI.merc_x(lon_min));
};

ShowExt.createImageExtentSolo = function (lon_min, lat_min, lon_max, lat_max, world, dx, dy) {
    var norm_lon_min = ShowExt.norm_lon(lon_min, world.min),
        norm_lon_max = ShowExt.norm_lon(lon_max, world.min);
    return {
        "imageSize": {
            "width": ShowExt.getImageWidth(norm_lon_min, norm_lon_max),
            "height": ShowExt.getImageHeight(lat_min, lat_max)
        },
        "globalExtent": {
            "minX": lon_min, "minY": lat_min, "maxX": lon_max, "maxY": lat_max
        },
        "normalExtent": {
            "minX": ShowExt.dxLon(norm_lon_min, -dx),
            "minY": ShowExt.dyLat(lat_min, -dy),
            "maxX": ShowExt.dxLon(norm_lon_max, -dx),
            "maxY": ShowExt.dyLat(lat_max, -dy)
        }
    };
};

//возвращает границы и соотвтетсвующие размеры изображений, которые сейчас видны на экране
//P.S. это как-бы расширенная версия функции ShowExt.getWorldsOnTheScreen()
ShowExt.getImagesExtents = function (dx, dy) {
    var ext = gmxAPI._leaflet.LMap.getBounds();
    var north_lim = ext._northEast.lat > ShowExt.NORTH_LIMIT ? ShowExt.NORTH_LIMIT : ext._northEast.lat,
        south_lim = ext._southWest.lat < ShowExt.SOUTH_LIMIT ? ShowExt.SOUTH_LIMIT : ext._southWest.lat;

    var screenWorlds = ShowExt.getWorldsOnTheScreen();
    var res = [];

    if (screenWorlds.length == 1) {
        res.push(ShowExt.createImageExtentSolo(ext._southWest.lng, south_lim, ext._northEast.lng, north_lim, screenWorlds[0], dx, dy));
    } else {
        for (var i = 0; i < screenWorlds.length; i++) {
            var swi = screenWorlds[i];
            var lon_min, lon_max;

            if (i == 0) {
                lon_min = ext._southWest.lng;
                lon_max = swi.max;
            } else if (i == screenWorlds.length - 1) {
                lon_min = swi.min;
                lon_max = ext._northEast.lng;
            } else {
                lon_min = swi.min;
                lon_max = swi.max;
            }

            res.push(ShowExt.createImageExtent(lon_min, south_lim, lon_max, north_lim, swi, dx, dy));
        }
    }

    return res;
};

ShowExt.createImageExtent = function (lon_min, lat_min, lon_max, lat_max, world, dx, dy) {

    var norm_lon_min,
        norm_lon_max;

    var minX, maxX;

    if (lon_max == world.max &&
        lon_min == world.min) {
        //весь экстент

        norm_lon_min = ShowExt.norm_lon(ShowExt.dxLon(lon_min, -dx), world.min),
        norm_lon_max = ShowExt.norm_lon(ShowExt.dxLon(lon_max, -dx), world.min);

        minX = ShowExt.dxLon(lon_min, dx);
        maxX = ShowExt.dxLon(lon_max, dx);

    } else if (lon_max == world.max) {
        //левый экстент

        norm_lon_min = ShowExt.norm_lon(ShowExt.dxLon(lon_min, -dx), world.min),
        norm_lon_max = ShowExt.norm_lon(lon_max, world.min);

        minX = lon_min;
        maxX = ShowExt.dxLon(lon_max, dx);

    } else if (lon_min == world.min) {
        //правый экстент
        norm_lon_min = ShowExt.norm_lon(lon_min, world.min),
        norm_lon_max = ShowExt.norm_lon(ShowExt.dxLon(lon_max, -dx), world.min);

        minX = ShowExt.dxLon(lon_min, dx);
        maxX = lon_max;
    }

    return {
        "imageSize": {
            "width": ShowExt.getImageWidth(norm_lon_min, norm_lon_max),
            "height": ShowExt.getImageHeight(lat_min, lat_max)
        },
        "globalExtent": {
            "minX": minX, "minY": lat_min, "maxX": maxX, "maxY": lat_max
        },
        "normalExtent": {
            "minX": norm_lon_min,
            "minY": ShowExt.dyLat(lat_min, -dy),
            "maxX": norm_lon_max,
            "maxY": ShowExt.dyLat(lat_max, -dy)
        }
    };
};


//возвращает миры, которые в данный момент видны на экране
ShowExt.getWorldsOnTheScreen = function () {
    var ext = gmxAPI._leaflet.LMap.getBounds();
    var minLng = ext._southWest.lng,
        maxLng = ext._northEast.lng;
    var res = [];
    var w = ShowExt._worlds;
    for (i = 0; i < w.length; i++) {
        if (w[i].min >= minLng && w[i].max <= maxLng ||
            w[i].max > minLng && w[i].min < minLng ||
            w[i].min < maxLng && w[i].max >= maxLng) {
            res.push(w[i]);
        }
    }
    return res;
};

//ShowExt.coordsToWorld = function (lonlat, worldIndex) {
//    return [ShowExt._worlds[worldIndex].center + lonlat.lon, lonlat[1]];
//};

//Нормализует долготу к периоду -pi до pi
ShowExt.norm_lon = function (deg, worldMin) {
    return -180 + deg - worldMin;
};

//возвращает кол-во экранных пикселей по размерам в меркаторе на карте.
ShowExt.merc_to_size = function (size) {
    return Math.round(size / gmxAPI.getScale(gmxAPI.map.getZ()));
};
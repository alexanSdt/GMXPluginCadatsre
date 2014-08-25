var ShowExt = function () {
    this.imageLayers = [];
    this.imagesExtentCache = {};
    this._queryCounter = 0;
    this._listeners = {};
    this._visible = false;
    this._images = [];

    //Сдесь хранится смещение экстента(в меркаторе)
    this.dx = 0;
    this.dy = 0;
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

ShowExt.prototype.initialize = function () {
    this._queryCounter = 0;
    for (var i = 0; i < ShowExt.worldsCount; i++) {
        if (!this.imageLayers[i])
            this.imageLayers[i] = gmxAPI.map.addObject();
    }
};

ShowExt.prototype.dxLon = function (lon) {
    return gmxAPI.from_merc_x(gmxAPI.merc_x(lon) + this.dx);
};

ShowExt.prototype.dyLat = function (lat) {
    return gmxAPI.from_merc_y(gmxAPI.merc_y(lat) + this.dy);
};

ShowExt.prototype.ndxLon = function (lon) {
    return gmxAPI.from_merc_x(gmxAPI.merc_x(lon) - this.dx);
};

ShowExt.prototype.ndyLat = function (lat) {
    return gmxAPI.from_merc_y(gmxAPI.merc_y(lat) - this.dy);
};

ShowExt.prototype.ndxdyExtent = function (extent) {
    return {
        minX: this.ndxLon(extent.minX),
        minY: this.ndyLat(extent.minY),
        maxX: this.ndxLon(extent.maxX),
        maxY: this.ndyLat(extent.maxY)
    };
};

ShowExt.prototype.dxdyExtent = function (extent) {
    return {
        minX: this.dxLon(extent.minX),
        minY: this.dyLat(extent.minY),
        maxX: this.dxLon(extent.maxX),
        maxY: this.dyLat(extent.maxY)
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

    var extents = ShowExt.getImagesExtents();

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
            "extent": this.dxdyExtent(this.imageExtent.globalExtent)
        });

    } else {
        var that = this;
        img.onload = function () {
            that._queryCounter--;
            that.imagesExtentCache[addr].imageObject = this;
            that.imagesExtentCache[addr].status = ShowExt.READY;

            //Дополнительная проверка на то - что экстенты на экране не изменились.            
            var currExt = ShowExt.getImagesExtents();
            if (ShowExt.equal(currExt[index].globalExtent, imageExtent.globalExtent)) {
                that.imageLayers[index].setImageExtent({
                    "image": this,
                    "extent": that.dxdyExtent(imageExtent.globalExtent)
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


ShowExt.createImageExtent = function (lon_min, lat_min, lon_max, lat_max, world) {
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
            "minX": norm_lon_min, "minY": lat_min, "maxX": norm_lon_max, "maxY": lat_max
        }
    };
};

//возвращает границы и соотвтетсвующие размеры изображений, которые сейчас видны на экране
//P.S. это как-бы расширенная версия функции ShowExt.getWorldsOnTheScreen()
ShowExt.getImagesExtents = function () {
    var ext = gmxAPI._leaflet.LMap.getBounds();
    var north_lim = ext._northEast.lat > ShowExt.NORTH_LIMIT ? ShowExt.NORTH_LIMIT : ext._northEast.lat,
        south_lim = ext._southWest.lat < ShowExt.SOUTH_LIMIT ? ShowExt.SOUTH_LIMIT : ext._southWest.lat;

    var screenWorlds = ShowExt.getWorldsOnTheScreen();
    var res = [];

    if (screenWorlds.length == 1) {
        res.push(ShowExt.createImageExtent(ext._southWest.lng, south_lim, ext._northEast.lng, north_lim, screenWorlds[0]));
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

            res.push(ShowExt.createImageExtent(lon_min, south_lim, lon_max, north_lim, swi));
        }
    }

    return res;
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
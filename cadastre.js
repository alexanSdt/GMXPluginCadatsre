﻿(function () {

    var STR_PAD_LEFT = 1;
    var STR_PAD_RIGHT = 2;
    var STR_PAD_BOTH = 3;

    function strpad(str, len, pad, dir) {
        if (typeof (len) == "undefined") { var len = 0; }
        if (typeof (pad) == "undefined") { var pad = ' '; }
        if (typeof (dir) == "undefined") { var dir = STR_PAD_RIGHT; }
        if (len + 1 >= str.length) {
            switch (dir) {
                case STR_PAD_LEFT:
                    str = Array(len + 1 - str.length).join(pad) + str;
                    break;
                case STR_PAD_BOTH:
                    var right = Math.ceil((padlen = len - str.length) / 2);
                    var left = padlen - right;
                    str = Array(left + 1).join(pad) + str + Array(right + 1).join(pad);
                    break;
                default:
                    str = str + Array(len + 1 - str.length).join(pad);
                    break;
            }
        }
        return str;
    };

    String.prototype.paddingLeft = function (paddingValue) {
        return String(paddingValue + this).slice(-paddingValue.length);
    };

    var CadastreTypes = {
        okrug: {
            fieldId: "PKK_ID",
            layerUrl: "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/4",
            title: "Кадастровый округ"
        },
        kvartal: {
            fieldId: "PKK_ID",
            layerUrl: "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/2",
            title: "Кадастровый квартал"
        },
        rayon: {
            fieldId: "PKK_ID",
            layerUrl: "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/3",
            title: "Кадастровый район"
        },
        parcel: {
            fieldId: "PARCEL_ID",
            layerUrl: "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/exts/GKNServiceExtension/online/parcel/find",
            title: "Parcel"
        },
        oks: {
            fieldId: "PKK_ID",
            layerUrl: "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/0",
            title: "Oks"
        }
    };

    var getCadastreType = function (cadastreNumber) {
        var cadParts = cadastreNumber.split(":");

        switch (cadParts.length) {
            case 1:
                return CadastreTypes.okrug;
            case 2:
                if (cadParts[1].length > 2)
                    return CadastreTypes.kvartal;
                else
                    return CadastreTypes.rayon;
            case 3:
                if (cadParts[1].length > 2)
                    return CadastreTypes.parcel;
                else
                    return CadastreTypes.kvartal;
            case 4:
                return CadastreTypes.parcel;
            case 5:
                return CadastreTypes.oks;
        }
    };

    var CADASTRE_NUMBER_PARTS_LENGTH = [2, 2, 7, 5, 5];

    var normalizeSearchCadastreNumber = function (number) {
        var numberParts = number.split(":");
        number = '';
        for (var i = 0; i < numberParts.length; i++) {
            if (numberParts[i] != '*') {
                numberParts[i] = strpad(numberParts[i], CADASTRE_NUMBER_PARTS_LENGTH[i], "0", STR_PAD_LEFT);//numberParts[i].pad('0', CADASTRE_NUMBER_PARTS_LENGTH[i]);
                number += numberParts[i];
            }
        }
        return number;
    };

    var checkCadastreNumber = function (number) {
        var cadParts = number.split(":");
        if (cadParts[0].length <= 2 && isNumber(cadParts[0]))
            return true;
        else
            return false;
    }

    _translationsHash.addtext("rus", {
        cadastrePlugin: {
            doSearch: 'Найти'
        }
    });

    _translationsHash.addtext("eng", {
        cadastrePlugin: {
            doSearch: 'Search'
        }
    });


    function getPolygon(geometry) {
        var poly = [];
        geometry.forEach(function (value) {
            poly.push([gmxAPI.from_merc_x(gmxAPI.merc_x(value[0]) - parseFloat(dx).toFixed(2) * (-1)),
                gmxAPI.from_merc_y(gmxAPI.merc_y(value[1]) - parseFloat(dy).toFixed(2) * (-1))]);
        });
        return poly;
    }

    var extendJQuery;
    extendJQuery = function () {
        $('input.inputStyle').each(function () {
            $(this)
			.data('default', $(this).val())
			.addClass('inactive')
			.focus(function () {
			    $(this).removeClass('inactive');
			    if ($(this).val() === $(this).data('default') || $(this).val() === '') {
			        $(this).val('');
			    }
			})
			.blur(function () {
			    if ($(this).val() === '') {
			        $(this).addClass('inactive').val($(this).data('default'));
			    }
			});
        });
    }
    extendJQuery();

    /*Разсширение для String
    *добавлено для нормазации кадастрового номера 10 -> 0010
    *использование '332'.pad('0', 6); -> '000332' или '332'.pad('0', 6, 1); -> '332000'
    */
    String.prototype.pad = function (_char, len, to) {
        if (!this || !_char || this.length >= len) {
            return this;
        }
        to = to || 0;

        var ret = this;

        var max = (len - this.length) / _char.length + 1;
        while (--max) {
            ret = (to) ? ret + _char : _char + ret;
        }
        return ret;
    };

    var dx, dy, map;
    var mapListenerInfo, cadastreLayerListener, cadastreLayerSearchListener; // Listener для идентификации кадастрового участка на карте
    var balloonInfo, balloonSearch; // balloon для идентификации и поиска кадастрового участка на карте
    var cadastreLayerInfo, cadastreLayerSearch, cadastreLayer;
    var cadastreServer;
    var cadastreServerThematic;
    var dialog, inputCadNum;
    var geometryRequest = null;
    var fileName = "";
    var checkCadastre;
    var gParams = null;

    var getHeight = function () {
        var mapExtent = gmxAPI.map.getVisibleExtent();
        var yMin = gmxAPI.merc_y(mapExtent.minY) - dy;
        var yMax = gmxAPI.merc_y(mapExtent.maxY) - dy;
        var yHeight = Math.round((yMax - yMin) * gmxAPI._leaflet['mInPixel']);

        return yHeight;
    }

    var converting = function (coord, typeAxis) {

        if (Math.abs(coord) > 20037508.3427892)
            return;

        if (typeAxis == "x") {
            coord = ((coord / 6378137.0) * 57.295779513082323) - (Math.floor((((coord / 6378137.0) * 57.295779513082323) + 180.0) / 360.0) * 360.0);
        } else if (typeAxis == "y") {
            coord = (1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * coord) / 6378137.0)))) * 57.295779513082323;
        }
        return coord;
    }

    var test = function (value) {
        if (value == null || value == "Null")
            value = "";
        return value;
    };

    var parseDate = function (milliseconds) {
        var parseString = "";
        var date = new Date(milliseconds);
        if (date) {
            var theyear = date.getFullYear();
            var themonth = date.getMonth() + 1;
            var thetoday = date.getDate();
            parseString = thetoday + "." + themonth + "." + theyear;
        }
        return parseString;
    }

    var createBalloonInfo = function (x, y, extent, layerId) {
        if (geometryRequest)
            geometryRequest.abort();
        if (balloonInfo) {
            balloonInfo.setVisible(false);
            balloonInfo.remove();
            balloonInfo = null;
        }
        if (cadastreLayerInfo)
            cadastreLayerInfo.setVisible(false);
        balloonInfo = gmxAPI.map.addBalloon();
        var mousePosX = x;
        var mousePosY = y;
        balloonInfo.setPoint(mousePosX, mousePosY);
        mousePosX = gmxAPI.merc_x(mousePosX);
        mousePosY = gmxAPI.merc_y(mousePosY);
        balloonInfo.setVisible(false);
        var html = "<div style='width:300px; height:300px; overflow-x: hidden; overflow-y: scroll;'>";
        var geoX = gmxAPI.from_merc_x(mousePosX - parseFloat(dx).toFixed(2));
        var geoY = gmxAPI.from_merc_y(mousePosY - parseFloat(dy).toFixed(2));

        var geometry = "";
        $("#loader").show();

        $.ajax(cadastreServer + 'Cadastre/CadastreSelected/MapServer/identify', {
            crossDomain: true,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            async: false,
            dataType: "jsonp",
            jsonpCallback: 'fnsuccesscallback',
            data: {
                f: 'json',
                geometry: '{"x":' + geoX + ',"y":' + geoY + ',"spatialReference":{"wkid":4326}}',
                tolerance: '0',
                returnGeometry: 'true',
                mapExtent: '{"xmin":' + gmxAPI.from_merc_x(gmxAPI.merc_x(extent.minX) - parseFloat(dx).toFixed(2)) + ',"ymin":' + gmxAPI.from_merc_y(gmxAPI.merc_y(extent.minY) - parseFloat(dy).toFixed(2)) + ',"xmax":' + gmxAPI.from_merc_x(gmxAPI.merc_x(extent.maxX) - parseFloat(dx).toFixed(2)) + ',"ymax":' + gmxAPI.from_merc_y(gmxAPI.merc_y(extent.maxY) - parseFloat(dy).toFixed(2)) + ',"spatialReference":{"wkid":4326}}',
                imageDisplay: map.width() + ',' + getHeight() + ',96',
                geometryType: 'esriGeometryPoint',
                sr: '4326',
                layers: layerId || 'top' //top or all or layerId
            }
        }).done(function (data) {
            if (!($.isEmptyObject(data)) && data.results && data.results.length > 0) {
                fileName = data.results[data.results.length - 1].value;
                data.results.forEach(function (value) {
                    switch (value.layerId) {
                        case 20:
                        case 19:
                        case 18:
                        case 17:
                        case 16:
                            html += "<h3>" + test(value.layerName) + ", " + test(value.attributes["Кадастровый номер"]) + "</h3><br><div><table id='tableInfo' style='text-align:left;'>";
                            html += "<tr><th>OBJECTID</th><td>" + test(value.attributes["OBJECTID"]) + "</td></tr>";
                            html += "<tr><th>Ключ СФ</th><td>" + test(value.attributes["Ключ СФ"]) + "</td></tr>";
                            html += "<tr><th>Идентификатор</th><td>" + test(value.attributes["Идентификатор"]) + "</td></tr>";
                            html += "<tr><th>Кадастровый номер</th><td>" + test(value.attributes["Кадастровый номер"]) + "</td></tr>";
                            html += "<tr><th>Наименование</th><td>" + test(value.attributes["Наименование"]) + "</td></tr>";
                            html += "<tr><th>Аннотация</th><td>" + test(value.attributes["Аннотация"]) + "</td></tr>";
                            html += "<tr><th>Число КР</th><td>" + test(value.attributes["Число КР"]) + "</td></tr>";
                            html += "<tr><th>Число КК</th><td>" + test(value.attributes["Число КК"]) + "</td></tr>";
                            html += "<tr><th>Число ЗУ</th><td>" + test(value.attributes["Число ЗУ"]) + "</td></tr>";
                            html += "<tr><th>ACTUAL_DATE</th><td>" + test(value.attributes["ACTUAL_DATE"]) + "</td></tr>";
                            html += "<tr><th>X центра</th><td>" + test(value.attributes["X центра"]) + "</td></tr>";
                            html += "<tr><th>Y центра</th><td>" + test(value.attributes["Y центра"]) + "</td></tr>";
                            html += "<tr><th>Экстент - X мин.</th><td>" + test(value.attributes["Экстент - X мин."]) + "</td></tr>";
                            html += "<tr><th>Экстент - X макс.</th><td>" + test(value.attributes["Экстент - X макс."]) + "</td></tr>";
                            html += "<tr><th>Экстент - Y мин.</th><td>" + test(value.attributes["Экстент - Y мин."]) + "</td></tr>";
                            html += "<tr><th>Экстент - Y макс.</th><td>" + test(value.attributes["Экстент - Y макс."]) + "</td></tr>";
                            html += "<tr><th>Объект обработан - можно удалять</th><td>" + test(value.attributes["Объект обработан - можно удалять"]) + "</td></tr>";
                            html += "<tr><th>ONLINE_ACTUAL_DATE</th><td>" + test(value.attributes["ONLINE_ACTUAL_DATE"]) + "</td></tr>";
                            html += "</table></div>";
                            break
                        case 14:
                        case 13:
                        case 12:
                        case 11:
                            html += "<h3>" + test(value.layerName) + ", " + test(value.attributes["Кадастровый номер"]) + "</h3><br><div><table id='tableInfo' style='text-align:left'>";
                            html += "<tr><th>OBJECTID</th><td>" + test(value.attributes["OBJECTID"]) + "</td></tr>";
                            html += "<tr><th>Ключ СФ</th><td>" + test(value.attributes["Ключ СФ"]) + "</td></tr>";
                            html += "<tr><th>Идентификатор</th><td>" + test(value.attributes["Идентификатор"]) + "</td></tr>";
                            html += "<tr><th>Идентификатор родителя</th><td>" + test(value.attributes["Идентификатор родителя"]) + "</td></tr>";
                            html += "<tr><th>Кадастровый номер</th><td>" + test(value.attributes["Кадастровый номер"]) + "</td></tr>";
                            html += "<tr><th>Наименование</th><td>" + test(value.attributes["Наименование"]) + "</td></tr>";
                            html += "<tr><th>Аннотация</th><td>" + test(value.attributes["Аннотация"]) + "</td></tr>";
                            html += "<tr><th>Код ошибки</th><td>" + test(value.attributes["Код ошибки"]) + "</td></tr>";
                            html += "<tr><th>Число КК</th><td>" + test(value.attributes["Число КК"]) + "</td></tr>";
                            html += "<tr><th>Число ЗУ</th><td>" + test(value.attributes["Число ЗУ"]) + "</td></tr>";
                            html += "<tr><th>Дата актуальности</th><td>" + test(value.attributes["Дата актуальности"]) + "</td></tr>";
                            html += "<tr><th>X центра</th><td>" + test(value.attributes["X центра"]) + "</td></tr>";
                            html += "<tr><th>Y центра</th><td>" + test(value.attributes["Y центра"]) + "</td></tr>";
                            html += "<tr><th>Экстент - X мин.</th><td>" + test(value.attributes["Экстент - X мин."]) + "</td></tr>";
                            html += "<tr><th>Экстент - X макс.</th><td>" + test(value.attributes["Экстент - X макс."]) + "</td></tr>";
                            html += "<tr><th>Экстент - Y мин.</th><td>" + test(value.attributes["Экстент - Y мин."]) + "</td></tr>";
                            html += "<tr><th>Экстент - Y макс.</th><td>" + test(value.attributes["Экстент - Y макс."]) + "</td></tr>";
                            html += "<tr><th>Объект обработан - можно удалять</th><td>" + test(value.attributes["Объект обработан - можно удалять"]) + "</td></tr>";
                            html += "</table></div>";
                            html += '<br /><span style="cursor: pointer; text-decoration: underline;" class="getGeom" >Получить геометрию</span>'
                            break;
                        case 10:
                        case 8:
                        case 7:
                        case 6:
                            html += "<h3>" + test(value.layerName) + ", " + test(value.attributes["Кадастровый номер"]) + "</h3><br><div><table id='tableInfo' style='text-align:left'>";
                            html += "<tr><th>OBJECTID</th><td>" + test(value.attributes["OBJECTID"]) + "</td></tr>";
                            html += "<tr><th>Ключ СФ</th><td>" + test(value.attributes["Ключ СФ"]) + "</td></tr>";
                            html += "<tr><th>Идентификатор</th><td>" + test(value.attributes["Идентификатор"]) + "</td></tr>";
                            html += "<tr><th>Текстовый идентификатор ИПГУ</th><td>" + test(value.attributes["Текстовый идентификатор ИПГУ"]) + "</td></tr>";
                            html += "<tr><th>Числовой идентификатор ИПГУ</th><td>" + test(value.attributes["Числовой идентификатор ИПГУ"]) + "</td></tr>";
                            html += "<tr><th>Идентификатор родителя</th><td>" + test(value.attributes["Идентификатор родителя"]) + "</td></tr>";
                            html += "<tr><th>Кадастровый номер</th><td>" + test(value.attributes["Кадастровый номер"]) + "</td></tr>";
                            html += "<tr><th>Аннотация</th><td>" + test(value.attributes["Аннотация"]) + "</td></tr>";
                            html += "<tr><th>Значение кадастровой стоимости</th><td>" + test(value.attributes["Значение кадастровой стоимости"]) + "</td></tr>";
                            html += "<tr><th>Категория земель (код)</th><td>" + test(value.attributes["Категория земель (код)"]) + "</td></tr>";
                            html += "<tr><th>Вид разрешенного использования (код)</th><td>" + test(value.attributes["Вид разрешенного использования (код)"]) + "</td></tr>";
                            html += "<tr><th>Идентификатор системы координат</th><td>" + test(value.attributes["Идентификатор системы координат"]) + "</td></tr>";
                            html += "<tr><th>Код ошибки</th><td>" + test(value.attributes["Код ошибки"]) + "</td></tr>";
                            html += "<tr><th>Число ЗУ</th><td>" + test(value.attributes["Число ЗУ"]) + "</td></tr>";
                            html += "<tr><th>Дата актуальности квартала</th><td>" + test(value.attributes["Дата актуальности квартала"]) + "</td></tr>";
                            html += "<tr><th>Дата актуальности участков</th><td>" + test(value.attributes["Дата актуальности участков"]) + "</td></tr>";
                            html += "<tr><th>X центра</th><td>" + test(value.attributes["X центра"]) + "</td></tr>";
                            html += "<tr><th>Y центра</th><td>" + test(value.attributes["Y центра"]) + "</td></tr>";
                            html += "<tr><th>Экстент - X мин.</th><td>" + test(value.attributes["Экстент - X мин."]) + "</td></tr>";
                            html += "<tr><th>Экстент - X макс.</th><td>" + test(value.attributes["Экстент - X макс."]) + "</td></tr>";
                            html += "<tr><th>Экстент - Y мин.</th><td>" + test(value.attributes["Экстент - Y мин."]) + "</td></tr>";
                            html += "<tr><th>Экстент - Y макс.</th><td>" + test(value.attributes["Экстент - Y макс."]) + "</td></tr>";
                            html += "<tr><th>Объект обработан - можно удалять</th><td>" + test(value.attributes["Объект обработан - можно удалять"]) + "</td></tr>";
                            html += "</table></div>";
                            html += '<br /><span style="cursor: pointer; text-decoration: underline;" class="getGeom" >Получить геометрию</span>'
                            break;
                        case 4:
                        case 3:
                            html += "<h3>" + test(value.layerName) + ", " + test(value.attributes["Кадастровый номер земельного участка"]) + "</h3><br><div><table id='tableInfo' style='text-align:left'>";
                            html += "<tr><th>OBJECTID</th><td>" + test(value.attributes["OBJECTID"]) + "</td></tr>";
                            html += "<tr><th>Ключ СФ</th><td>" + test(value.attributes["Ключ СФ"]) + "</td></tr>";
                            html += "<tr><th>Строковый идентификатор ИПГУ</th><td>" + test(value.attributes["Строковый идентификатор ИПГУ"]) + "</td></tr>";
                            html += "<tr><th>Идентификатор ПКК</th><td>" + test(value.attributes["Идентификатор ПКК"]) + "</td></tr>";
                            html += "<tr><th>Идентификатор родителя</th><td>" + test(value.attributes["Идентификатор родителя"]) + "</td></tr>";
                            html += "<tr><th>Кадастровый номер земельного участка</th><td>" + test(value.attributes["Кадастровый номер земельного участка"]) + "</td></tr>";
                            html += "<tr><th>Статус земельного участка (код)</th><td>" + test(value.attributes["Статус земельного участка (код)"]) + "</td></tr>";
                            html += "<tr><th>Аннотация</th><td>" + test(value.attributes["Аннотация"]) + "</td></tr>";
                            html += "<tr><th>Значение кадастровой стоимости</th><td>" + test(value.attributes["Значение кадастровой стоимости"]) + "</td></tr>";
                            html += "<tr><th>Вид разрешенного использования (код)</th><td>" + test(value.attributes["Вид разрешенного использования (код)"]) + "</td></tr>";
                            html += "<tr><th>Категория земель (код)</th><td>" + test(value.attributes["Категория земель (код)"]) + "</td></tr>";
                            html += "<tr><th>Дата актуальности</th><td>" + test(value.attributes["Дата актуальности"]) + "</td></tr>";
                            html += "<tr><th>Код ошибки</th><td>" + test(value.attributes["Код ошибки"]) + "</td></tr>";
                            html += "<tr><th>X центра</th><td>" + test(value.attributes["X центра"]) + "</td></tr>";
                            html += "<tr><th>Y центра</th><td>" + test(value.attributes["Y центра"]) + "</td></tr>";
                            html += "<tr><th>Экстент - X мин.</th><td>" + test(value.attributes["Экстент - X мин."]) + "</td></tr>";
                            html += "<tr><th>Экстент - X макс.</th><td>" + test(value.attributes["Экстент - X макс."]) + "</td></tr>";
                            html += "<tr><th>Экстент - Y мин.</th><td>" + test(value.attributes["Экстент - Y мин."]) + "</td></tr>";
                            html += "<tr><th>Экстент - Y макс.</th><td>" + test(value.attributes["Экстент - Y макс."]) + "</td></tr>";
                            html += "<tr><th>Объект обработан - можно удалять</th><td>" + test(value.attributes["Объект обработан - можно удалять"]) + "</td></tr>";
                            html += "<tr><th>G_AREA</th><td>" + test(value.attributes["G_AREA"]) + "</td></tr>";
                            html += "</table></div>";
                            html += '<br /><span style="cursor: pointer; text-decoration: underline;" class="getGeom" >Получить геометрию</span>'
                            break;
                        case 2:
                        case 1:
                            html += "<h3>" + test(value.layerName) + ", " + test(value.attributes["Кадастровый номер"]) + "</h3><br><div><table id='tableInfo'style='text-align:left'>";
                            html += "<tr><th>OBJECTID</th><td>" + test(value.attributes["OBJECTID"]) + "</td></tr>";
                            html += "<tr><th>Ключ СФ</th><td>" + test(value.attributes["Ключ СФ"]) + "</td></tr>";
                            html += "<tr><th>Идентификатор ОКС</th><td>" + test(value.attributes["Идентификатор ОКС"]) + "</td></tr>";
                            html += "<tr><th>Кадастровый номер</th><td>" + test(value.attributes["Кадастровый номер"]) + "</td></tr>";
                            html += "<tr><th>Кадастровый номер старый</th><td>" + test(value.attributes["Кадастровый номер старый"]) + "</td></tr>";
                            html += "<tr><th>Код статуса</th><td>" + test(value.attributes["Код статуса"]) + "</td></tr>";
                            html += "<tr><th>Тип ОКС</th><td>" + test(value.attributes["Тип ОКС"]) + "</td></tr>";
                            html += "<tr><th>Подпись</th><td>" + test(value.attributes["Подпись"]) + "</td></tr>";
                            html += "<tr><th>Дата обновления</th><td>" + test(value.attributes["Дата обновления"]) + "</td></tr>";
                            html += "<tr><th>Объект обработан - можно удалять</th><td>" + test(value.attributes["Объект обработан - можно удалять"]) + "</td></tr>";
                            html += "<tr><th>Идентификатор родителя</th><td>" + test(value.attributes["Идентификатор родителя"]) + "</td></tr>";
                            html += "<tr><th>Числовой идентификатор</th><td>" + test(value.attributes["Числовой идентификатор"]) + "</td></tr>";
                            html += "<tr><th>Кадастровый номер ЗУ</th><td>" + test(value.attributes["Кадастровый номер ЗУ"]) + "</td></tr>";
                            html += "<tr><th>Код ошибки</th><td>" + test(value.attributes["Код ошибки"]) + "</td></tr>";
                            html += "<tr><th>X центра</th><td>" + test(value.attributes["X центра"]) + "</td></tr>";
                            html += "<tr><th>Y центра</th><td>" + test(value.attributes["Y центра"]) + "</td></tr>";
                            html += "<tr><th>Экстент - X мин.</th><td>" + test(value.attributes["Экстент - X мин."]) + "</td></tr>";
                            html += "<tr><th>Экстент - X макс.</th><td>" + test(value.attributes["Экстент - X макс."]) + "</td></tr>";
                            html += "<tr><th>Экстент - Y мин.</th><td>" + test(value.attributes["Экстент - Y мин."]) + "</td></tr>";
                            html += "<tr><th>Экстент - Y макс.</th><td>" + test(value.attributes["Экстент - Y макс."]) + "</td></tr>";
                            html += "</table></div>";
                            html += '<br /><span style="cursor: pointer; text-decoration: underline;" class="getGeom" >Получить геометрию</span>'
                            break;
                    }
                    geometry = value.geometry.rings;
                });
                $("#loader").hide();
                $("#alert").hide();
                balloonInfo.setVisible(true);
                balloonInfo.visible = true;
                balloonInfo.div.innerHTML = html;

                var geom = getGeometry(geometry);
                showGeometry(geom);

                $(".getGeom").click(function () {
                    var result = JSON.stringify([{
                        "properties": { "isVisible": true, "text": "" },
                        "geometry": geom
                    }]);
                    sendCrossDomainPostRequest(serverBase + "Shapefile.ashx", {
                        name: fileName,
                        format: "Shape",
                        points: '',
                        lines: '',
                        polygons: result
                    });
                });

            } else {
                $("#loader").hide();
                $("#alert").show();
            }
        }).fail(function (err) {
            console.log("Ошибка получения данных: " + err);
        });

        balloonInfo.resize();
        balloonInfo.addListener('onClose', function (obj) {
            cadastreLayerInfo.setVisible(false);
        });
    }

    var customSRC = { "wkt": "PROJCS[\"WGS 84 / World Mercator\",GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0],UNIT[\"Degree\",0.017453292519943295]],PROJECTION[\"Mercator\"],PARAMETER[\"False_Easting\",0],PARAMETER[\"False_Northing\",0],PARAMETER[\"Central_Meridian\"," + 104.95158750033377 + "],PARAMETER[\"Standard_Parallel_1\",0],PARAMETER[\"scale_factor\",1],UNIT[\"Meter\",1]]" };
    var centralMeridian = 11683157.27848284;

    var PARCEL_STATES = ['Ранее учтенный', '', 'Условный', 'Внесенный', 'Временный (Удостоверен)', 'Учтенный', 'Снят с учета', 'Аннулированный'];
    var UNITS = { "003": "мм", "004": "см", "005": "дм", "006": "м", "008": "км", "009": "Мм", "047": "морск. м.", "050": "кв. мм", "051": "кв. см", "053": "кв. дм", "055": "кв. м", "058": "тыс. кв. м", "059": "га", "061": "кв. км", "109": "а", "359": "сут.", "360": "нед.", "361": "дек.", "362": "мес.", "364": "кварт.", "365": "полугод.", "366": "г.", "383": "руб.", "384": "тыс. руб.", "385": "млн. руб.", "386": "млрд. руб.", "1000": "неопр.", "1001": "отсутств.", "1002": "руб. за кв. м", "1003": "руб. за а", "1004": "руб. за га", "1005": "иные", "null": "" };
    var NO_DATA = "Нет данных";
    var CATEGORY_TYPES = { "003001000000": "Земли сельскохозяйственного назначения", "003002000000": "Земли поселений (земли населенных пунктов)", "003003000000": "Земли промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, земли для обеспечения космической деятельности, земли обороны, безопасности и земли иного специального назначения", "003004000000": "Земли особо охраняемых территорий и объектов", "003005000000": "Земли лесного фонда", "003006000000": "Земли водного фонда", "003007000000": "Земли запаса", "003008000000": "Категория не установлена" };
    var UTILIZATIONS = { "141000000000": "Для размещения объектов сельскохозяйственного назначения и сельскохозяйственных угодий", "141001000000": "Для сельскохозяйственного производства", "141001010000": "Для использования в качестве сельскохозяйственных угодий", "141001020000": "Для размещения зданий, строений, сооружений, используемых для производства, хранения и первичной переработки сельскохозяйственной продукции", "141001030000": "Для размещения внутрихозяйственных дорог и коммуникаций", "141001040000": "Для размещения водных объектов", "141002000000": "Для ведения крестьянского (фермерского) хозяйства", "141003000000": "Для ведения личного подсобного хозяйства", "141004000000": "Для ведения гражданами садоводства и огородничества", "141005000000": "Для ведения гражданами животноводства", "141006000000": "Для дачного строительства", "141007000000": "Для размещения древесно-кустарниковой растительности, предназначенной для защиты земель от воздействия негативных (вредных) природных, антропогенных и техногенных явлений", "141008000000": "Для научно-исследовательских целей", "141009000000": "Для учебных целей", "141010000000": "Для сенокошения и выпаса скота гражданами", "141011000000": "Фонд перераспределения", "141012000000": "Для размещения объектов охотничьего хозяйства", "141013000000": "Для размещения объектов рыбного хозяйства", "141014000000": "Для иных видов сельскохозяйственного использования", "142000000000": "Для размещения объектов, характерных для населенных пунктов", "142001000000": "Для объектов жилой застройки", "142001010000": "Для индивидуальной жилой застройки", "142001020000": "Для многоквартирной застройки", "142001020100": "Для малоэтажной застройки", "142001020200": "Для среднеэтажной застройки", "142001020300": "Для многоэтажной застройки", "142001020400": "Для иных видов жилой застройки", "142001030000": "Для размещения объектов дошкольного, начального, общего и среднего (полного) общего образования", "142001040000": "Для размещения иных объектов, допустимых в жилых зонах и не перечисленных в классификаторе", "142002000000": "Для объектов общественно-делового значения", "142002010000": "Для размещения объектов социального и коммунально-бытового назначения", "142002020000": "Для размещения объектов здравоохранения", "142002030000": "Для размещения объектов культуры", "142002040000": "Для размещения объектов торговли", "142002040100": "Для размещения объектов розничной торговли", "142002040200": "Для размещения объектов оптовой торговли", "142002050000": "Для размещения объектов общественного питания", "142002060000": "Для размещения объектов предпринимательской деятельности", "142002070000": "Для размещения объектов среднего профессионального и высшего профессионального образования", "142002080000": "Для размещения административных зданий", "142002090000": "Для размещения научно-исследовательских учреждений", "142002100000": "Для размещения культовых зданий", "142002110000": "Для стоянок автомобильного транспорта", "142002120000": "Для размещения объектов делового назначения, в том числе офисных центров", "142002130000": "Для размещения объектов финансового назначения", "142002140000": "Для размещения гостиниц", "142002150000": "Для размещения подземных или многоэтажных гаражей", "142002160000": "Для размещения индивидуальных гаражей", "142002170000": "Для размещения иных объектов общественно-делового значения, обеспечивающих жизнь граждан", "142003000000": "Для общего пользования (уличная сеть)", "142004000000": "Для размещения объектов специального назначения", "142004010000": "Для размещения кладбищ", "142004020000": "Для размещения крематориев", "142004030000": "Для размещения скотомогильников", "142004040000": "Под объектами размещения отходов потребления", "142004050000": "Под иными объектами специального назначения", "142005000000": "Для размещения коммунальных, складских объектов", "142006000000": "Для размещения объектов жилищно-коммунального хозяйства", "142007000000": "Для иных видов использования, характерных для населенных пунктов", "143000000000": "Для размещения объектов промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, обеспечения космической деятельности, обороны, безопасности и иного специального назначения", "143001000000": "Для размещения промышленных объектов", "143001010000": "Для размещения производственных и административных зданий, строений, сооружений и обслуживающих их объектов", "143001010100": "Для размещения производственных зданий", "143001010200": "Для размещения коммуникаций", "143001010300": "Для размещения подъездных путей", "143001010400": "Для размещения складских помещений", "143001010500": "Для размещения административных зданий", "143001010600": "Для размещения культурно-бытовых зданий", "143001010700": "Для размещения иных сооружений промышленности", "143001020000": "Для добычи и разработки полезных ископаемых", "143001030000": "Для размещения иных объектов промышленности", "143002000000": "Для размещения объектов энергетики", "143002010000": "Для размещения электростанций и обслуживающих сооружений и объектов", "143002010100": "Для размещения гидроэлектростанций", "143002010200": "Для размещения атомных станций", "143002010300": "Для размещения ядерных установок", "143002010400": "Для размещения пунктов хранения ядерных материалов и радиоактивных веществ энергетики", "143002010500": "Для размещения хранилищ радиоактивных отходов", "143002010600": "Для размещения тепловых станций", "143002010700": "Для размещения иных типов электростанций", "143002010800": "Для размещения иных обслуживающих сооружений и объектов", "143002020000": "Для размещения объектов электросетевого хозяйства", "143002020100": "Для размещения воздушных линий электропередачи", "143002020200": "Для размещения наземных сооружений кабельных линий электропередачи", "143002020300": "Для размещения подстанций", "143002020400": "Для размещения распределительных пунктов", "143002020500": "Для размещения других сооружений и объектов электросетевого хозяйства", "143002030000": "Для размещения иных объектов энергетики", "143003000000": "Для размещения объектов транспорта", "143003010000": "Для размещения и эксплуатации объектов железнодорожного транспорта", "143003010100": "Для размещения железнодорожных путей и их конструктивных элементов", "143003010200": "Для размещения полос отвода железнодорожных путей", "143003010300": "Для размещения, эксплуатации, расширения и реконструкции строений, зданий, сооружений, в том числе железнодорожных вокзалов, железнодорожных станций, а также устройств и других объектов, необходимых для эксплуатации, содержания, строительства, реконструкции, ремонта, развития наземных и подземных зданий, строений, сооружений, устройств и других объектов железнодорожного транспорта", "143003010301": "Для размещения железнодорожных вокзалов", "143003010302": "Для размещения железнодорожных станций", "143003010303": "Для размещения устройств и других объектов, необходимых для эксплуатации, содержания, строительства, реконструкции, ремонта, развития наземных и подземных зданий, строений, сооружений, устройств и других объектов железнодорожного транспорта", "143003020000": "Для размещения и эксплуатации объектов автомобильного транспорта и объектов дорожного хозяйства", "143003020100": "Для размещения автомобильных дорог и их конструктивных элементов", "143003020200": "Для размещения полос отвода", "143003020300": "Для размещения объектов дорожного сервиса в полосах отвода автомобильных дорог", "143003020400": "Для размещения дорожных сооружений", "143003020500": "Для размещения автовокзалов и автостанций", "143003020600": "Для размещения иных объектов автомобильного транспорта и дорожного хозяйства", "143003030000": "Для размещения и эксплуатации объектов морского, внутреннего водного транспорта", "143003030100": "Для размещения искусственно созданных внутренних водных путей", "143003030200": "Для размещения морских и речных портов, причалов, пристаней", "143003030300": "Для размещения иных объектов морского, внутреннего водного транспорта", "143003030400": "Для выделения береговой полосы", "143003040000": "Для размещения и эксплуатации объектов воздушного транспорта", "143003040100": "Для размещения аэропортов и аэродромов", "143003040200": "Для размещения аэровокзалов", "143003040300": "Для размещения взлетно-посадочных полос", "143003040400": "Для размещения иных наземных объектов воздушного транспорта", "143003050000": "Для размещения и эксплуатации объектов трубопроводного транспорта", "143003050100": "Для размещения нефтепроводов", "143003050200": "Для размещения газопроводов", "143003050300": "Для размещения иных трубопроводов", "143003050400": "Для размещения иных объектов трубопроводного транспорта", "143003060000": "Для размещения и эксплуатации иных объектов транспорта", "143004000000": "Для размещения объектов связи, радиовещания, телевидения, информатики", "143004010000": "Для размещения эксплуатационных предприятий связи и обслуживания линий связи", "143004020000": "Для размещения кабельных, радиорелейных и воздушных линий связи и линий радиофикации на трассах кабельных и воздушных линий связи и радиофикации и их охранные зоны", "143004030000": "Для размещения подземных кабельных и воздушных линий связи и радиофикации и их охранные зоны", "143004040000": "Для размещения наземных и подземных необслуживаемых усилительных пунктов на кабельных линиях связи и их охранные зоны", "143004050000": "Для размещения наземных сооружений и инфраструктур спутниковой связи", "143004060000": "Для размещения иных объектов связи, радиовещания, телевидения, информатики", "143005000000": "Для размещения объектов, предназначенных для обеспечения космической деятельности", "143005010000": "Для размещения космодромов, стартовых комплексов и пусковых установок", "143005020000": "Для размещения командно-измерительных комплексов, центров и пунктов управления полетами космических объектов, приема, хранения и переработки информации", "143005030000": "Для размещения баз хранения космической техники", "143005040000": "Для размещения полигонов приземления космических объектов и взлетно-посадочных полос", "143005050000": "Для размещения объектов экспериментальной базы для отработки космической техники", "143005060000": "Для размещения центров и оборудования для подготовки космонавтов", "143005070000": "Для размещения других наземных сооружений и техники, используемых при осуществлении космической деятельности", "143006000000": "Для размещения объектов, предназначенных для обеспечения обороны и безопасности", "143006010000": "Для обеспечения задач обороны", "143006010100": "Для размещения военных организаций, учреждений и других объектов", "143006010200": "Для дислокации войск и сил флота", "143006010300": "Для проведения учений и иных мероприятий", "143006010400": "Для испытательных полигонов", "143006010500": "Для мест уничтожения оружия и захоронения отходов", "143006010600": "Для создания запасов материальных ценностей в государственном и мобилизационном резервах (хранилища, склады и другие)", "143006010700": "Для размещения иных объектов обороны", "143006020000": "Для размещения объектов (территорий), обеспечивающих защиту и охрану Государственной границы Российской Федерации", "143006020100": "Для обустройства и содержания инженерно-технических сооружений и заграждений", "143006020200": "Для обустройства и содержания пограничных знаков", "143006020300": "Для обустройства и содержания пограничных просек", "143006020400": "Для обустройства и содержания коммуникаций", "143006020500": "Для обустройства и содержания пунктов пропуска через Государственную границу Российской Федерации", "143006020600": "Для размещения иных объектов для защиты и охраны Государственной границы Российской Федерации", "143006030000": "Для размещения иных объектов обороны и безопасности", "143007000000": "Для размещения иных объектов промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, обеспечения космической деятельности, обороны, безопасности и иного специального назначения", "144000000000": "Для размещения особо охраняемых историко-культурных и природных объектов (территорий)", "144001000000": "Для размещения особо охраняемых природных объектов (территорий)", "144001010000": "Для размещения государственных природных заповедников (в том числе биосферных)", "144001020000": "Для размещения государственных природных заказников", "144001030000": "Для размещения национальных парков", "144001040000": "Для размещения природных парков", "144001050000": "Для размещения дендрологических парков", "144001060000": "Для размещения ботанических садов", "144001070000": "Для размещения объектов санаторного и курортного назначения", "144001080000": "Территории месторождений минеральных вод, лечебных грязей, рапы лиманов и озер", "144001090000": "Для традиционного природопользования", "144001100000": "Для размещения иных особо охраняемых природных территорий (объектов)", "144002000000": "Для размещения объектов (территорий) природоохранного назначения", "144003000000": "Для размещения объектов (территорий) рекреационного назначения", "144003010000": "Для размещения домов отдыха, пансионатов, кемпингов", "144003020000": "Для размещения объектов физической культуры и спорта", "144003030000": "Для размещения туристических баз, стационарных и палаточных туристско-оздоровительных лагерей, домов рыболова и охотника, детских туристических станций", "144003040000": "Для размещения туристических парков", "144003050000": "Для размещения лесопарков", "144003060000": "Для размещения учебно-туристических троп и трасс", "144003070000": "Для размещения детских и спортивных лагерей", "144003080000": "Для размещения скверов, парков, городских садов", "144003090000": "Для размещения пляжей", "144003100000": "Для размещения иных объектов (территорий) рекреационного назначения", "144004000000": "Для размещения объектов историко-культурного назначения", "144004010000": "Для размещения объектов культурного наследия народов Российской Федерации (памятников истории и культуры), в том числе объектов археологического наследия", "144004020000": "Для размещения военных и гражданских захоронений", "144005000000": "Для размещения иных особо охраняемых историко-культурных и природных объектов (территорий)", "145000000000": "Для размещения объектов лесного фонда", "145001000000": "Для размещения лесной растительности", "145002000000": "Для восстановления лесной растительности", "145003000000": "Для прочих объектов лесного хозяйства", "146000000000": "Для размещения объектов водного фонда", "146001000000": "Под водными объектами", "146002000000": "Для размещения гидротехнических сооружений", "146003000000": "Для размещения иных сооружений, расположенных на водных объектах", "147000000000": "Земли запаса (неиспользуемые)", "014001000000": "Земли жилой застройки", "014001001000": "Земли под жилыми домами многоэтажной и повышенной этажности застройки", "014001002000": "Земли под домами индивидуальной жилой застройкой", "014001003000": "Незанятые земли, отведенные под жилую застройку", "014002000000": "Земли общественно-деловой застройки", "014002001000": "Земли гаражей и автостоянок", "014002002000": "Земли под объектами торговли, общественного питания, бытового обслуживания, автозаправочными и газонаполнительными станциями, предприятиями автосервиса", "014002003000": "Земли учреждений и организаций народного образования, земли под объектами здравоохранения и социального обеспечения физической культуры и спорта, культуры и искусства, религиозными объектами", "014002004000": "Земли под административно-управлен-ческими и общественными объектами, земли предприятий, организаций, учреждений финансирования, кредитования, страхования и пенсионного обеспечения", "014002005000": "Земли под зданиями (строениями) рекреации", "014003000000": "Земли под объектами промышленности", "014004000000": "Земли общего пользования (геонимы в поселениях)", "014005000000": "Земли под объектами транспорта, связи, инженерных коммуникаций", "014005001000": "Под объектами железнодорожного транспорта", "014005002000": "Под объектами автомобильного транспорта", "014005003000": "Под объектами морского, внутреннего водного транспорта", "014005004000": "Под объектами воздушного транспорта", "014005005000": "Под объектами иного транспорта, связи, инженерных коммуникаций", "014006000000": "Земли сельскохозяйственного использования", "014006001000": "Земли под крестьянскими (фермерскими) хозяйствами", "014006002000": "Земли под предприятиями, занимающимися сельскохозяйственным производством", "014006003000": "Земли под садоводческими объединениями и индивидуальными садоводами", "014006004000": "Земли под огородническими объединениями и индивидуальными огородниками", "014006005000": "Земли под дачными объединениями", "014006006000": "Земли под личными подсобными хозяйствами", "014006007000": "Земли под служебными наделами", "014006008000": "Земли оленьих пастбищ", "014006009000": "Для других сельскохозяйственных целей", "014007000000": "Земли под лесами в поселениях (в том числе городскими лесами), под древесно-кустарниковой растительностью, не входящей в лесной фонд (в том числе лесопарками, парками, скверами, бульварами)", "014008000000": "Земли, занятые водными объектами, земли водоохранных зон водных объектов, а также земли, выделяемые для установления полос отвода и зон охраны водозаборов, гидротехнических сооружений и иных водохозяйственных сооружений, объектов.", "014009000000": "Земли под военными и иными режимными объектами", "014010000000": "Земли под объектами иного специального назначения", "014011000000": "Земли, не вовлеченные в градостроительную или иную деятельность (земли – резерв)", "014012000000": "Неопределено", "014013000000": "Значение отсутствует" };

    var checkCadastreNumber = function (searchedText) {
        var cadastreNumber = "", url;
        searchedText = searchedText.trim();
        if (searchedText.lastIndexOf(":") == searchedText.length - 1) {
            searchedText = searchedText.slice(0, -1);
        }
        if (/^[0-9]{1,2}$/.test(searchedText) || /^[0-9]{1,2}:[0-9]{1,2}$/.test(searchedText) || /^[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,7}$/.test(searchedText) || /^[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,7}:[0-9]{1,4}$/.test(searchedText)) {
            var numberParts = searchedText.split(":");
            if (numberParts.length == 4) {
                cadastreNumber = searchedText;
                return cadastreNumber;
            }

            if (numberParts[0] && numberParts[0].length < 2)
                cadastreNumber += numberParts[0].pad('0', 2);
            else if (numberParts[0] && numberParts[0].length == 2)
                cadastreNumber += numberParts[0];

            if (numberParts[1] && numberParts[1].length < 2)
                cadastreNumber += numberParts[1].pad('0', 2);
            else if (numberParts[1] && numberParts[1].length == 2)
                cadastreNumber += numberParts[1];

            if (numberParts[2] && numberParts[2].length < 7)
                cadastreNumber += numberParts[2].pad('0', 7);
            else if (numberParts[2] && numberParts[2].length == 7)
                cadastreNumber += numberParts[2];

            if (numberParts[3] && numberParts[3].length < 4)
                cadastreNumber += numberParts[3].pad('0', 4);
            else if (numberParts[3] && numberParts[3].length == 4)
                cadastreNumber += numberParts[3];
        }
        return cadastreNumber;
    }

    var cadastreSearch = function (map, value) {
        if (checkCadastreNumber(value)) {
            var cadType = getCadastreType(value);
            $('#loader').show();
            $("#alert").hide();
            if (cadType == CadastreTypes.parcel) {
                $.ajax(cadType.layerUrl, {
                    crossDomain: true,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    async: false,
                    dataType: "jsonp",
                    jsonpCallback: 'fnsuccesscallback',
                    data: {
                        cadNum: value,
                        onlyAttributes: 'false',
                        returnGeometry: 'true',
                        f: 'json'
                    }
                }).done(function (data) {
                    $('#loader').hide();
                    var x = converting(data.features[0].attributes.XC, "x"), y = converting(data.features[0].attributes.YC, "y"), maxX = converting(data.features[0].attributes.XMAX, "x"), minX = converting(data.features[0].attributes.XMIN, "x"), maxY = converting(data.features[0].attributes.YMAX, "y"), minY = converting(data.features[0].attributes.YMIN, "y");
                    if (data.features[0].attributes.ERRORCODE != 1) {
                        map.zoomToExtent(minX, minY, maxX, maxY);
                        var extent = { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
                        createBalloonInfo(x, y, extent, "");
                    } else {
                        map.zoomToExtent(minX, minY, maxX, maxY);
                        if (balloonInfo)
                            balloonInfo.setVisible(false);
                        if (cadastreLayerInfo)
                            cadastreLayerInfo.setVisible(false);
                        var data = data.features[0].attributes;
                        var html = "<div style='width:300px; height:300px; overflow-x: hidden; overflow-y: scroll;'>";
                        balloonSearch = map.addBalloon();
                        balloonSearch.setPoint(x, y);
                        balloonSearch.setVisible(false);
                        html += "<h3>" + "Кадастровые участки" + "</h3><br><div><table style='text-align:left'>";
                        html += "<tr><th>Статус: </th><td>" + test(PARCEL_STATES[parseInt(data["PARCEL_STATUS"]) - 1]) + "</td></tr>";
                        html += "<tr><th>Адрес: </th><td>" + test(data["OBJECT_ADDRESS"]) + "</td></tr>";
                        html += "<tr><th>Декларированная площадь: </th><td>" + test(data["AREA_VALUE"]) + test(UNITS[data["AREA_UNIT"]]) + "</td></tr>";
                        html += "<tr><th>Кадастровая стоимость: </th><td>" + test(data["CAD_COST"]) + test(UNITS[data["CAD_UNIT"]]) + "</td></tr>";
                        html += "<tr><th>Форма собственности: </th><td>" + test(data["RC_TYPE"]) + "</td></tr>";
                        html += "<tr><th>Дата постановки на учет: </th><td>" + test(parseDate(data["DATE_CREATE"])) + "</td></tr>";
                        var Num = data["PARCEL_CN"].substr(0, data["PARCEL_CN"].lastIndexOf(":"));
                        html += "<tr><th>Квартал: </th><td>" + test(Num) + "</td></tr>";
                        Num = Num.substr(0, Num.lastIndexOf(":"));
                        html += "<tr><th>Район: </th><td>" + test(Num) + "</td></tr>";
                        Num = Num.substr(0, Num.lastIndexOf(":"));
                        html += "<tr><th>Округ: </th><td>" + test(Num) + "</td></tr>";
                        html += "<tr><th>Дата обновления сведений ПКК: </th><td>" + test(parseDate(data["ACTUAL_DATE"])) + "</td></tr>";
                        html += "<tr><th>Категория: </th><td>" + test(CATEGORY_TYPES[data["CATEGORY_TYPE"]]) + "</td></tr>";
                        html += "<tr><th>Разрешенное использование </th><td></td></tr>";
                        html += "<tr><th>По классификатору (код): </th><td>" + test(data["UTIL_CODE"]) + "</td></tr>";
                        html += "<tr><th>По классификатору (описание): </th><td>" + test(UTILIZATIONS[data["UTIL_CODE"]]) + "</td></tr>";
                        html += "<tr><th>По документу: </th><td>" + test(data["UTIL_BY_DOC"]) + "</td></tr>";
                        html += "</table><br>";
                        html += '<a target="_blank" href="https://rosreestr.ru/wps/portal/cc_information_online?KN=' + data["PARCEL_CN"] + '">Справочная информация об объекте недвижимости</a><br>';
                        html += '<a target="_blank" href="https://rosreestr.ru/wps/portal/cc_gkn_form_new?KN=' + data["PARCEL_CN"] + '&objKind=002001001000">Запрос о предоставлении сведений ГКН</a><br>';
                        html += '<a target="_blank" href="https://rosreestr.ru/wps/portal/cc_egrp_form_new?KN=' + data["PARCEL_CN"] + '&objKind=002001001000">Запрос о предоставлении сведений ЕГРП</a><br>';
                        html += "</div>";
                        balloonSearch.div.innerHTML = html;
                        balloonSearch.setVisible(true);
                        balloonSearch.resize();
                        balloonSearch.addListener('onClose', function (obj) {
                            cadastreLayerSearch.setVisible(false);
                        });
                    }
                }).fail(function () {
                    $('#loader').hide();
                    $("#alert").show();
                });
            } else {
                var cadastreNumber = normalizeSearchCadastreNumber(value);
                $.getJSON(cadType.layerUrl + '/query?' + 'where=' + encodeURIComponent(cadType.fieldId + " like '" + cadastreNumber + "%'"), {
                    f: 'json',
                    returnGeometry: true,
                    spatialRel: "esriSpatialRelIntersects",
                    outFields: "*",
                    outSR: '4326'
                }).done(function (data) {
                    $('#loader').hide();

                    if (balloonInfo)
                        balloonInfo.setVisible(false);

                    if (cadastreLayerInfo)
                        cadastreLayerInfo.setVisible(false);

                    if (balloonSearch)
                        balloonSearch.setVisible(false);

                    if (cadastreLayerSearch)
                        cadastreLayerSearch.setVisible(false);

                    var geom = getGeometry(data.features[0].geometry.rings);
                    showGeometry(geom);

                    var findInfo = data.features[0].attributes;

                    var x = converting(data.features[0].attributes.XC, "x"),
                        y = converting(data.features[0].attributes.YC, "y"),
                        maxX = converting(data.features[0].attributes.XMAX, "x"),
                        minX = converting(data.features[0].attributes.XMIN, "x"),
                        maxY = converting(data.features[0].attributes.YMAX, "y"),
                        minY = converting(data.features[0].attributes.YMIN, "y");

                    map.zoomToExtent(minX, minY, maxX, maxY);

                    var html = "<div style='width:300px; height:300px; overflow-x: hidden; overflow-y: scroll;'>";
                    balloonSearch = map.addBalloon();
                    balloonSearch.setPoint(converting(findInfo["XC"], "x"), converting(findInfo["YC"], "y"));
                    balloonSearch.setVisible(false);
                    html += "<h3>" + "Кадастровый номер  " + test(findInfo["CAD_NUM"]) + "</h3><br><div><table style='text-align:left'>";
                    html += "<tr><th>Дата обновления сведений ПКК: </th><td> " + test(parseDate(findInfo["ACTUAL_DATE"])) + "</td></tr>";
                    html += "<tr><th>Кадастровый номер: </th><td> " + test(findInfo["CAD_NUM"]) + "</td></tr>";
                    html += "<tr><th>Имя: </th><td> " + test(findInfo["NAME"]) + "</td></tr>";
                    html += "<tr><th>Идентификатор объекта: </th><td> " + test(findInfo["OBJECTID"]) + "</td></tr>";
                    html += "<tr><th>Идентификатор ПКК: </th><td> " + test(findInfo["PKK_ID"]) + "</td></tr>";
                    html += "<tr><th>Ключ региона: </th><td> " + test(findInfo["REGION_KEY"]) + "</td></tr>";
                    html += "<tr><th>X центра: </th><td> " + test(findInfo["XC"]) + "</td></tr>";
                    html += "<tr><th>Y центра: </th><td> " + test(findInfo["YC"]) + "</td></tr>";
                    html += "<tr><th>Макс. X: </th><td> " + test(findInfo["XMAX"]) + "</td></tr>";
                    html += "<tr><th>Мин. X: </th><td> " + test(findInfo["XMIN"]) + "</td></tr>";
                    html += "<tr><th>Макс. Y: </th><td> " + test(findInfo["YMAX"]) + "</td></tr>";
                    html += "<tr><th>Мин. Y: </th><td> " + test(findInfo["YMIN"]) + "</td></tr>";
                    html += "</table><br>";
                    html += '<br /><span style="cursor: pointer; text-decoration: underline;" class="getGeom" >Получить геометрию</span>'
                    html += "</div>";
                    balloonSearch.div.innerHTML = html;
                    balloonSearch.setVisible(true);
                    balloonSearch.resize();
                    cadastreLayerSearch.setVisible(true);
                    balloonSearch.addListener('onClose', function (obj) {
                        cadastreLayerSearch.setVisible(false);
                    });

                    $(".getGeom").click(function () {
                        var result = JSON.stringify([{
                            "properties": { "isVisible": true, "text": "" },
                            "geometry": geom
                        }]);
                        sendCrossDomainPostRequest(serverBase + "Shapefile.ashx", {
                            name: cadastreNumber,
                            format: "Shape",
                            points: '',
                            lines: '',
                            polygons: result
                        });
                    });

                }).fail(function () {
                    $('#loader').hide();
                    $("#alert").show();
                });
            }
        }
    };

    var getGeometry = function (arcgisGeometry) {
        var geom;
        var geo = [];
        if (arcgisGeometry.length > 1) {
            for (var i = 0; i < arcgisGeometry.length; i++) {
                geo.push(getPolygon(arcgisGeometry[i]));
            }
            geom = {
                "type": "MULTIPOLYGON",
                "coordinates": [geo]
            };
        } else {
            geom = {
                "type": "POLYGON",
                "coordinates": [getPolygon(arcgisGeometry[0])]
            };
        }
        return geom;
    };

    var showGeometry = function (geom) {
        cadastreLayerInfo = gmxAPI.map.addObject();
        cadastreLayerInfo.setGeometry(geom);
        cadastreLayerInfo.setStyle({
            outline: {
                color: "#FF9B18",
                thickness: 3,
                opacity: 100
            },
            fill: {
                color: 0xffffff,
                opacity: 0.0
            }
        });
    };

    var Cadastre = function (container, addInfoTools) {
        cadastreLayerSearch = gmxAPI.map.addObject();
        var map = gmxAPI.map;
        var cadastreLegend;

        var fnRefreshMap = function () {
            $(cadastreLegend).toggle(!rbNo.checked);
            var mapExtent = map.getVisibleExtent();
            var queryString = "&bbox=" + (gmxAPI.merc_x(mapExtent.minX) - centralMeridian - dx).toString() + "%2C" + (gmxAPI.merc_y(mapExtent.minY) - dy) + "%2C" + (gmxAPI.merc_x(mapExtent.maxX) - centralMeridian - dx).toString() + "%2C" + (gmxAPI.merc_y(mapExtent.maxY) - dy) + "&bboxSR=" + JSON.stringify(customSRC) + "&imageSR=" + JSON.stringify(customSRC) + "&size=" + map.width() + "," + getHeight() + "&f=image";

            var tUrl = cadastreServerThematic + "Cadastre/Thematic/MapServer/export?dpi=96&transparent=true&format=png32" + queryString;

            if (cbDivision.checked) {
                var sUrl = cadastreServer + "Cadastre/Cadastre/MapServer/export?dpi=96&transparent=true&format=png32" + queryString;
                $("#loader").show();
                cadastreLayer.setImageExtent({ url: sUrl, extent: mapExtent, noCache: true });
                cadastreLayer.setCopyright('<a href="http://rosreestr.ru">© Росреестр</a>');
                addInfoTools && addCadastreInfoTool();
                gmxAPI._tools.standart.setVisible(true);
            } else {
                $("#loader").hide();
                if (gmxAPI._tools.standart.getToolByName("cadastreInfo")) {
                    gmxAPI._tools.standart.removeTool('cadastreInfo');
                    gmxAPI._tools.standart.removeTool('cadastreDx');
                    gmxAPI._tools.standart.selectTool("move");
                }
                if (cadastreLayerInfo)
                    cadastreLayerInfo.setVisible(false);
                if (balloonInfo)
                    balloonInfo.remove();
                if (mapListenerInfo)
                    map.removeListener("onClick", mapListenerInfo);
                if (cadastreLayerListener)
                    map.removeListener("onMoveEnd", cadastreLayerListener);
                if (balloonSearch)
                    balloonSearch.remove();
                if (cadastreLayerSearch)
                    cadastreLayerSearch.setVisible(false);
                if (cadastreLayer)
                    cadastreLayer.setVisible(false);
            }

            if (rbCostLayer.checked) {
                tUrl += "&layers=show:1,7";
                $("#loader").show();
                costLayer.setImageExtent({ url: tUrl, extent: mapExtent, noCache: true });
                cadastreLegend.innerHTML = 'Кадастровая стоимость</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9fUA9usA9+EAPCcsfQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>до 3 млн руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9bgA9rEA96kAxLzpJgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>3 - 15 млн. руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9XsA9ngA93UA+R2pSwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>15 - 30 млн. руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9T0A9kAA90IAF7kxUgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>30 - 100 млн.руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9QAA9hIA9yQAeAUndAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>свыше 100 млн. руб.</span></td></tr></tbody></table';
            }

            if (rbCostByAreaLayer.checked) {
                tUrl += "&layers=show:0,6";
                $("#loader").show();
                costByAreaLayer.setImageExtent({ url: tUrl, extent: mapExtent, noCache: true });
                cadastreLegend.innerHTML = 'Кадастровая стоимость ЗУ за кв. м</br><table cellspacing="0" cellpadding="0" style="width: 203px;"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9fUA9usA9+EAPCcsfQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><table width="95%"><tbody><tr><td align="">до 100 руб за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9bgA9rEA96kAxLzpJgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><table width="95%"><tbody><tr><td align="">от 101 до 1000 руб. за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9XsA9ngA93UA+R2pSwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><table width="95%"><tbody><tr><td align="">от 1001 до 5000 руб. за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9T0A9kAA90IAF7kxUgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><table width="95%"><tbody><tr><td align="">от 5001 до 50000 руб. за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9QAA9hIA9yQAeAUndAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><table width="95%"><tbody><tr><td align="">более 500000 руб. за кв. м</td></tr></tbody></table></td></tr></tbody></table>';
            }

            if (rbUseType.checked) {
                tUrl += "&layers=show:2,4";
                $("#loader").show();
                useTypeLayer.setImageExtent({ url: tUrl, extent: mapExtent, noCache: true });
                cadastreLegend.innerHTML = 'Разрешенные виды использования ЗУ</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/wAA/xIA/yQAxDetmgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли с более чем одним видом использования</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/9if/+Kn/+ywWIVZzQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли жилой застройки</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/8Jy/8t6/9N/nGNq1QAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли под жилыми домами многоэтажной и повышенной этажности застройки</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/50A/6MA/6kA0zjLGAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли под домами индивидуальной жилой застройкой</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY5pkA6ZMA7I4A5xrHhAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Незанятые земли, отведенные под жилую застройку</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+ms//S1//++G44kQgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли общественно-деловой застройки</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+ln//Ru//90X3D6BQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли гаражей и автостоянок</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+kA//QA//8AnfC9ewAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли под объектами торговли, общественного питания, бытового обслуживания, автозаправочными и газонаполнительными станциями, предприятиями автосервиса</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY5uYA6d0A7NMAeryBiQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли учреждений и организаций народного образования, земли под объектами здравоохранения и социального обеспечения физической культуры и спорта, культуры и искусства, религиозными объектами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYqKgAtKIAvZwAgfbyuQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под административно-управленческими и общественными объектами, земли предприятий, организаций, учреждений финансирования, кредитования, страхования и пенсионного обеспечения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYdHQAinEAnW4AzJWFTAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под зданиями (строениями) рекреации</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY5pkA6ZMA7I4A5xrHhAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под объектами промышленности</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYqG8AtGwAvWoA5VasFgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли общего пользования (геонимы в поселениях)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY4eHh5NjX58/MBsJpUwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под объектами транспорта, связи, инженерных коммуникаций</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYzc3N0sXD2Ly5WqFGdQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Под объектами железнодорожного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYs7OzvKyqxaWhGy20FAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Под объектами автомобильного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYnZ2dqpiWtpKN7dt9hwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Под объектами морского, внутреннего водного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYgoKClX98pnt2xUDwLQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Под объектами воздушного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYZ2dngmZjl2RdEF9uXAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Под объектами иного транспорта, связи, инженерных коммуникаций</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY0/++2fS13emsMMNQhAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли сельскохозяйственного использования</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYo/90sPRuu+lnNk+fNAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под крестьянскими (фермерскими) хозяйствами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYVf8AdvQAjukAJrp/BQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под предприятиями, занимающимися сельскохозяйственным производством</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYTeYAcd0AitMAoSK+BAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под садоводческими объединениями и индивидуальными садоводами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYN6gAZqIAhJwA4JYcbQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под огородническими объединениями и индивидуальными огородниками</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYJHQAYHEAf24Ao374EAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под дачными объединениями</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYtdefvs6XxsWPI51NXAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под личными подсобными хозяйствами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYpfV7set1u+FuPSy7WwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под служебными наделами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYiM5mmsZhqb1bRGITZwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли оленьих пастбищ</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYW4hFeoVCkYA9J56HwAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Для других сельскохозяйственных целей</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYTXQAcXEAim4AKDuv6gAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под лесами в поселениях (в том числе городскими лесами), под древесно-кустарниковой растительностью, не входящей в лесной фонд (в том числе лесопарками, парками, скверами, бульварами)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYAMX/WL3ze7Xn/71NNgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли, занятые водными объектами, земли водоохранных зон водных объектов, а также земли, выделяемые для установления полос отвода и зон охраны водозаборов, гидротехнических сооружений и иных водохозяйственных сооружений, объектов.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAAC1QTFRF/v///vTz2dra5tva2c3L/sO7/rSqlJSUqJaU/6KUlH58lF9Y/3ZYAAAAeyQA0xTD0AAAAA90Uk5TAP//////////////////5Y2epgAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHdJREFUKJGd0ksOgCAQA9DhIyAi9z+uiTYyZVjRVZMXFg0jspmjLZJealdwX2pBib19FPA8ZxR/R5Az4h2RFiEiIWLRNImiWQYZ+akakQIqRnLlyUoyT9bCk0mIWDRNomiWQUZ+ikYkgHrEv5eKEnAAaXU2p2zmAUZoBsjYet62AAAAAElFTkSuQmCC"></td><td><span>Земли, не вовлеченные в градостроительную или иную деятельность (земли &ndash; резерв)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYlUu6pE2ysU2ogM8VNAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под военными и иными режимными объектами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYx00zzk0w008r5GEnuAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под объектами иного специального назначения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+nn//Tz////4iZzJgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Неопределено</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+nn//Tz////4iZzJgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Значение отсутствует</span></td></tr></tbody></table>';
            }

            if (rbCategory.checked) {
                tUrl += "&layers=show:3,5";
                $("#loader").show();
                categoryLayer.setImageExtent({ url: tUrl, extent: mapExtent, noCache: true });
                cadastreLegend.innerHTML = 'Категории земель ЗУ</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYAG//TWzza2rnJL3s7wAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли водного фонда</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYtGokuWkkvWYfu6YNWgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли запаса</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYVf8AbvQAgekA3+ZdMgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли лесного фонда</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYJHQAVnEAcW4AZkbUVgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли особо охраняемых территорий и объектов</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZY+Z0A/KMA/6kAOzMlwAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли поселений (земли населенных пунктов)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYdE0AhU0Akk8AWdadagAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, земли для обеспечения космической деятельности, земли обороны, безопасности и земли иного специального назначения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZY6Oms6PS16f++yNID5wAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли сельскохозяйственного назначения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYs7OzuKyqvaWhx9sqFgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Категория не установлена</span></td></tr></tbody></table>';
            }

            if (rbMapUpdate.checked) {
                tUrl += "&layers=show:8";
                $("#loader").show();
                mapUpdateLayer.setImageExtent({ url: tUrl, extent: mapExtent, noCache: true });
                cadastreLegend.innerHTML = 'Актуальность сведений</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWFN6gAQKMfR58wW5lrlgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>менее 1 недели</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWFh8IwiMofi9EAQ7oGzAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>1 - 2 недели</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWFv9wwxuUfzu4A5y7xwQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>2 недели - 1 месяц</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF674w9cYf/80AxdGebAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>1 - 3 месяца</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF63ww9X4f/38ACxZRyQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>3 месяца - 1 год</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF6zAw9R8f/wAAedG9rwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>более 1 года</span></td></tr></tbody></table>';
            }
            if (rbMapVisitors.checked) {
                tUrl += "&layers=show:9";
                $("#loader").show();
                mapVisitorsLayer.setImageExtent({ url: tUrl, extent: mapExtent, noCache: true });
                cadastreLegend.innerHTML = 'Общее количество посещений</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0"src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF676+9cbG/83No3FH3QAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>менее 100 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF656U9aOZ/6eccAhG3wAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>100 000 - 500 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF6YBu84Ju/YVuMQ3iHgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>500 000 - 1 000 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF4mNR7GFL9WBHhZwXygAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>1 000 000 - 5 000 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF10k94EUw6D0k9XeHogAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>5 000 000 - 10 000 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWFzDAw1B8f3AAAabp87wAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>более 10 000 000</span></td></tr></tbody></table>';
            }

            costLayer.setVisible(rbCostLayer.checked);
            costByAreaLayer.setVisible(rbCostByAreaLayer.checked);
            useTypeLayer.setVisible(rbUseType.checked);
            categoryLayer.setVisible(rbCategory.checked);
            mapUpdateLayer.setVisible(rbMapUpdate.checked);
            mapVisitorsLayer.setVisible(rbMapVisitors.checked);
            cadastreLayer.setVisible(cbDivision.checked);

            cadastreLayer.setDepth(1000);
        }
        var cbDivision, rbNo, rbCostLayer, rbCostByAreaLayer, rbUseType, rbCategory, rbMapUpdate, rbMapVisitors, costLayer, costByAreaLayer, useTypeLayer, categoryLayer, mapUpdateLayer, mapVisitorsLayer;
        var div = _div(null, [['dir', 'className', 'cadastreLeftMenuContainer']]);
        var trs = [];

        trs.push(_tr([_td([_span([_t("Поиск по кадастровому номеру")], [['dir', 'className', 'cadastreLeftMenuLabel']])], [['attr', 'colspan', 2]])]));

        var inputField = inputCadNum = _input(null, [['dir', 'className', 'inputStyle'], ['css', 'width', '200px'], ['attr', 'value', '66:41:0402004:16']]);

        inputField.onkeydown = function (e) {
            var evt = e || window.event;
            if (getkey(evt) == 13) {
                cadastreSearch(map, inputField.value);
                return false;
            }
        }

        var goButton = makeButton(_gtxt('cadastrePlugin.doSearch')),
            _this = this;

        goButton.onclick = function () { cadastreSearch(map, inputField.value); }

        trs.push(_tr([_td([inputField], [['attr', 'colspan', 2]]), _td([goButton])]));
        trs.push(_tr([_td([], [['attr', 'height', 15]])]));

        cbDivision = _checkbox(true, 'checkbox');
        cbDivision.setAttribute("id", "cadastreLayer");
        cbDivision.onclick = fnRefreshMap;
        trs.push(_tr([_td([cbDivision]), _td([_label([_t("Кадастровое деление")], [['attr', 'for', 'cadastreLayer'], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]));

        rbNo = _radio([['attr', 'name', 'Zones'], ['attr', 'checked', 'true'], ['attr', 'id', 'rbNo']]);
        rbNo.onclick = fnRefreshMap;
        trs.push(_tr([_td([rbNo]), _td([_label([_t("Нет тематической карты")], [['attr', 'for', 'rbNo'], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]));

        rbCostLayer = _radio([['attr', 'name', 'Zones'], ['attr', 'id', 'rbCostLayer']]);
        rbCostLayer.onclick = fnRefreshMap;
        trs.push(_tr([_td([rbCostLayer]), _td([_label([_t("Кадастровая стоимость")], [['attr', 'for', 'rbCostLayer'], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]));

        rbCostByAreaLayer = _radio([['attr', 'name', 'Zones'], ['attr', 'id', 'rbCostByAreaLayer']]);
        rbCostByAreaLayer.onclick = fnRefreshMap;
        trs.push(_tr([_td([rbCostByAreaLayer]), _td([_label([_t("Кадастровая стоимость за метр")], [['attr', 'for', 'rbCostByAreaLayer'], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]));

        rbUseType = _radio([['attr', 'name', 'Zones'], ['attr', 'id', 'rbUseType']]);
        rbUseType.onclick = fnRefreshMap;
        trs.push(_tr([_td([rbUseType]), _td([_label([_t("Виды разрешенного использования")], [['attr', 'for', 'rbUseType'], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]));

        rbCategory = _radio([['attr', 'name', 'Zones'], ['attr', 'id', 'rbCategory']]);
        rbCategory.onclick = fnRefreshMap;
        trs.push(_tr([_td([rbCategory]), _td([_label([_t("Категории земель")], [['attr', 'for', 'rbCategory'], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]));

        rbMapUpdate = _radio([['attr', 'name', 'Zones'], ['attr', 'id', 'rbMapUpdate']]);
        rbMapUpdate.onclick = fnRefreshMap;
        trs.push(_tr([_td([rbMapUpdate]), _td([_label([_t("Актуальность сведений")], [['attr', 'for', 'rbMapUpdate'], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]));

        rbMapVisitors = _radio([['attr', 'name', 'Zones'], ['attr', 'id', 'rbMapVisitors']]);
        rbMapVisitors.onclick = fnRefreshMap;
        trs.push(_tr([_td([rbMapVisitors]), _td([_label([_t("Общее количество посещений")], [['attr', 'for', 'rbMapVisitors'], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]));

        this.mapObject = gmxAPI.map.addObject();
        costLayer = this.mapObject.addObject(null, { type: 'Overlay' });
        costByAreaLayer = this.mapObject.addObject(null, { type: 'Overlay' });
        useTypeLayer = this.mapObject.addObject(null, { type: 'Overlay' });
        categoryLayer = this.mapObject.addObject(null, { type: 'Overlay' });
        mapUpdateLayer = this.mapObject.addObject(null, { type: 'Overlay' });
        mapVisitorsLayer = this.mapObject.addObject(null, { type: 'Overlay' });
        cadastreLayer = this.mapObject.addObject();

        cadastreLayer.addListener('onImageLoad', function (e) {
            $("#loader").hide();
            $("#alert").hide();
        });
        cadastreLayer.addListener('onImageError', function (e) {
            $("#loader").hide();
            $("#alert").show();
        });

        costLayer.addListener('onImageLoad', function (e) {
            $("#loader").hide();
            $("#alert").hide();
        });
        costLayer.addListener('onImageError', function (e) {
            $("#loader").hide();
            $("#alert").show();
        });

        costByAreaLayer.addListener('onImageLoad', function (e) {
            $("#loader").hide();
            $("#alert").hide();
        });
        costByAreaLayer.addListener('onImageError', function (e) {
            $("#loader").hide();
            $("#alert").show();
        });

        useTypeLayer.addListener('onImageLoad', function (e) {
            $("#loader").hide();
            $("#alert").hide();
        });
        useTypeLayer.addListener('onImageError', function (e) {
            $("#loader").hide();
            $("#alert").show();
        });

        categoryLayer.addListener('onImageLoad', function (e) {
            $("#loader").hide();
            $("#alert").hide();
        });
        categoryLayer.addListener('onImageError', function (e) {
            $("#loader").hide();
            $("#alert").show();
        });

        mapUpdateLayer.addListener('onImageLoad', function (e) {
            $("#loader").hide();
            $("#alert").hide();
        });
        mapUpdateLayer.addListener('onImageError', function (e) {
            $("#loader").hide();
            $("#alert").show();
        });

        mapVisitorsLayer.addListener('onImageLoad', function (e) {
            $("#loader").hide();
            $("#alert").hide();
        });
        mapVisitorsLayer.addListener('onImageError', function (e) {
            $("#loader").hide();
            $("#alert").show();
        });

        var iListenerID = -1;

        this.load = function () {
            cadastreLayer.setVisible(cbDivision.checked);
            costLayer.setVisible(rbCostLayer.checked);
            costByAreaLayer.setVisible(rbCostByAreaLayer.checked);
            useTypeLayer.setVisible(rbUseType.checked);
            categoryLayer.setVisible(rbCategory.checked);
            mapUpdateLayer.setVisible(rbMapUpdate.checked);
            mapVisitorsLayer.setVisible(rbMapVisitors.checked);

            iListenerID = gmxAPI.map.addListener("onMoveEnd", fnRefreshMap);
            fnRefreshMap();
        }

        var cadastreLegend = _div();
        var alertDiv = _div(null, [['attr', 'id', "alert"]]);
        $(alertDiv).css({ "color": "red", "font-weight": "bold", "font-size": "12px", "display": "none" });
        $(alertDiv).append("Ошибка получения данных!");
        _(div, [_table([_tbody(trs)]), cadastreLegend, alertDiv]);

        container && _(container, [div]);

        this.unloadCadastre = function () {
            $("#loader").hide();
            gmxAPI._tools.standart.removeTool('cadastreInfo');
            gmxAPI._tools.standart.removeTool('cadastreDx');
            if (mapListenerInfo)
                cadastreLayer.removeListener('onClick', mapListenerInfo);
            if (cadastreLayerListener)
                map.removeListener("onMoveEnd", cadastreLayerListener);
            if (iListenerID)
                map.removeListener("onMoveEnd", iListenerID);
            if (cadastreLayerInfo)
                cadastreLayerInfo.remove();
            if (cadastreLayer)
                cadastreLayer.remove();
            if (costLayer)
                costLayer.remove();
            if (costByAreaLayer)
                costByAreaLayer.remove();
            if (useTypeLayer)
                useTypeLayer.remove();
            if (categoryLayer)
                categoryLayer.remove();
            if (mapUpdateLayer)
                mapUpdateLayer.remove();
            if (mapVisitorsLayer)
                mapVisitorsLayer.remove();

            if (balloonInfo) {
                balloonInfo.remove();
                balloonInfo = false;
            }
            if (balloonSearch) {
                balloonSearch.remove();
                balloonSearch = false;
            }
            if (cadastreLayerSearch)
                cadastreLayerSearch.setVisible(false);
            inputCadNum.value = '66:41:0402004:16';
            gmxAPI._tools.standart.selectTool('move');
            // gmxAPI._tools.standart.removeTool("cadastreInfo");
            // gmxAPI._tools.standart.removeTool("cadastreDx");
        }

        this.setCadastreVisibility = function (isVisible) {
            $(cbDivision).prop('checked', isVisible);
            fnRefreshMap();
        }
    }

    var addCadastreInfoTool = function () {
        map = gmxAPI.map;
        var cadastreDx = {
            'key': "cadastreDx",
            'activeStyle': {},
            'regularStyle': { 'paddingLeft': '2px' },
            'regularImageUrl': gmxCore.getModulePath("cadastre") + "arrow.png",
            'activeImageUrl': gmxCore.getModulePath("cadastre") + "arrow_active.png",
            'onClick': function () {
                var xOut, yOut, ex, ey, sx, sy;
                var $str = $('<div id="coord">dx: ' + dx + ';<br /> dy: ' + dy + ';</div>');
                if (!dialog)
                    dialog = showDialog("Координаты калибровки", $str.get(0), 200, 65, false, false, null, function () {
                        dialog = null;
                    });
                var drag = function (x, y, o) {              // Вызывается при mouseMove при нажатой мышке
                    xOut = (sx - gmxAPI.merc_x(x) - dx) * (-1);
                    yOut = (sy - gmxAPI.merc_y(y) - dy) * (-1);
                    $("#coord").html("dx: " + xOut.toFixed(2) + ";<br /> dy: " + yOut.toFixed(2) + ";");
                };
                var dragEnd = function (x, y, o) {    // Вызывается при mouseUp
                    ex = gmxAPI.merc_x(x);
                    ey = gmxAPI.merc_y(y);
                    dx = xOut;
                    dy = yOut;
                };
                var dragStart = function (x, y, o) {      // Вызывается при mouseDown
                    sx = gmxAPI.merc_x(x);
                    sy = gmxAPI.merc_y(y);
                };
                cadastreLayer.enableDragging(drag, dragStart, dragEnd);
            },
            'onCancel': function () {
                if (cadastreLayer)
                    cadastreLayer.disableDragging();
                gmxAPI._tools.standart.selectTool("move");
            },
            'hint': gmxAPI.KOSMOSNIMKI_LOCALIZED("Ввод dx,dy", "Enter dx,dy")
        };
        var cadastreTool = {
            'key': "cadastreInfo",
            'activeStyle': {},
            'regularStyle': { 'paddingLeft': '2px' },
            'regularImageUrl': gmxCore.getModulePath("cadastre") + "information.png",
            'activeImageUrl': gmxCore.getModulePath("cadastre") + "information_active.png",
            'onClick': function () {
                mapListenerInfo = cadastreLayer.addListener("onClick", function (e) { //map -> cadastreLayer
                    var mousePosX = map.getMouseX();
                    var mousePosY = map.getMouseY();
                    var extent = map.getVisibleExtent();
                    if (balloonSearch) {
                        balloonSearch.remove();
                        balloonSearch = false;
                    }
                    if (cadastreLayerSearch)
                        cadastreLayerSearch.setVisible(false);

                    if (!balloonInfo || !balloonInfo.isVisible) {
                        createBalloonInfo(mousePosX, mousePosY, extent, "");
                    } else {
                        balloonInfo.remove();
                        balloonInfo = false;
                        cadastreLayerInfo.remove();
                        createBalloonInfo(mousePosX, mousePosY, extent, "");
                    }
                });
            },
            'onCancel': function () {
                gmxAPI._tools.standart.selectTool("move");
                if (mapListenerInfo)
                    cadastreLayer.removeListener("onClick", mapListenerInfo);
                if (cadastreLayerListener)
                    map.removeListener("onMoveEnd", cadastreLayerListener);
                if (cadastreLayerInfo)
                    cadastreLayerInfo.remove();
                if (balloonInfo) {
                    balloonInfo.remove();
                    balloonInfo = false;
                }
            },
            'hint': gmxAPI.KOSMOSNIMKI_LOCALIZED("Информация о КУ", "Cadastre information")
        };

        if (!gmxAPI._tools.standart.getToolByName("cadastreInfo")) {
            gmxAPI._tools.standart.addTool('cadastreInfo', cadastreTool);
            gmxAPI._tools.standart.addTool('cadastreDx', cadastreDx);
        }
    };

    var publicInterface = {
        pluginName: 'Cadastre',

        //см. описание параметров ниже
        afterViewer: function (params, map) {
            gParams = $.extend({
                proxyUrl: '',
                cadastreServer: 'http://maps.rosreestr.ru/arcgis/rest/services/',
                dx: 0,
                dy: 0,
                showToolbar: true,
                showLeftPanel: true,
                showStandardTools: true,
                initCadastre: false
            }, params);

            var cadastreMenu = this._cadastreMenu = gParams.showLeftPanel ? new leftMenu() : null,
                _this = this;

            cadastreServer = gParams.cadastreServer;
            cadastreServerThematic = 'http://maps.rosreestr.ru/ags/rest/services/';
            dx = gParams.dx;
            dy = gParams.dy;

            map = map || globalFlashMap;
            if (!map) return;

            var onCancelCadastreTools = function () {
                if (checkCadastre != null) {
                    checkCadastre.unloadCadastre();
                }
                $("loader").hide();
                if (cadastreLayerInfo)
                    cadastreLayerInfo.setVisible(false);
                if (balloonInfo)
                    balloonInfo.remove();
                if (gmxAPI._tools.standart.getToolByName("cadastreInfo")) {
                    gmxAPI._tools.standart.removeTool('cadastreInfo');
                    gmxAPI._tools.standart.removeTool('cadastreDx');
                    gmxAPI._tools.standart.selectTool("move");
                }
                if (mapListenerInfo)
                    gmxAPI.map.removeListener("onClick", mapListenerInfo);
                if (cadastreMenu)
                    $(cadastreMenu.parentWorkCanvas).remove();
                if (balloonSearch) {
                    balloonSearch.remove();
                    balloonSearch = false;
                }
                if (cadastreLayerSearch)
                    cadastreLayerSearch.setVisible(false);
                inputCadNum.value = '66:41:0402004:16';
            }

            var attr = {
                id: "cadastre",
                rus: "Кадастр",
                eng: "Cadastre",
                overlay: true,
                onClick: this._onClickCadastreTools.bind(this),
                onCancel: onCancelCadastreTools,
                onmouseover: function () { this.style.color = "orange"; },
                onmouseout: function () { this.style.color = "wheat"; },
                hint: "Кадастр"
            };

            if (gParams.showToolbar) {
                var cadastreTools = new gmxAPI._ToolsContainer('cadastre');
                this._cadastreTool = cadastreTools.addTool('cadastre', attr);

                $("div[title='Кадастр']").parent().append('<div id="loader"></div>');
            }

            gParams.initCadastre && this._onClickCadastreTools();
        },

        _onClickCadastreTools: function () {
            var container = null;
            if (gParams.showLeftPanel) {
                var alreadyLoaded = this._cadastreMenu.createWorkCanvas("cadastre", function () {
                    if (checkCadastre != null) {
                        checkCadastre.unloadCadastre();
                    }
                    gmxAPI._tools.cadastre.setActiveTool(false);
                });
                if (!alreadyLoaded) {
                    $(this._cadastreMenu.parentWorkCanvas).find(".leftTitle table tbody tr").append("Кадастровые данные");
                    container = this._cadastreMenu.workCanvas;
                }
            }

            checkCadastre = new Cadastre(container, gParams.showStandardTools);

            extendJQuery();
            checkCadastre.load();
        },

        /** Добавить кадастровую информацию на карту
         * @param {gmxAPI.map} map Карта ГеоМиксера
         * @param {Object} params Дополнительные параметры
         * @param {String} [params.proxyUrl] URL для проксирования запросов к серверу кадастра
         * @param {String} [params.cadastreServer='http://maps.rosreestr.ru/ags/rest/services/'] Кадастровый сервер
         * @param {Number} [params.dx=0] Смещение кадастровой карты по долготе, метры Меркатора
         * @param {Number} [params.dy=0] Смещение кадастровой карты по широте, метры Меркатора
         * @param {Boolean} [params.showToolbar=true] Показывать ли тулбар включения кадастровой информации
         * @param {Boolean} [params.showLeftPanel=true] Показывать ли выбор доп. данных в левой панеле ГеоМиксера
         * @param {Boolean} [params.showStandardTools=true] Показывать ли инструменты сдвига и информации об участке в панели инструментов
         * @param {Boolean} [params.initCadastre=false] Начальная видимость кадастровой информации
        */
        addToMap: function (map, params) {
            this.afterViewer(params, map);
        },

        /** Установить видимость кадастровой информации на карте
         * @param {Boolean} isVisible Видимость кадастра
        */
        setCadastreVisibility: function (isVisible) {
            if (checkCadastre) {
                checkCadastre.setCadastreVisibility(isVisible);
            } else if (isVisible) {
                if (this._cadastreTool) {
                    this._cadastreTool.setActiveTool(true);
                } else {
                    this._onClickCadastreTools();
                }
            }
        }
    }

    window.gmxCore && window.gmxCore.addModule('cadastre', publicInterface, {
        css: "cadastre.css"
    });

})();
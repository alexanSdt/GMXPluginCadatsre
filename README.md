GMXPluginCadatsre
=================

Кадастровый плагин для ГеоМиксера

Пример config.js для плагина:
{file: 'http://90.157.28.127/gmxloader/plugins/cadastre/cadastre.js', module: 'cadastre',params: {proxyUrl:"",UIMode:"lite"}}
//параметр UIMode: может принимать заначение "standard" или "lite".
//если параметр не указан неверно или отсутствует, автоматически будет выбран режим "standard".


полУЧЕНИЕ ТОЧЕК ПРОВЕРОК

1 . window.loadPoints("http://127.0.0.1/api2/plugins/cadastre/точки_для_проверок.txt");
2 . var str  = JSON.stringify(window.points)
3 . сохраняем str в geojson
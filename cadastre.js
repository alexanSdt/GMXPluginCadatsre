(function () {

    "use strict";

    var gParams, inputCadNum;

    _translationsHash.addtext("rus", {
        '$$search$$_Cadastre_0' : 'Поиск по адресам, координатам',
        '$$search$$_Cadastre_1' : 'Поиск по адресам, координатам, кадастровым номерам',
        cadastrePlugin: {
            name: 'Кадастр Росреестра',
            doSearch: 'Найти'
        }
    });

    _translationsHash.addtext("eng", {
        '$$search$$_Cadastre_0' : 'Search by addresses, coordinates',
        '$$search$$_Cadastre_1' : 'Search by addresses, coordinates, cadastre number',
        cadastrePlugin: {
            name: 'Cadastre',
            doSearch: 'Search'
        }
    });

    var lmap, layerWMS,
        thematic,
        searchControl,
        dialog;

    var b = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v',
        '/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg==',
        '///sO7/rSq/6KU'
    ];
    var thematicLayers = [
        {
            id: 'rbCostLayer',
            layerId: '1,7',
            legend: 'Кадастровая стоимость</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY9fUA9usA9+EAPCcsfQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>до 3 млн руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY9bgA9rEA96kAxLzpJgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>3 - 15 млн. руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY9XsA9ngA93UA+R2pSwAAAAh0Uk5TAP' + b[1] + '"></td><td><span>15 - 30 млн. руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY9T0A9kAA90IAF7kxUgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>30 - 100 млн.руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY9QAA9hIA9yQAeAUndAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>свыше 100 млн. руб.</span></td></tr></tbody></table',
            title: 'Кадастровая стоимость',
            startLevel: 13,
            endLevel: 20
        },
        {
            id: 'rbCostByAreaLayer',
            layerId: '0,6',
            legend: 'Кадастровая стоимость ЗУ за кв. м</br><table cellspacing="0" cellpadding="0" style="width: 203px;"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY9fUA9usA9+EAPCcsfQAAAAh0Uk5TAP' + b[1] + '"></td><td><table width="95%"><tbody><tr><td align="">до 100 руб за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY9bgA9rEA96kAxLzpJgAAAAh0Uk5TAP' + b[1] + '"></td><td><table width="95%"><tbody><tr><td align="">от 101 до 1000 руб. за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY9XsA9ngA93UA+R2pSwAAAAh0Uk5TAP' + b[1] + '"></td><td><table width="95%"><tbody><tr><td align="">от 1001 до 5000 руб. за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY9T0A9kAA90IAF7kxUgAAAAh0Uk5TAP' + b[1] + '"></td><td><table width="95%"><tbody><tr><td align="">от 5001 до 50000 руб. за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY9QAA9hIA9yQAeAUndAAAAAh0Uk5TAP' + b[1] + '"></td><td><table width="95%"><tbody><tr><td align="">более 500000 руб. за кв. м</td></tr></tbody></table></td></tr></tbody></table>',
            title: 'Кадастровая стоимость за метр',
            startLevel: 13,
            endLevel: 20
        },
        {
            id: 'rbUseType',
            layerId: '2,4',
            legend: 'Разрешенные виды использования ЗУ</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY/wAA/xIA/yQAxDetmgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли с более чем одним видом использования</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY/9if/+Kn/+ywWIVZzQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли жилой застройки</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY/8Jy/8t6/9N/nGNq1QAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под жилыми домами многоэтажной и повышенной этажности застройки</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY/50A/6MA/6kA0zjLGAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под домами индивидуальной жилой застройкой</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY5pkA6ZMA7I4A5xrHhAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Незанятые земли, отведенные под жилую застройку</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY/+ms//S1//++G44kQgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли общественно-деловой застройки</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY/+ln//Ru//90X3D6BQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли гаражей и автостоянок</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY/+kA//QA//8AnfC9ewAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под объектами торговли, общественного питания, бытового обслуживания, автозаправочными и газонаполнительными станциями, предприятиями автосервиса</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY5uYA6d0A7NMAeryBiQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли учреждений и организаций народного образования, земли под объектами здравоохранения и социального обеспечения физической культуры и спорта, культуры и искусства, религиозными объектами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYqKgAtKIAvZwAgfbyuQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под административно-управленческими и общественными объектами, земли предприятий, организаций, учреждений финансирования, кредитования, страхования и пенсионного обеспечения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYdHQAinEAnW4AzJWFTAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под зданиями (строениями) рекреации</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY5pkA6ZMA7I4A5xrHhAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под объектами промышленности</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYqG8AtGwAvWoA5VasFgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли общего пользования (геонимы в поселениях)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY4eHh5NjX58/MBsJpUwAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под объектами транспорта, связи, инженерных коммуникаций</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYzc3N0sXD2Ly5WqFGdQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Под объектами железнодорожного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYs7OzvKyqxaWhGy20FAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Под объектами автомобильного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYnZ2dqpiWtpKN7dt9hwAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Под объектами морского, внутреннего водного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYgoKClX98pnt2xUDwLQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Под объектами воздушного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYZ2dngmZjl2RdEF9uXAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Под объектами иного транспорта, связи, инженерных коммуникаций</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZY0/++2fS13emsMMNQhAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли сельскохозяйственного использования</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYo/90sPRuu+lnNk+fNAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под крестьянскими (фермерскими) хозяйствами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYVf8AdvQAjukAJrp/BQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под предприятиями, занимающимися сельскохозяйственным производством</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYTeYAcd0AitMAoSK+BAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под садоводческими объединениями и индивидуальными садоводами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYN6gAZqIAhJwA4JYcbQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под огородническими объединениями и индивидуальными огородниками</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYJHQAYHEAf24Ao374EAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под дачными объединениями</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYtdefvs6XxsWPI51NXAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под личными подсобными хозяйствами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYpfV7set1u+FuPSy7WwAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под служебными наделами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYiM5mmsZhqb1bRGITZwAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли оленьих пастбищ</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYW4hFeoVCkYA9J56HwAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Для других сельскохозяйственных целей</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYTXQAcXEAim4AKDuv6gAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под лесами в поселениях (в том числе городскими лесами), под древесно-кустарниковой растительностью, не входящей в лесной фонд (в том числе лесопарками, парками, скверами, бульварами)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYAMX/WL3ze7Xn/71NNgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли, занятые водными объектами, земли водоохранных зон водных объектов, а также земли, выделяемые для установления полос отвода и зон охраны водозаборов, гидротехнических сооружений и иных водохозяйственных сооружений, объектов.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAAC1QTFRF/v///vTz2dra5tva2c3L/sO7/rSqlJSUqJaU/6KUlH58lF9Y/3ZYAAAAeyQA0xTD0AAAAA90Uk5TAP//////////////////5Y2epgAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHdJREFUKJGd0ksOgCAQA9DhIyAi9z+uiTYyZVjRVZMXFg0jspmjLZJealdwX2pBib19FPA8ZxR/R5Az4h2RFiEiIWLRNImiWQYZ+akakQIqRnLlyUoyT9bCk0mIWDRNomiWQUZ+ikYkgHrEv5eKEnAAaXU2p2zmAUZoBsjYet62AAAAAElFTkSuQmCC"></td><td><span>Земли, не вовлеченные в градостроительную или иную деятельность (земли &ndash; резерв)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYlUu6pE2ysU2ogM8VNAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под военными и иными режимными объектами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + b[2] + '/3ZYx00zzk0w008r5GEnuAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли под объектами иного специального назначения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+nn//Tz////4iZzJgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Неопределено</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+nn//Tz////4iZzJgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Значение отсутствует</span></td></tr></tbody></table>',
            title: 'Виды разрешенного использования',
            startLevel: 13,
            endLevel: 20
        },
        {
            id: 'rbCategory',
            layerId: '3,5',
            legend: 'Категории земель ЗУ</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//8MO77bSq6qKU5HZYAG//TWzza2rnJL3s7wAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли водного фонда</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//8MO77bSq6qKU5HZYtGokuWkkvWYfu6YNWgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли запаса</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//8MO77bSq6qKU5HZYVf8AbvQAgekA3+ZdMgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли лесного фонда</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//8MO77bSq6qKU5HZYJHQAVnEAcW4AZkbUVgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли особо охраняемых территорий и объектов</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//8MO77bSq6qKU5HZY+Z0A/KMA/6kAOzMlwAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли поселений (земли населенных пунктов)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//8MO77bSq6qKU5HZYdE0AhU0Akk8AWdadagAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, земли для обеспечения космической деятельности, земли обороны, безопасности и земли иного специального назначения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//8MO77bSq6qKU5HZY6Oms6PS16f++yNID5wAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Земли сельскохозяйственного назначения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//8MO77bSq6qKU5HZYs7OzuKyqvaWhx9sqFgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>Категория не установлена</span></td></tr></tbody></table>',
            title: 'Категории земель',
            startLevel: 13,
            endLevel: 20
        },
        {
            id: 'rbMapUpdate',
            layerId: '8',
            legend: 'Актуальность сведений</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWFN6gAQKMfR58wW5lrlgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>менее 1 недели</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWFh8IwiMofi9EAQ7oGzAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>1 - 2 недели</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWFv9wwxuUfzu4A5y7xwQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>2 недели - 1 месяц</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWF674w9cYf/80AxdGebAAAAAh0Uk5TAP' + b[1] + '"></td><td><span>1 - 3 месяца</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWF63ww9X4f/38ACxZRyQAAAAh0Uk5TAP' + b[1] + '"></td><td><span>3 месяца - 1 год</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWF6zAw9R8f/wAAedG9rwAAAAh0Uk5TAP' + b[1] + '"></td><td><span>более 1 года</span></td></tr></tbody></table>',
            title: 'Актуальность сведений',
            startLevel: 2,
            endLevel: 20
        },
        {
            id: 'rbMapVisitors',
            layerId: '9',
            legend: 'Общее количество посещений</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0"src="' + b[0] + '//x8fHubq6qaqqhIWF676+9cbG/83No3FH3QAAAAh0Uk5TAP' + b[1] + '"></td><td><span>менее 100 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWF656U9aOZ/6eccAhG3wAAAAh0Uk5TAP' + b[1] + '"></td><td><span>100 000 - 500 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWF6YBu84Ju/YVuMQ3iHgAAAAh0Uk5TAP' + b[1] + '"></td><td><span>500 000 - 1 000 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWF4mNR7GFL9WBHhZwXygAAAAh0Uk5TAP' + b[1] + '"></td><td><span>1 000 000 - 5 000 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWF10k94EUw6D0k9XeHogAAAAh0Uk5TAP' + b[1] + '"></td><td><span>5 000 000 - 10 000 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="' + b[0] + '//x8fHubq6qaqqhIWFzDAw1B8f3AAAabp87wAAAAh0Uk5TAP' + b[1] + '"></td><td><span>более 10 000 000</span></td></tr></tbody></table>',
            title: 'Общее количество посещений',
            startLevel: 2,
            endLevel: 20
        }
    ];

    var Thematic = function (container) {
        var cadastreLegend;

        var fnRefreshMap = function () {
            $("#alert").hide();

            $(cadastreLegend).toggle(!rbNo.checked);

            var thmtChecked = null;
            for (var i = 0, len = thematicLayers.length; i < len; i++) {
                if (thematicLayers[i].radio.checked) {
                    thmtChecked = thematicLayers[i];
                    break;
                }
            }

            if (thmtChecked) {
                $("#loader").show();
                cadastreLegend.innerHTML = thmtChecked.legend;
                layerWMS.info.overlays.setThematicOverlay(thmtChecked);
            } else {
                layerWMS.info.overlays.clear(true, 'thematicOverlay');
            }
        };

        var cbDivision, rbNo, rbCostLayer, rbCostByAreaLayer, rbUseType, rbCategory, rbMapUpdate, rbMapVisitors;
        var div = _div(null, [['dir', 'className', 'cadastreLeftMenuContainer']]);
        var trs = [];

        trs.push(_tr([_td([_span([_t("Введите кадастровый номер в строку поиска,")], [['dir', 'className', 'cadastreLeftMenuLabel']])], [['attr', 'colspan', 2]])]));
        var exampleStr = '66:41:0402004:16',
            numExample = _span([_t(exampleStr)], [['dir', 'className', 'cadastreLeftMenuLabel1']]);
        numExample.onclick = function () {
            if (searchControl) {
                searchControl.SetSearchStringFocus(true);
                searchControl.SetSearchString(exampleStr);
            }
        };
        trs.push(_tr([_td([_span([_t("например: ")], [['dir', 'className', 'cadastreLeftMenuLabel']]), numExample], [['attr', 'colspan', 2]])]));
/*
        var inputField = inputCadNum = _input(null, [['dir', 'className', 'inputStyle'], ['css', 'width', '200px'], ['attr', 'value', '66:41:0402004:16']]);

        inputField.onkeydown = function (e) {
            var evt = e || window.event;
            if (getkey(evt) == 13) {
                layerWMS.info.cadastreSearch(inputField.value);
                return false;
            }
        }

        var goButton = makeButton(_gtxt('cadastrePlugin.doSearch'));

        goButton.onclick = function () { layerWMS.info.cadastreSearch(inputField.value); }

        trs.push(_tr([_td([inputField], [['attr', 'colspan', 2]]), _td([goButton])]));
*/        
        trs.push(_tr([_td([], [['attr', 'height', 15]])]));

        // cbDivision = _checkbox(true, 'checkbox');
        // cbDivision.setAttribute("id", "cadastreLayer");
        // cbDivision.onclick = fnRefreshMap;
        // trs.push(_tr([_td([cbDivision]), _td([_label([_t("Кадастровое деление")], [['attr', 'for', 'cadastreLayer'], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]));

        rbNo = _radio([['attr', 'name', 'Zones'], ['attr', 'checked', 'true'], ['attr', 'id', 'rbNo']]);
        rbNo.onclick = fnRefreshMap;
        trs.push(_tr([_td([rbNo]), _td([_label([_t("Нет тематической карты")], [['attr', 'for', 'rbNo'], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]));

        thematicLayers.map(function (it) {
            it.radio = _radio([['attr', 'name', 'Zones'], ['attr', 'id', it.id]]);
            it.radio.onclick = fnRefreshMap;
            it.tr = _tr([_td([it.radio]), _td([_label([_t(it.title)], [['attr', 'for', it.id], ['dir', 'className', 'cadastreLeftMenuLabel']])])], [['dir', 'className', 'cadastreLeftMenuRow']]);
            trs.push(it.tr);
        });

        var cadastreLegend = _div();
        var alertDiv = _div(null, [['attr', 'id', "alert"]]);
        $(alertDiv).css({ "color": "red", "font-weight": "bold", "font-size": "12px", "display": "none" });
        $(alertDiv).append("Ошибка получения данных!");
        nsGmx.Utils._(div, [_table([_tbody(trs)]), cadastreLegend, alertDiv]);

        container && nsGmx.Utils._(container, [div]);

        this.unload = function () {
            layerWMS.info.overlays.clear(true, 'thematicOverlay');
            // inputCadNum.value = '66:41:0402004:16';
        }

        this.load = function () {
            fnRefreshMap();
        }
    };
    
    var DEFAULT_ZINDEX = 3000000;
    var loadScripts = _.once(function() {
        var path = gmxCore.getModulePath('cadastre') + 'L.Cadastre/src/',
            corePluginLoader = gmxCore.loadScript(path + 'L.Cadastre.js')
                .then(gmxCore.loadScript.bind(gmxCore, path + 'L.Cadastre.Info.js', null, null)),
            imageOverlayLoader = gmxCore.loadModule('L.ImageOverlay.Pane');
        
        gmxCore.loadCSS(path + 'L.Cadastre.css');
        return $.when(corePluginLoader, imageOverlayLoader);
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
                var cadastreLayer = new L.Cadastre(null, {
                    zIndex: DEFAULT_ZINDEX
                });
                this.addLayer(cadastreLayer);
            }.bind(this));
        },
        
        onAdd: function(map) {
            L.LayerGroup.prototype.onAdd.call(this, map);
            this._loadAndAddLayer();
        }
    });
    
    var addLayerClass = function() {
        L.gmx.addLayerClass('Cadastre', CadastreVirtualLayer);
    }

    var publicInterface = {
        pluginName: 'Cadastre',

        afterViewer: function (params, map) {
            gParams = $.extend({
                dx: 0,
                dy: 0,
                showToolbar: true,
                showLeftPanel: true,
                initCadastre: false
            }, params);

            lmap = nsGmx.leafletMap;
            
            var options = { zIndex: DEFAULT_ZINDEX };
            if (gParams.dx || gParams.dy) {
                options.shiftPosition = L.point(Number(gParams.dx || 0), Number(gParams.dy || 0));
            }

            var gmxLayers = lmap.gmxControlsManager.get('layers');            
            var layerGroup = L.layerGroup();
            gmxLayers.addOverlay(layerGroup, _gtxt('cadastrePlugin.name'));

            var initWMSlayer = function () {
                loadScripts().then(function() {
                    layerWMS = new L.Cadastre(null, options);
                    layerWMS
                        .on('dragenabled', function () {
                            thematic.unload();
                            if (!dialog) {
                                var point = layerWMS.getShift();
                                var $str = $('<div id="coord">dx: ' + point.x.toFixed(2) + ';<br /> dy: ' + point.y.toFixed(2) + ';</div>');
                                dialog = showDialog("Координаты калибровки", $str.get(0), 200, 85, false, false, null, function () {
                                    dialog = null;
                                    if (cadastreToolsGroup) {
                                        cadastreToolsGroup.setActiveIcon();
                                    }
                                });
                            }
                        })
                        .on('dragdisabled', function () {
                            thematic.load();
                            if (dialog) {
                                $(dialog).dialog('close');
                            }
                        })
                        .on('drag', function () {
                            var point = layerWMS.getShift();
                            $("#coord").html("dx: " + point.x.toFixed(2) + ";<br /> dy: " + point.y.toFixed(2) + ";");
                        });
                    layerGroup.addLayer(layerWMS);
                });
            };
            var cadastreToolsGroup;
            var chkThematicLayers = function () {
                if (!layerWMS) { return; }
                var zoom = lmap.getZoom();
                thematicLayers.map(function (it) {
                    if (it.radio) {
                        var disabled = zoom < it.startLevel || it > it.endLevel ? true : false;
                        it.radio.disabled = disabled;
                        if (disabled) {
                            L.DomUtil.addClass(it.tr, 'disabledLabel');
                        } else {
                            L.DomUtil.removeClass(it.tr, 'disabledLabel');
                        }
                    }
                });
                layerWMS.info.overlays.refresh();
            };
            var regExpArr = [
                /[^\d\:]/g,
                /\d\d:\d+$/,
                /\d\d:\d+:\d+$/,
                /\d\d:\d+:\d+:\d+$/
            ];
            var isValidCadastreNum = function (str) {
                if (!regExpArr[0].exec(str)) {
                    for (var i = 1, len = regExpArr.length; i < len; i++) {
                        if (regExpArr[i].exec(str)) { return true; }
                    }
                }
                return false;
            };
            var toogleSearchString = function (flag) {
                if (!layerWMS) { return; }
                var flagSetHook = !searchControl;
                searchControl = 'getSearchControl' in window.oSearchControl ? window.oSearchControl.getSearchControl() : null;
                var searchHook = function(str) {
                    if (!layerWMS) { return; }
                    str = str.trim();
                    if (!isValidCadastreNum(str)) { return false; }
                    if (!layerWMS._map) {
                        lmap.addLayer(layerWMS);
                    }
                    layerWMS.info.cadastreSearch(str);                        
                    return true;
                };
                if (searchControl && flagSetHook) {
                    searchControl.addSearchByStringHook(searchHook, 1001);
                    var str = _gtxt('$$search$$_Cadastre_1');
                    // var str = '';
                    // if (flag) {
                        // searchControl.addSearchByStringHook(searchHook, 1001);
                        // str = _gtxt('$$search$$_Cadastre_1');
                    // } else {
                        // searchControl.removeSearchByStringHook(searchHook);
                        // str = _gtxt('$$search$$_Cadastre_0');
                    // }
                    searchControl.SetPlaceholder(str);
                }
            };
            toogleSearchString(true);

            var cadastreMenu = gParams.showLeftPanel ? new leftMenu() : null;
            lmap
                .on('layeradd', function (ev) {
                    if (ev.layer === layerWMS) {
                        layerWMS.redraw();
                        var addTools = !cadastreToolsGroup;
                        if (gParams.showToolbar && addTools) {
                            cadastreToolsGroup = new L.Control.gmxIconGroup({
                                singleSelection: true,
                                isSortable: true,
                                items: [
                                    new L.Control.gmxIcon({
                                        id: 'cadastreInfo',
                                        togglable: true,
                                        title: 'Информация об участке'
                                    }).on('statechange', function (ev) {
                                        var infoClickSelected = ev.target.options.isActive;
                                        if (infoClickSelected) {
                                            layerWMS.enableInfoMode();
                                        } else {
                                            layerWMS.disableInfoMode();
                                        }
                                    })
                                    ,
                                    new L.Control.gmxIcon({
                                        id: 'cadastreDx',
                                        togglable: true,
                                        title: 'Смещение карты'
                                    }).on('statechange', function (ev) {
                                        var cadastreDxSelected = ev.target.options.isActive;
                                        if (cadastreDxSelected) {
                                            layerWMS.enableDrag();
                                        } else {
                                            layerWMS.disableDrag();
                                        }
                                    })
                                ]
                            });
                            if (layerWMS.options.infoMode) {
                                cadastreToolsGroup.on('controladd', function (ev) {
                                    cadastreToolsGroup.setActiveIcon(cadastreToolsGroup.getIconById('cadastreInfo'), true);
                                });
                            
                            }
                        }
                        if (cadastreToolsGroup) {
                            cadastreToolsGroup.addTo(lmap);
                            cadastreToolsGroup.getIconById('cadastreDx').setActive(false, true);
                        }
                        
                        var container = null;
                        if (cadastreMenu) {
                            var alreadyLoaded = cadastreMenu.createWorkCanvas('cadastre', {
                                closeFunc: function () {
                                    if (thematic) {
                                        thematic.unload();
                                    }
                                },
                                path: ['Кадастр Росреестра']
                            });
                            if (!alreadyLoaded) {
                                container = cadastreMenu.workCanvas;
                            }
                        }

                        thematic = new Thematic(container);
                        chkThematicLayers();
                        toogleSearchString(true);
                    } else if (!layerWMS && ev.layer === layerGroup) {
                        initWMSlayer();
                    }
                })
                .on('layerremove', function (ev) {
                    if (ev.layer === layerWMS) {
                        if (cadastreToolsGroup) {
                            cadastreToolsGroup.removeFrom(lmap);
                        }
                        if (thematic) {
                            thematic.unload();
                        }
                        if (cadastreMenu) {
                            $(cadastreMenu.parentWorkCanvas).remove();
                        }
                        // if (inputCadNum) {
                            // inputCadNum.value = '66:41:0402004:16';
                        // }
                        layerWMS.info.removePopup(true);
                        toogleSearchString(false);
                    }
                })
                .on('moveend', chkThematicLayers);

            if (gParams.initCadastre) {
                lmap.addLayer(layerWMS);
            }
        }
    }

    window.gmxCore && window.gmxCore.addModule('cadastre', publicInterface, {
        init: function() {
            addLayerClass();
        }
    });
})();

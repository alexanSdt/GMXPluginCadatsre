﻿(function () {
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
        },
        subject: {},
        mo1Level: {},
        mo2Level: {},
        settlement: {}
    };

    var OBJECT_TYPE_FULL_NAMES = ["Кадастровый округ", "Кадастровый район", "Кадастровый квартал", "Земельный участок", "ОКС"];

    var LOCATOR_VALUES = {
        "Municipality1": 1,
        "Municipality2": 2,
        "Region": 0,
        "Settlement": 3
    };
    var OKS_TYPES = {
        " ": "",
        building: "здание",
        construction: "сооружение",
        flat: "квартира"
    };

    var customSRC = { "wkt": "PROJCS[\"WGS 84 / World Mercator\",GEOGCS[\"GCS_WGS_1984\",DATUM[\"D_WGS_1984\",SPHEROID[\"WGS_1984\",6378137.0,298.257223563]],PRIMEM[\"Greenwich\",0],UNIT[\"Degree\",0.017453292519943295]],PROJECTION[\"Mercator\"],PARAMETER[\"False_Easting\",0],PARAMETER[\"False_Northing\",0],PARAMETER[\"Central_Meridian\"," + 104.95158750033377 + "],PARAMETER[\"Standard_Parallel_1\",0],PARAMETER[\"scale_factor\",1],UNIT[\"Meter\",1]]" };
    var centralMeridian = 11683157.27848284;

    var PARCEL_STATES = ['Ранее учтенный', '', 'Условный', 'Внесенный', 'Временный (Удостоверен)', 'Учтенный', 'Снят с учета', 'Аннулированный'];
    var UNITS = { "003": "мм", "004": "см", "005": "дм", "006": "м", "008": "км", "009": "Мм", "047": "морск. м.", "050": "кв. мм", "051": "кв. см", "053": "кв. дм", "055": "кв. м", "058": "тыс. кв. м", "059": "га", "061": "кв. км", "109": "а", "359": "сут.", "360": "нед.", "361": "дек.", "362": "мес.", "364": "кварт.", "365": "полугод.", "366": "г.", "383": "руб.", "384": "тыс. руб.", "385": "млн. руб.", "386": "млрд. руб.", "1000": "неопр.", "1001": "отсутств.", "1002": "руб. за кв. м", "1003": "руб. за а", "1004": "руб. за га", "1005": "иные", "null": "" };
    var NO_DATA = "Нет данных";
    var CATEGORY_TYPES = { "003001000000": "Земли сельскохозяйственного назначения", "003002000000": "Земли поселений (земли населенных пунктов)", "003003000000": "Земли промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, земли для обеспечения космической деятельности, земли обороны, безопасности и земли иного специального назначения", "003004000000": "Земли особо охраняемых территорий и объектов", "003005000000": "Земли лесного фонда", "003006000000": "Земли водного фонда", "003007000000": "Земли запаса", "003008000000": "Категория не установлена" };
    var UTILIZATIONS = { "141000000000": "Для размещения объектов сельскохозяйственного назначения и сельскохозяйственных угодий", "141001000000": "Для сельскохозяйственного производства", "141001010000": "Для использования в качестве сельскохозяйственных угодий", "141001020000": "Для размещения зданий, строений, сооружений, используемых для производства, хранения и первичной переработки сельскохозяйственной продукции", "141001030000": "Для размещения внутрихозяйственных дорог и коммуникаций", "141001040000": "Для размещения водных объектов", "141002000000": "Для ведения крестьянского (фермерского) хозяйства", "141003000000": "Для ведения личного подсобного хозяйства", "141004000000": "Для ведения гражданами садоводства и огородничества", "141005000000": "Для ведения гражданами животноводства", "141006000000": "Для дачного строительства", "141007000000": "Для размещения древесно-кустарниковой растительности, предназначенной для защиты земель от воздействия негативных (вредных) природных, антропогенных и техногенных явлений", "141008000000": "Для научно-исследовательских целей", "141009000000": "Для учебных целей", "141010000000": "Для сенокошения и выпаса скота гражданами", "141011000000": "Фонд перераспределения", "141012000000": "Для размещения объектов охотничьего хозяйства", "141013000000": "Для размещения объектов рыбного хозяйства", "141014000000": "Для иных видов сельскохозяйственного использования", "142000000000": "Для размещения объектов, характерных для населенных пунктов", "142001000000": "Для объектов жилой застройки", "142001010000": "Для индивидуальной жилой застройки", "142001020000": "Для многоквартирной застройки", "142001020100": "Для малоэтажной застройки", "142001020200": "Для среднеэтажной застройки", "142001020300": "Для многоэтажной застройки", "142001020400": "Для иных видов жилой застройки", "142001030000": "Для размещения объектов дошкольного, начального, общего и среднего (полного) общего образования", "142001040000": "Для размещения иных объектов, допустимых в жилых зонах и не перечисленных в классификаторе", "142002000000": "Для объектов общественно-делового значения", "142002010000": "Для размещения объектов социального и коммунально-бытового назначения", "142002020000": "Для размещения объектов здравоохранения", "142002030000": "Для размещения объектов культуры", "142002040000": "Для размещения объектов торговли", "142002040100": "Для размещения объектов розничной торговли", "142002040200": "Для размещения объектов оптовой торговли", "142002050000": "Для размещения объектов общественного питания", "142002060000": "Для размещения объектов предпринимательской деятельности", "142002070000": "Для размещения объектов среднего профессионального и высшего профессионального образования", "142002080000": "Для размещения административных зданий", "142002090000": "Для размещения научно-исследовательских учреждений", "142002100000": "Для размещения культовых зданий", "142002110000": "Для стоянок автомобильного транспорта", "142002120000": "Для размещения объектов делового назначения, в том числе офисных центров", "142002130000": "Для размещения объектов финансового назначения", "142002140000": "Для размещения гостиниц", "142002150000": "Для размещения подземных или многоэтажных гаражей", "142002160000": "Для размещения индивидуальных гаражей", "142002170000": "Для размещения иных объектов общественно-делового значения, обеспечивающих жизнь граждан", "142003000000": "Для общего пользования (уличная сеть)", "142004000000": "Для размещения объектов специального назначения", "142004010000": "Для размещения кладбищ", "142004020000": "Для размещения крематориев", "142004030000": "Для размещения скотомогильников", "142004040000": "Под объектами размещения отходов потребления", "142004050000": "Под иными объектами специального назначения", "142005000000": "Для размещения коммунальных, складских объектов", "142006000000": "Для размещения объектов жилищно-коммунального хозяйства", "142007000000": "Для иных видов использования, характерных для населенных пунктов", "143000000000": "Для размещения объектов промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, обеспечения космической деятельности, обороны, безопасности и иного специального назначения", "143001000000": "Для размещения промышленных объектов", "143001010000": "Для размещения производственных и административных зданий, строений, сооружений и обслуживающих их объектов", "143001010100": "Для размещения производственных зданий", "143001010200": "Для размещения коммуникаций", "143001010300": "Для размещения подъездных путей", "143001010400": "Для размещения складских помещений", "143001010500": "Для размещения административных зданий", "143001010600": "Для размещения культурно-бытовых зданий", "143001010700": "Для размещения иных сооружений промышленности", "143001020000": "Для добычи и разработки полезных ископаемых", "143001030000": "Для размещения иных объектов промышленности", "143002000000": "Для размещения объектов энергетики", "143002010000": "Для размещения электростанций и обслуживающих сооружений и объектов", "143002010100": "Для размещения гидроэлектростанций", "143002010200": "Для размещения атомных станций", "143002010300": "Для размещения ядерных установок", "143002010400": "Для размещения пунктов хранения ядерных материалов и радиоактивных веществ энергетики", "143002010500": "Для размещения хранилищ радиоактивных отходов", "143002010600": "Для размещения тепловых станций", "143002010700": "Для размещения иных типов электростанций", "143002010800": "Для размещения иных обслуживающих сооружений и объектов", "143002020000": "Для размещения объектов электросетевого хозяйства", "143002020100": "Для размещения воздушных линий электропередачи", "143002020200": "Для размещения наземных сооружений кабельных линий электропередачи", "143002020300": "Для размещения подстанций", "143002020400": "Для размещения распределительных пунктов", "143002020500": "Для размещения других сооружений и объектов электросетевого хозяйства", "143002030000": "Для размещения иных объектов энергетики", "143003000000": "Для размещения объектов транспорта", "143003010000": "Для размещения и эксплуатации объектов железнодорожного транспорта", "143003010100": "Для размещения железнодорожных путей и их конструктивных элементов", "143003010200": "Для размещения полос отвода железнодорожных путей", "143003010300": "Для размещения, эксплуатации, расширения и реконструкции строений, зданий, сооружений, в том числе железнодорожных вокзалов, железнодорожных станций, а также устройств и других объектов, необходимых для эксплуатации, содержания, строительства, реконструкции, ремонта, развития наземных и подземных зданий, строений, сооружений, устройств и других объектов железнодорожного транспорта", "143003010301": "Для размещения железнодорожных вокзалов", "143003010302": "Для размещения железнодорожных станций", "143003010303": "Для размещения устройств и других объектов, необходимых для эксплуатации, содержания, строительства, реконструкции, ремонта, развития наземных и подземных зданий, строений, сооружений, устройств и других объектов железнодорожного транспорта", "143003020000": "Для размещения и эксплуатации объектов автомобильного транспорта и объектов дорожного хозяйства", "143003020100": "Для размещения автомобильных дорог и их конструктивных элементов", "143003020200": "Для размещения полос отвода", "143003020300": "Для размещения объектов дорожного сервиса в полосах отвода автомобильных дорог", "143003020400": "Для размещения дорожных сооружений", "143003020500": "Для размещения автовокзалов и автостанций", "143003020600": "Для размещения иных объектов автомобильного транспорта и дорожного хозяйства", "143003030000": "Для размещения и эксплуатации объектов морского, внутреннего водного транспорта", "143003030100": "Для размещения искусственно созданных внутренних водных путей", "143003030200": "Для размещения морских и речных портов, причалов, пристаней", "143003030300": "Для размещения иных объектов морского, внутреннего водного транспорта", "143003030400": "Для выделения береговой полосы", "143003040000": "Для размещения и эксплуатации объектов воздушного транспорта", "143003040100": "Для размещения аэропортов и аэродромов", "143003040200": "Для размещения аэровокзалов", "143003040300": "Для размещения взлетно-посадочных полос", "143003040400": "Для размещения иных наземных объектов воздушного транспорта", "143003050000": "Для размещения и эксплуатации объектов трубопроводного транспорта", "143003050100": "Для размещения нефтепроводов", "143003050200": "Для размещения газопроводов", "143003050300": "Для размещения иных трубопроводов", "143003050400": "Для размещения иных объектов трубопроводного транспорта", "143003060000": "Для размещения и эксплуатации иных объектов транспорта", "143004000000": "Для размещения объектов связи, радиовещания, телевидения, информатики", "143004010000": "Для размещения эксплуатационных предприятий связи и обслуживания линий связи", "143004020000": "Для размещения кабельных, радиорелейных и воздушных линий связи и линий радиофикации на трассах кабельных и воздушных линий связи и радиофикации и их охранные зоны", "143004030000": "Для размещения подземных кабельных и воздушных линий связи и радиофикации и их охранные зоны", "143004040000": "Для размещения наземных и подземных необслуживаемых усилительных пунктов на кабельных линиях связи и их охранные зоны", "143004050000": "Для размещения наземных сооружений и инфраструктур спутниковой связи", "143004060000": "Для размещения иных объектов связи, радиовещания, телевидения, информатики", "143005000000": "Для размещения объектов, предназначенных для обеспечения космической деятельности", "143005010000": "Для размещения космодромов, стартовых комплексов и пусковых установок", "143005020000": "Для размещения командно-измерительных комплексов, центров и пунктов управления полетами космических объектов, приема, хранения и переработки информации", "143005030000": "Для размещения баз хранения космической техники", "143005040000": "Для размещения полигонов приземления космических объектов и взлетно-посадочных полос", "143005050000": "Для размещения объектов экспериментальной базы для отработки космической техники", "143005060000": "Для размещения центров и оборудования для подготовки космонавтов", "143005070000": "Для размещения других наземных сооружений и техники, используемых при осуществлении космической деятельности", "143006000000": "Для размещения объектов, предназначенных для обеспечения обороны и безопасности", "143006010000": "Для обеспечения задач обороны", "143006010100": "Для размещения военных организаций, учреждений и других объектов", "143006010200": "Для дислокации войск и сил флота", "143006010300": "Для проведения учений и иных мероприятий", "143006010400": "Для испытательных полигонов", "143006010500": "Для мест уничтожения оружия и захоронения отходов", "143006010600": "Для создания запасов материальных ценностей в государственном и мобилизационном резервах (хранилища, склады и другие)", "143006010700": "Для размещения иных объектов обороны", "143006020000": "Для размещения объектов (территорий), обеспечивающих защиту и охрану Государственной границы Российской Федерации", "143006020100": "Для обустройства и содержания инженерно-технических сооружений и заграждений", "143006020200": "Для обустройства и содержания пограничных знаков", "143006020300": "Для обустройства и содержания пограничных просек", "143006020400": "Для обустройства и содержания коммуникаций", "143006020500": "Для обустройства и содержания пунктов пропуска через Государственную границу Российской Федерации", "143006020600": "Для размещения иных объектов для защиты и охраны Государственной границы Российской Федерации", "143006030000": "Для размещения иных объектов обороны и безопасности", "143007000000": "Для размещения иных объектов промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, обеспечения космической деятельности, обороны, безопасности и иного специального назначения", "144000000000": "Для размещения особо охраняемых историко-культурных и природных объектов (территорий)", "144001000000": "Для размещения особо охраняемых природных объектов (территорий)", "144001010000": "Для размещения государственных природных заповедников (в том числе биосферных)", "144001020000": "Для размещения государственных природных заказников", "144001030000": "Для размещения национальных парков", "144001040000": "Для размещения природных парков", "144001050000": "Для размещения дендрологических парков", "144001060000": "Для размещения ботанических садов", "144001070000": "Для размещения объектов санаторного и курортного назначения", "144001080000": "Территории месторождений минеральных вод, лечебных грязей, рапы лиманов и озер", "144001090000": "Для традиционного природопользования", "144001100000": "Для размещения иных особо охраняемых природных территорий (объектов)", "144002000000": "Для размещения объектов (территорий) природоохранного назначения", "144003000000": "Для размещения объектов (территорий) рекреационного назначения", "144003010000": "Для размещения домов отдыха, пансионатов, кемпингов", "144003020000": "Для размещения объектов физической культуры и спорта", "144003030000": "Для размещения туристических баз, стационарных и палаточных туристско-оздоровительных лагерей, домов рыболова и охотника, детских туристических станций", "144003040000": "Для размещения туристических парков", "144003050000": "Для размещения лесопарков", "144003060000": "Для размещения учебно-туристических троп и трасс", "144003070000": "Для размещения детских и спортивных лагерей", "144003080000": "Для размещения скверов, парков, городских садов", "144003090000": "Для размещения пляжей", "144003100000": "Для размещения иных объектов (территорий) рекреационного назначения", "144004000000": "Для размещения объектов историко-культурного назначения", "144004010000": "Для размещения объектов культурного наследия народов Российской Федерации (памятников истории и культуры), в том числе объектов археологического наследия", "144004020000": "Для размещения военных и гражданских захоронений", "144005000000": "Для размещения иных особо охраняемых историко-культурных и природных объектов (территорий)", "145000000000": "Для размещения объектов лесного фонда", "145001000000": "Для размещения лесной растительности", "145002000000": "Для восстановления лесной растительности", "145003000000": "Для прочих объектов лесного хозяйства", "146000000000": "Для размещения объектов водного фонда", "146001000000": "Под водными объектами", "146002000000": "Для размещения гидротехнических сооружений", "146003000000": "Для размещения иных сооружений, расположенных на водных объектах", "147000000000": "Земли запаса (неиспользуемые)", "014001000000": "Земли жилой застройки", "014001001000": "Земли под жилыми домами многоэтажной и повышенной этажности застройки", "014001002000": "Земли под домами индивидуальной жилой застройкой", "014001003000": "Незанятые земли, отведенные под жилую застройку", "014002000000": "Земли общественно-деловой застройки", "014002001000": "Земли гаражей и автостоянок", "014002002000": "Земли под объектами торговли, общественного питания, бытового обслуживания, автозаправочными и газонаполнительными станциями, предприятиями автосервиса", "014002003000": "Земли учреждений и организаций народного образования, земли под объектами здравоохранения и социального обеспечения физической культуры и спорта, культуры и искусства, религиозными объектами", "014002004000": "Земли под административно-управлен-ческими и общественными объектами, земли предприятий, организаций, учреждений финансирования, кредитования, страхования и пенсионного обеспечения", "014002005000": "Земли под зданиями (строениями) рекреации", "014003000000": "Земли под объектами промышленности", "014004000000": "Земли общего пользования (геонимы в поселениях)", "014005000000": "Земли под объектами транспорта, связи, инженерных коммуникаций", "014005001000": "Под объектами железнодорожного транспорта", "014005002000": "Под объектами автомобильного транспорта", "014005003000": "Под объектами морского, внутреннего водного транспорта", "014005004000": "Под объектами воздушного транспорта", "014005005000": "Под объектами иного транспорта, связи, инженерных коммуникаций", "014006000000": "Земли сельскохозяйственного использования", "014006001000": "Земли под крестьянскими (фермерскими) хозяйствами", "014006002000": "Земли под предприятиями, занимающимися сельскохозяйственным производством", "014006003000": "Земли под садоводческими объединениями и индивидуальными садоводами", "014006004000": "Земли под огородническими объединениями и индивидуальными огородниками", "014006005000": "Земли под дачными объединениями", "014006006000": "Земли под личными подсобными хозяйствами", "014006007000": "Земли под служебными наделами", "014006008000": "Земли оленьих пастбищ", "014006009000": "Для других сельскохозяйственных целей", "014007000000": "Земли под лесами в поселениях (в том числе городскими лесами), под древесно-кустарниковой растительностью, не входящей в лесной фонд (в том числе лесопарками, парками, скверами, бульварами)", "014008000000": "Земли, занятые водными объектами, земли водоохранных зон водных объектов, а также земли, выделяемые для установления полос отвода и зон охраны водозаборов, гидротехнических сооружений и иных водохозяйственных сооружений, объектов.", "014009000000": "Земли под военными и иными режимными объектами", "014010000000": "Земли под объектами иного специального назначения", "014011000000": "Земли, не вовлеченные в градостроительную или иную деятельность (земли – резерв)", "014012000000": "Неопределено", "014013000000": "Значение отсутствует" };
    var CALCULATING = "Идет расчет статистики";
    var AREA_TYPES = {
        "001": "Площадь застройки",
        "002": "Общая площадь",
        "003": "Общая площадь без лоджии",
        "004": "Общая площадь с лоджией",
        "005": "Жилая площадь",
        "007": "Основная площадь",
        "008": "Декларированная площадь",
        "009": "Уточненная площадь",
        "010": "Фактическая площадь",
        "011": "Вспомогательная площадь",
        "012": "Площадь помещений общего пользования без лоджии",
        "013": "Площадь помещений общего пользования с лоджией",
        "014": "Прочие технические помещения без лоджии",
        "015": "Прочие технические помещения с лоджией",
        "020": "Застроенная площадь",
        "021": "Незастроенная площадь",
        "022": "Значение площади отсутствует"
    };

    var FORM_RIGHTS = {
        "100": "частная",
        "200": "публичная",
        "300": "«частная и публичная»"
    };

    var KINDS = {
        " ": "",//пусто
        "-1": "002001001000",//ЗУ
        "building": "002001002000",//Здание
        "flat": "002001003000",
        "construction": "002001004000",//Сооружение
        "2": "002001005000"//Объект незавершенного строительства
    };

    var FIELDS = {
        address: "OBJECT_ADDRESS",
        addressId: "FULLADDRESSID",
        addressName: "NAME",
        area: "AREA_VALUE",
        areaType: "AREA_TYPE",
        areaUnit: "AREA_UNIT",
        atdId: "BS_ID",
        borderName: "BS_NAME",
        borderSub1: "Субъект 1",
        borderSub2: "Субъект 2",
        borderType: "Тип границы",
        build: "BUILDING",
        builderInn: "OKS_INN",
        builderName: "OKS_EXECUTOR",
        cadastreEngineerFirstName: "CI_FIRST",
        cadastreEngineerSecondName: "CI_SURNAME",
        cadastreEngineerThirdName: "CI_PATRONYMIC",
        cadastreKvartalCount: "KVARTALS_CNT",
        cadastreKvartalId: "PKK_ID",
        cadastreKvartalNumber: "KVARTALNUMBER",
        cadastreNumber: "CAD_NUM",
        cadastreOkrugId: "PKK_ID",
        cadastreOkrugNumber: "OKRUGNUMBER",
        cadastreOksCount: "OKS_CNT",
        cadastreParcelCount: "PARCELS_CNT",
        cadastrePrice: "CAD_COST",
        cadastrePriceUnit: "CAD_UNIT",
        cadastreRayonCount: "RAYONS_CNT",
        cadastreRayonId: "PKK_ID",
        cadastreRayonNumber: "RAYONNUMBER",
        category: "CATEGORY_TYPE",
        endBuildingYear: "YEAR_BUILT",
        formRights: "FORM_RIGHTS",
        geometryError: "ERROR_CODE",
        hasMO2Level: "HASMUNICIPALITY2",
        hasPolygon: "HASPOLYGON",
        hasStreet: "HASSTREET",
        house: "HOUSE",
        inventoryCost: "OKS_INVENTORY_COST",
        inventoryCostDate: "OKS_COST_DATE",
        isCenter: "ISCENTER",
        kladr: "KLADR",
        letter: "LETTER",
        loadDate: "RC_DATE",
        location: "location",
        locatorField: "Loc_name",
        locatorIntField: "LocatorInt",
        locatorNameField: "LocatorName",
        matchAddress: "Match_addr",
        mo1LevelId: "MUNICIPALITY1ID",
        mo2LevelId: "MUNICIPALITY2ID",
        name: "NAME",
        objectId: "OBJECTID",
        oksCadastreNumber: "CADNUMOLD",
        oksId: "PKK_ID",
        oksNumber: "OKSNUMBEROLD",
        oksType: "OKS_TYPE",
        organizationCode: "ORG_CODE",
        parcelId: "PARCEL_ID",
        parcelNumber: "PARCELNUMBER",
        parentName: "ParentName",
        phone: "PHONENUMBER",
        postcode: "POSTCODE",
        score: "score",
        settlement: "SETTLEMENT",
        settlementId: "SETTLEMENTID",
        shortCadastreNumber: "SHORTNUMBER",
        sortField: "Sort",
        startOperationYear: "OKS_YEAR_USED",
        state: "STATE",
        stateCode: "PARCEL_STATUS",
        storeyCount: "OKS_FLOORS",
        street: "STREET",
        subjectId: "REGIONID",
        undergroundStoreyCount: "OKS_U_FLOORS",
        usrField: "User_fld",
        utilizationCode: "UTIL_CODE",
        utilizationDoc: "UTIL_BY_DOC",
        utilizationFact: "UTILIZATION_FACT",
        utilizationRef: "UTILIZATION_REFERENCEVALUES",
        utilizationValue: "UTILIZATION_VALUE",
        wallMaterial: "OKS_ELEMENTS_CONSTRUCT",
        xCoord: "X_COORD",
        xmax: "XMAX",
        xmin: "XMIN",
        yCoord: "Y_COORD",
        ymax: "YMAX",
        ymin: "YMIN",
    };


    var INFO_WINDOW_CONTENT_TEMPLATE = {
        tabPanel: "<div class='portlet-nav-toolbar'><div class='portlet-nav-toolbar-box'><ul class='portlet-nav-tabs portlet-nav-tabs-content g-layout'><li class='tabs-item2-active'><a class='tabs-item2'><span><span><span class='tab_header'>Информация</span></span></span></a></li><li><a class='tabs-item2'><span><span><span class='tab_header'>Характеристики</span></span></span></a></li><li><a class='tabs-item2'><span><span><span class='tab_header'>Кто обслуживает?</span></span></span></a></li><li><a class='tabs-item2'><span><span><span class='tab_header'>Услуги</span></span></span></a></li></ul></div></div>",
        liteTabPanel: "<div class='portlet-nav-toolbar'><div class='portlet-nav-toolbar-box'><ul class='portlet-nav-tabs portlet-nav-tabs-content g-layout'><li class='tabs-item2-active'><a class='tabs-item2'><span><span><span class='tab_header'>Информация</span></span></span></a></li><li><a class='tabs-item2'><span><span><span class='tab_header'>Характеристики</span></span></span></a></li><li><a class='tabs-item2'><span><span><span class='tab_header'>Кто обслуживает?</span></span></span></a></li></ul></div></div>",
        cadastreDiv: "<div class='portlet-nav-toolbar'><div class='portlet-nav-toolbar-box'><ul class='portlet-nav-tabs portlet-nav-tabs-content g-layout'><li class='tabs-item2-active'><a class='tabs-item2'><span><span><span class='tab_header'>На карте</span></span></span></a></li></ul></div></div>",
        cadastreZoneTabPanel: "<div class='portlet-nav-toolbar'><div class='portlet-nav-toolbar-box'><ul class='portlet-nav-tabs portlet-nav-tabs-content g-layout'><li class='tabs-item2-active'><a class='tabs-item2'><span><span><span class='tab_header'>На карте</span></span></span></a></li><li><a class='tabs-item2'><span><span><span class='tab_header'>Кто обслуживает?</span></span></span></a></li></ul></div></div>",

        tabHeader: "<div class='portlet-content-wrap2'>",
        activeTabHeader: "<div class='portlet-content-wrap2 portlet-content-wrap2-active'>",
        tabFooter: "</div>",
        divHeader: "<div>",
        divFooter: "</div>",

        mapInfoContainerHeader: "<div class='mapInfoContainer'>",
        mapInfoContainerFooter: "</div>",
        mapInfoEmptyMessage: "<div class='emptyGeometry'><p><strong class='red'>Внимание!</strong> Сведения о границах объекта отсутствуют. Местоположение указано ориентировочно.</p></div>",
        mapInfoTableHeader: "<table class='mapInfo'><tbody>",
        mapInfoTableFooter: "</tbody></table>",
        mapInfoAddressRow: "<tr><td class='leftColumn'>Адрес:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr>",
        mapInfoParcelRow: "<tr><td>Земельный участок:</td><td><a class='pseudoLink' onclick='parentCadastreNumberClick(\"{0}\");'><strong>{0}</strong></a></td></tr><tr class='emptyRow'></tr>",
        mapInfoCadastreKvartalRow: "<tr><td>Квартал:</td><td><a class='pseudoLink' onclick='parentCadastreNumberClick(\"{0}\");'><strong>{0}</strong></a></td></tr><tr class='emptyRow'></tr>",
        mapInfoCadastreRayonRow: "<tr><td>Район:</td><td><a class='pseudoLink' onclick='parentCadastreNumberClick(\"{0}\");'><strong>{0}</strong></a></td></tr><tr class='emptyRow'></tr>",
        mapInfoCadastreOkrugRow: "<tr><td>Округ:</td><td><a class='pseudoLink' onclick='parentCadastreNumberClick(\"{0}\");'><strong>{0}</strong></a></td></tr><tr class='emptyRow'></tr>",

        infoTableHeader: "<div class='infoContainer'><table class='info'><tbody>",
        infoTableFooter: "</tbody></table></div>",
        infoStateRow: "<tr><td class='leftColumn'>Статус:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr>",
        infoCategory: "<tr><td class='leftColumn'>Категория:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",

        infoDateRow: "<tr><td class='leftColumn'>Дата постановки на учет:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",
        infoAttrActualDateRow: "<tr><td class='leftColumn'>Дата обновления атрибутов на ПКК:</td><td><strong id='actual_date'>{0}</strong></td></tr></tr>",
        infoBorderActualDateRow: "<tr><td class='leftColumn'>Дата обновления границ на ПКК:</td><td><strong id='border_actual_date'>{0}</strong></td></tr></tr>",

        infoParcelAttrActualDateRow: "<tr><td class='leftColumn'>Дата обновления атрибутов участка на ПКК:</td><td><strong id='actual_date'>{0}</strong></td></tr></tr>",
        infoParcelBorderActualDateRow: "<tr><td class='leftColumn'>Дата обновления границ участка на ПКК:</td><td><strong id='border_actual_date'>{0}</strong></td></tr></tr>",

        infoOksAttrActualDateRow: "<tr><td class='leftColumn'>Дата обновления атрибутов ОКС на ПКК:</td><td><strong>{0}</strong></td></tr></tr>",
        infoOksBorderActualDateRow: "<tr><td class='leftColumn'>Дата обновления границ ОКС на ПКК:</td><td><strong>{0}</strong></td></tr></tr>",


        infoKLADRRow: "<tr><td class='leftColumn'>Кладр:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",

        infoLetterRow: "<tr><td class='leftColumn'>Литера:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",
        infoWallMaterialRow: "<tr><td class='leftColumn'>Материал стен:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",
        infoStartOperationYearRow: "<tr><td class='leftColumn'>Ввод в эксплуатацию:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",
        infoEndBuildingYearRow: "<tr><td class='leftColumn'>Завершение строительства:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",
        infoInventoryCostRow: "<tr><td class='leftColumn'>Инвентаризационная стоимость:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",
        infoInventoryCostDateRow: "<tr><td class='leftColumn'>Дата определения ИС:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",
        infoBuilderNameRow: "<tr><td class='leftColumn'>Исполнитель:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",
        infoBuilderInnRow: "<tr><td class='leftColumn'>ИНН исполнителя:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",
        infoStoreyCountRow: "<tr><td class='leftColumn'>Общая этажность:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",
        infoUndergroundStoreyCountRow: "<tr><td class='leftColumn'>Подземная этажность:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",

        infoUtilizationRow: "<tr><td class='leftColumn' colspan='2'>Разрешенное использование</td></tr><tr class='emptyRow'></tr>",
        infoUtilizationVRIZCodeRow: "<tr><td class='leftColumn smallFont'>&nbsp&nbsp&nbsp&nbspПо классификатору (код):</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr>",
        infoUtilizationVRIZRow: "<tr><td class='leftColumn smallFont'>&nbsp&nbsp&nbsp&nbspПо классификатору (описание):</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr>",
        infoUtilizationDocRow: "<tr><td class='leftColumn smallFont'>&nbsp&nbsp&nbsp&nbspПо документу:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",

        infoOwnership: "<tr><td class='leftColumn'>Форма собственности:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr><tr class='emptyRow'></tr>",

        infoAreaRow: "<tr><td class='leftColumn'>{0}:</td><td><strong>{1} {2}</strong></td></tr><tr class='emptyRow'></tr>",
        infoAreaDocRow: "<tr><td class='leftColumn'>Площадь по документу:</td><td><strong>{0} {1}</strong></td></tr><tr class='emptyRow'></tr>",
        infoAreaFactRow: "<tr><td class='leftColumn'>Фактическая площадь:</td><td><strong>{0} {1}</strong></td></tr><tr class='emptyRow'></tr>",
        infoAreaRefRow: "<tr><td class='leftColumn'>Уточненная площадь:</td><td><strong>{0} {1}</strong></td></tr><tr class='emptyRow'></tr>",
        infoCadastrePriceRow: "<tr><td class='leftColumn'>Кадастровая стоимость:</td><td><strong>{0} {1}</strong></td></tr><tr class='emptyRow'></tr>",
        infoCadastreEngineerRow: "<tr><td class='leftColumn'>Кадастровый инженер:</td><td><strong>{0} {1} {2}</strong></td></tr><tr class='emptyRow'></tr>",
        infoOksTestRow: "<tr><td class='leftColumn'>{0}</td><td><strong>{1}</strong></td></tr><tr class='emptyRow'></tr>",

        zoneListHeader: "<ul id='zoneList' class='zoneList'>",
        zoneListFooter: "</ul>",
        zoneWaitListItem: "<li class='waitZoneItem'><img alt='loading' src='/portalonline/i/pin_load.gif'/><span>Загрузка данных...</span></li>",
        zoneErrorListItem: "<li class='errorZoneItem'><div class='errorZoneItemImg'></div><span>Превышен интвервал ожидания.<br/>Повторите запрос позже.</span></li>",
        zoneEmptyListItem: "<li class='emptyZoneItem'><div class='emptyZoneItemImg'></div><span>Данные отсутствуют.</span></li>",
        zoneHeaderListItem: "<li class='headerZoneItem'><strong>{0}</strong></li>",
        zoneListItem: "<li class='zoneItem'><div class='zoneItemMarker'></div><div class='zoneItemContent'><strong class='zoneItemTitle'>{0}</strong><br/>{1}</div></li>",

        linkListHeader: "<ul class='linkList'>",
        linkListFooter: "</ul>",
        linkListItems: [
                        "<li class='linkItem'><div class='linkIcon'></div><a target='_blank' href='https://rosreestr.ru/wps/portal/cc_information_online?KN={0}' onclick='__event(\"{0}\",ACTIONS.Service,\"Информация онлайн\")' class='link'>Справочная информация об объекте недвижимости в режиме онлайн</a></li>",
                        "<li class='linkItem'><div class='linkIcon'></div><a target='_blank' href='https://rosreestr.ru/wps/portal/cc_gkn_form_new?KN={0}&objKind={1}' onclick='__event(\"{0}\",ACTIONS.Service,\"Сведения ГКН (new)\")' class='link'>Запрос о предоставлении сведений ГКН</a></li>",
                        "<li class='linkItem'><div class='linkIcon'></div><a target='_blank' href='https://rosreestr.ru/wps/portal/cc_egrp_form_new?KN={0}&objKind={1}' onclick='__event(\"{0}\",ACTIONS.Service,\"Сведения ЕГРП\")' class='link'>Запрос о предоставлении сведений ЕГРП</a></li>"
        ],
        cadastreMapInfoTableContainerHeader: "<div class='cadastreMapInfoContainerContainer' >",
        cadastreMapInfoTableContainerFooter: "</div>",
        cadastreMapInfoTableHeader: "<div class='cadastreMapInfoContainer'><table class='cadastreMapInfo'><tbody>",
        cadastreMapInfoTableFooter: "</tbody></table></div>",
        cadastreMapInfoEmptyRow: "<tr class='emptyRow'><td colspan='2'><div class='cadastreMapInfoSplitter'></div><td></tr>",
        cadastreMapInfoParcelCountRow: "<tr><td class='leftColumn'>Участков:</td><td><strong>{0}</strong></td></tr>",
        cadastreMapInfoKvartalCountRow: "<tr><td class='leftColumn'>Кварталов:</td><td><strong>{0}</strong></td></tr>",
        cadastreMapInfoRayonCountRow: "<tr><td class='leftColumn'>Районов:</td><td><strong>{0}</strong></td></tr>",
        cadastreMapInfoOkrugNumberRow: "<tr><td class='leftColumn'>Округ:</td><td><a class='pseudoLink' onclick='parentCadastreNumberClick(\"{0}\"); return false;'><strong>{0}</strong></a></td></tr>",
        cadastreMapInfoRayonNumberRow: "<tr><td class='leftColumn'>Район:</td><td><a class='pseudoLink' onclick='parentCadastreNumberClick(\"{0}\"); return false;'><strong>{0}</strong></a></td></tr>",
        cadastreMapInfoPlansRow: "<tr class='emptyRow'><td colspan='2'><div class='cadastreMapInfoSplitter'></div><td></tr><tr><td colspan='2'><a class='pseudoLink' id='parcelPlan' target='_blank' href='image.html?id={0}'><strong>План ЗУ</strong></a><a class='pseudoLink' id='kvartalPlan' target='_blank' href='image.html?id={0}&neighbour=true'><strong>План КК</strong></a></td></tr>",
        cadastreMapInfoKvartalPlansRow: "<tr class='emptyRow'><td colspan='2'><div class='cadastreMapInfoSplitter'></div><td></tr><tr><td colspan='2'><a class='pseudoLink' id='parcelPlan' target='_blank' href='image.html?id={0}'><strong>План КК</strong></a></td></tr>",
        cadastreMapInfo3DRow: "<tr class='emptyRow'><td colspan='2'><div class='cadastreMapInfoSplitter'></div><td></tr><tr><td colspan='2'><a class='pseudoLink' id='parcelPlan' target='_blank' href='http://maps.rosreestr.ru/portalonline/Cadastre3d/{0}'><strong>3D кадастр</strong></a></td></tr>",
        cadastreMapInfoOksCountRow: "<tr><td class='leftColumn'>ОКС:</td><td><strong>{0}</strong></td></tr>",

        cadastreZoneListHeader: "<ul id='zoneList' class='zoneList' style='height:155px;'>", //64


        zouitMapInfoTableHeader: "<div class='cadastreMapInfoContainer' style='height: 122px;'><table class='cadastreMapInfo'><tbody>",
        zouitMapInfoTableFooter: "</tbody></table></div>",
        zouitTypeMapInfoRow: "<tr><td class='leftColumnZone'>Тип:</td><td><strong>{0}</strong></td></tr>",
        zouitDescriptionMapInfoRow: "<tr><td class='leftColumnZone'>Описание:</td><td><strong>{0}</strong></td></tr>",
        zouitDocMapInfoRow: "<tr><td class='leftColumnZone'>Документ:</td><td><strong><p id='zouitDocs'></p></strong></td></tr>",

        terrZoneMapInfoTableHeader: "<div class='cadastreMapInfoContainer' style='height: 122px;'><table class='cadastreMapInfo'><tbody>",
        terrZoneMapInfoTableFooter: "</tbody></table></div>",
        terrZoneTypeMapInfoRow: "<tr><td class='leftColumnZone'>Тип:</td><td><strong>{0}</strong></td></tr>",
        terrZoneDescriptionMapInfoRow: "<tr><td class='leftColumnZone'>Описание:</td><td><strong>{0}</strong></td></tr>",
        terrZoneDocMapInfoRow: "<tr><td class='leftColumnZone'>Документ:</td><td><strong><p id='terrzoneDocs'></p></strong></td></tr>",

        borderMapInfoTableHeader: "<div class='cadastreMapInfoContainer' style='height: 122px'><table class='cadastreMapInfo'><tbody>",
        borderMapInfoTableFooter: "</tbody></table></div>",
        borderDescriptionMapInfoRow: "<tr><td class='leftColumn'>Описание:</td><td><strong>{0}</strong></td></tr>",
        borderSubjectsMapInfoRow: "<tr><td>Граница:</td><td><strong>{0}</strong></td></tr>",
        borderDocsMapInfoRow: "<tr><td class='leftColumn'>Документы:</td><td><strong><p id='borderDocs'></p></strong></td></tr>",

        atdNameInfoRow: "<tr><td >Наименование:</td><td><strong>{0}</strong></td></tr>",

        atdMapInfoTableHeader: "<div class='cadastreMapInfoContainer' style='height: 122px'><table class='cadastreMapInfo'><tbody>",
        atdMapInfoTableFooter: "</tbody></table></div>",
        atdMapOkatoInfoRow: "<tr><td class='leftColumn'>ОКАТО:</td><td><strong>{0}</strong></td></tr>",
        atdMapOktmoInfoRow: "<tr><td class='leftColumn'>ОКТМО:</td><td><strong>{0}</strong></td></tr>",
        atdMapCapitalInfoRow: "<tr><td class='leftColumn'>Столица:</td><td><strong>{0}</strong></td></tr>",
        atdMapCenterInfoRow: "<tr><td class='leftColumn'>Центр:</td><td><strong>{0}</strong></td></tr>",

        atdMapParentInfoRow: "<tr class='emptyRow'></tr><tr><td class='leftColumn' colspan='2'>В составе</td></tr>",
        atdMapSettlementInfoRow: "<tr><td class='leftColumn'>&nbsp&nbsp&nbsp&nbspПоселение:</td><td><strong>{0}</strong></td></tr>",
        atdMapRayon1InfoRow: "<tr><td class='leftColumn'>&nbsp&nbsp&nbsp&nbspРайон:</td><td><strong>{0}</strong></td></tr>",
        atdMapRayon2InfoRow: "<tr><td class='leftColumn'>&nbsp&nbsp&nbsp&nbspОкруг:</td><td><strong>{0}</strong></td></tr>",
        atdMapSubjectInfoRow: "<tr><td class='leftColumn'>&nbsp&nbsp&nbsp&nbspСубъект РФ:</td><td><strong>{0}</strong></td></tr><tr class='emptyRow'></tr>",

        atdMapMOInfoRow: "<tr><td class='leftColumn'>Количество МО:</td><td><strong>{0}</strong></td></tr>",
        atdMapNPInfoRow: "<tr><td class='leftColumn'>Количество НП:</td><td><strong>{0}</strong></td></tr>",
        atdMapRosreestrInfoRow: "<tr><td class='leftColumn'>Количество офисов Росреестра:</td><td><strong>{0}</strong></td></tr>",
        atdMapMO2InfoRow: "<tr><td class='leftColumn'>Количество поселений:</td><td><strong>{0}</strong></td></tr>",

        frameNameMapInfoRow: "<tr><td class='leftColumn'>Название:</td><td><strong>{0}</strong></td></tr>",
        frameHolderMapInfoRow: "<tr><td class='leftColumn'>Источник:</td><td><strong>{0}</strong></td></tr>",
        frameScaleMapInfoRow: "<tr><td class='leftColumn'>Масштаб:</td><td><strong>{0}</strong></td></tr>",
        frameDateMapInfoRow: "<tr><td class='leftColumn'>Актуальность:</td><td><strong>{0}</strong></td></tr>",
        frameLinkMapInfoRow: "<tr><td class='leftColumn' colspan='2'><img id='frameInfoLinkLoadingIndicator' alt='loading' src='/portalonline/i/pin_load.gif'/><a id='frameInfoLink' style='display:none;' target='_blank' href='javascript: void 0'>Подробная информация</a></td></tr>"

    };

    var CADASTRE_NUMBER_PARTS_LENGTH = [2, 2, 7, 5, 5];

    function addCadastreNumbers(attributes) {
        var cadParts = attributes[FIELDS.cadastreNumber].split(":");

        if (cadParts.length >= 1 && !attributes[FIELDS.cadastreOkrugNumber])
            attributes[FIELDS.cadastreOkrugNumber] = cadParts[0];

        if (cadParts.length >= 2 && !attributes[FIELDS.cadastreRayonNumber])
            attributes[FIELDS.cadastreRayonNumber] = cadParts[1];

        if (cadParts.length >= 3 && !attributes[FIELDS.cadastreKvartalNumber])
            attributes[FIELDS.cadastreKvartalNumber] = cadParts[2];
    };

    function buildInfoWindowTitle(objectType, feature) {
        switch (objectType) {
            case CadastreTypes.okrug:
                return OBJECT_TYPE_FULL_NAMES[0] + ': ' + feature.attributes[FIELDS.cadastreNumber] + ' - ' + feature.attributes[FIELDS.name];
                break;
            case CadastreTypes.rayon:
                return OBJECT_TYPE_FULL_NAMES[1] + ': ' + feature.attributes[FIELDS.cadastreNumber] + ' - ' + feature.attributes[FIELDS.name];
                break;
            case CadastreTypes.kvartal:
                return OBJECT_TYPE_FULL_NAMES[2] + ': ' + feature.attributes[FIELDS.cadastreNumber];
                break;
            case CadastreTypes.parcel:
                return OBJECT_TYPE_FULL_NAMES[3] + ': ' + feature.attributes["PARCEL_CN"];
                break;
            case CadastreTypes.oks:
                var oksType = OKS_TYPES[feature.attributes[FIELDS.oksType]] ? ' (' + OKS_TYPES[feature.attributes[FIELDS.oksType]] + ')' : '';

                return OBJECT_TYPE_FULL_NAMES[4] + oksType + ': ' + feature.attributes["PARCEL_CN"];
                break;
        }
    };

    function buildInfoWindowContent(objectType, feature) {
        switch (objectType) {
            case CadastreTypes.okrug:
                return buildCadastreInfoWindowContent(feature);
                break;
            case CadastreTypes.rayon:
                return buildCadastreInfoWindowContent(feature);
                break;
            case CadastreTypes.kvartal:
                return buildCadastreInfoWindowContent(feature);
                break;
            case CadastreTypes.parcel:
                return buildParcelInfoWindowContent(feature);
                break;
            case CadastreTypes.oks:
                return buildOksInfoWindowContent(feature);
                break;
        }
    };

    function substitute(template, params) {
        var prm;
        if (params instanceof Array) {
            prm = {};
            for (var i = 0; i < params.length; i++) {
                prm[i.toString()] = params[i];
            }
        } else {
            prm = params;
        }
        return template.replace(/{[^{}]+}/g, function (key) {
            return prm[key.replace(/[{}]+/g, "")] || "";
        });
    };

    function numberFormat(_number, _cfg) {

        function obj_merge(obj_first, obj_second) {
            var obj_return = {};
            for (key in obj_first) {
                if (typeof obj_second[key] !== 'undefined') obj_return[key] = obj_second[key];
                else obj_return[key] = obj_first[key];
            }
            return obj_return;
        };

        function thousands_sep(_num, _sep) {
            if (_num.length <= 3) return _num;
            var _count = _num.length;
            var _num_parser = '';
            var _count_digits = 0;
            for (var _p = (_count - 1) ; _p >= 0; _p--) {
                var _num_digit = _num.substr(_p, 1);
                if (_count_digits % 3 == 0 && _count_digits != 0 && !isNaN(parseFloat(_num_digit))) _num_parser = _sep + _num_parser;
                _num_parser = _num_digit + _num_parser;
                _count_digits++;
            }
            return _num_parser;
        };

        if (typeof _number !== 'number') {
            _number = parseFloat(_number);
            if (isNaN(_number)) return CALCULATING;
        }

        var _cfg_default = { before: '', after: '', decimals: 2, dec_point: '.', thousands_sep: ',' };
        if (_cfg && typeof _cfg === 'object') {
            _cfg = obj_merge(_cfg_default, _cfg);
        }
        else _cfg = _cfg_default;
        _number = _number.toFixed(_cfg.decimals);
        if (_number.indexOf('.') != -1) {
            var _number_arr = _number.split('.');
            var _number = thousands_sep(_number_arr[0], _cfg.thousands_sep) + _cfg.dec_point + _number_arr[1];
        }
        else var _number = thousands_sep(_number, _cfg.thousands_sep);

        return _cfg.before + _number + _cfg.after;
    };

    function setDateField(elementId, content) {
        var dateField = document.getElementById(elementId);

        if (dateField) {
            dateField.innerHTML = content;
        }
        else {
            setTimeout(function () {
                dateField = document.getElementById(elementId);
                if (dateField) {
                    dateField.innerHTML = content;
                }
                else {
                    dateField.innerHTML = NO_DATA;
                }
            }, 2000);
        }
    };

    var _okrugDateAjaxQuery;
    function searchOkrugDate(okrugNumber) {
        var query = {};
        query.where = FIELDS.cadastreOkrugId + " like '" + okrugNumber + "%'";
        query.returnGeometry = false;
        query.outFields = "ONLINE_ACTUAL_DATE,ACTUAL_DATE";
        query.f = "json";

        _okrugDateAjaxQuery = $.ajax(CadastreTypes.okrug.layerUrl + "/query", {
            crossDomain: true,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            async: false,
            dataType: "jsonp",
            jsonpCallback: 'fnsuccesscallback2',
            data: query
        }).done(function (featureSet) {
            var attrDate = null;
            var borderDate = null;
            var attrContent;
            var borderContent;

            if (featureSet.features[0].attributes["ONLINE_ACTUAL_DATE"] != ' ' && featureSet.features[0].attributes["ONLINE_ACTUAL_DATE"] > 0) {
                attrDate = new Date(featureSet.features[0].attributes["ONLINE_ACTUAL_DATE"]);
                attrContent = formatDate(attrDate.getDate(), attrDate.getMonth() + 1, attrDate.getFullYear());
            }
            else {
                attrContent = CALCULATING;
            }

            if (featureSet.features[0].attributes["ACTUAL_DATE"] != ' ' && featureSet.features[0].attributes["ACTUAL_DATE"] > 0) {
                borderDate = new Date(featureSet.features[0].attributes["ACTUAL_DATE"]);
                borderContent = formatDate(borderDate.getDate(), borderDate.getMonth() + 1, borderDate.getFullYear());
            } else {
                borderContent = CALCULATING;
            }

            setDateField("actual_date", attrContent);
            setDateField("border_actual_date", borderContent);

        }).fail(function () {
            $('#loader').hide();
            $("#alert").show();
        });

    };

    var _zoneAjaxQuery;
    function searchZone(point) {

        var url = "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/TerrAgencies/MapServer/0/query";

        var query = {};
        query.geometry = JSON.stringify({ "x": point.x, "y": point.y, "spatialReference": { "wkid": "102100" } });
        query.returnGeometry = false;
        query.outFields = "NAME,PHONENUMBER,ORG_CODE,ORG_NAME,POSTCODE,SETTLEMENT,STREET,HOUSE,BUILDING";
        query.outSR = "102100";
        query.inSR = "102100";
        query.geometryType = "esriGeometryPoint";
        query.spatialRel = "esriSpatialRelIntersects";
        query.f = "json";

        _zoneAjaxQuery = $.ajax(url, {
            crossDomain: true,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            async: false,
            dataType: "jsonp",
            jsonpCallback: 'fnsuccesscallback',
            data: query
        }).done(function (featureSet) {
            insertZoneListContent(
                buildZoneListContent((featureSet.features) ? (featureSet.features) : (null)));
        }).fail(function () {
            $('#loader').hide();
            $("#alert").show();
        });
    };

    function insertZoneListContent(content) {

    };

    function buildZoneListContent(features) {

    };

    function formatDate(d, m, y) {
        return strpad(d.toString(), 2, '0', STR_PAD_LEFT) + '.' + strpad(m.toString(), 2, '0', STR_PAD_LEFT) + '.' + strpad(y.toString(), 4, '0', STR_PAD_LEFT);
    }

    function buildCadastreInfoWindowContent(feature) {
        var content = '';
        content += INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoTableHeader;

        if (feature.attributes[FIELDS.cadastreParcelCount]) {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoParcelCountRow,
                [numberFormat(feature.attributes[FIELDS.cadastreParcelCount], { decimals: 0, thousands_sep: " " })]);
        }
        if (feature.attributes[FIELDS.cadastreOksCount] || feature.attributes[FIELDS.cadastreOksCount] == 0) {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoOksCountRow,
                [numberFormat(feature.attributes[FIELDS.cadastreOksCount], { decimals: 0, thousands_sep: " " })]);
        }
        if (feature.attributes[FIELDS.cadastreKvartalCount]) {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoKvartalCountRow,
                [numberFormat(feature.attributes[FIELDS.cadastreKvartalCount], { decimals: 0, thousands_sep: " " })]);
        }
        if (feature.attributes[FIELDS.cadastreRayonCount]) {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoRayonCountRow,
                [numberFormat(feature.attributes[FIELDS.cadastreRayonCount], { decimals: 0, thousands_sep: " " })]);
        }


        if (feature.attributes[FIELDS.cadastreKvartalNumber] || feature.attributes[FIELDS.cadastreRayonNumber]) {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoAttrActualDateRow, [""]);
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoBorderActualDateRow, [""]);
            searchOkrugDate(feature.attributes[FIELDS.cadastreOkrugNumber]);
        }
        else {
            if (feature.attributes["ONLINE_ACTUAL_DATE"] != ' ' && feature.attributes["ONLINE_ACTUAL_DATE"] > 0) {
                var d = new Date(feature.attributes["ONLINE_ACTUAL_DATE"]);
                content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoAttrActualDateRow, [formatDate(d.getDate(), d.getMonth() + 1, d.getFullYear())]);
            }
            else {
                content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoAttrActualDateRow, [CALCULATING]);
            }
            if (feature.attributes["ACTUAL_DATE"] != ' ' && feature.attributes["ACTUAL_DATE"] > 0) {
                var d = new Date(feature.attributes["ACTUAL_DATE"]);
                content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoBorderActualDateRow, [formatDate(d.getDate(), d.getMonth() + 1, d.getFullYear())]);
            }
            else {
                content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoBorderActualDateRow, [CALCULATING]);
            }
        }

        if (feature.attributes[FIELDS.cadastreKvartalNumber] || feature.attributes[FIELDS.cadastreRayonNumber]) {
            content += INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoEmptyRow;
        }

        if (feature.attributes[FIELDS.cadastreKvartalNumber]) {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoRayonNumberRow, [feature.attributes[FIELDS.cadastreOkrugNumber] + ':' + feature.attributes[FIELDS.cadastreRayonNumber]]);
        }
        if (feature.attributes[FIELDS.cadastreRayonNumber]) {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoOkrugNumberRow, [feature.attributes[FIELDS.cadastreOkrugNumber]]);
        }

        if (feature.attributes[FIELDS.cadastreKvartalNumber]) {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoKvartalPlansRow, [feature.attributes[FIELDS.cadastreNumber]]);
        }
        content += INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoTableFooter;

        if (feature.clickedPoint || feature.point) {
            //content += INFO_WINDOW_CONTENT_TEMPLATE.tabFooter;
            //End "CadastreMapInfoo"
            //Start "Zone"
            //content += INFO_WINDOW_CONTENT_TEMPLATE.tabHeader;
            //content += INFO_WINDOW_CONTENT_TEMPLATE.cadastreZoneListHeader;

            //content += INFO_WINDOW_CONTENT_TEMPLATE.zoneWaitListItem;

            //content += INFO_WINDOW_CONTENT_TEMPLATE.zoneListFooter;
            //content += INFO_WINDOW_CONTENT_TEMPLATE.tabFooter;

            searchZone((feature.clickedPoint) ? (feature.clickedPoint) : (feature.point));
            //End "Zone"
        }
        else {
            content += INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoTableContainerFooter;
        }

        return content;
    };

    function buildParcelInfoWindowContent(feature) {
        var content = '';

        content += INFO_WINDOW_CONTENT_TEMPLATE.mapInfoContainerHeader;

        if (feature.attributes[FIELDS.geometryError]) {
            content += INFO_WINDOW_CONTENT_TEMPLATE.mapInfoEmptyMessage;
        }

        content += INFO_WINDOW_CONTENT_TEMPLATE.mapInfoTableHeader;
        content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoStateRow,
            [(feature.attributes[FIELDS.stateCode] == ' ') ? (NO_DATA) : (PARCEL_STATES[feature.attributes[FIELDS.stateCode] - 1])]);

        content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.mapInfoAddressRow,
            [(feature.attributes[FIELDS.address] == ' ') ? (NO_DATA) : (feature.attributes[FIELDS.address])]);

        if (feature.attributes[FIELDS.area] && feature.attributes[FIELDS.area] != ' ') {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoAreaRow,
                [AREA_TYPES[feature.attributes[FIELDS.areaType]],
                    numberFormat(feature.attributes[FIELDS.area], { thousands_sep: " " }),
                    (feature.attributes[FIELDS.areaUnit]) ? (UNITS[feature.attributes[FIELDS.areaUnit]]) : ('')]);
        } else {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoAreaRow, ['Площадь', NO_DATA, '']);
        }

        if (feature.attributes[FIELDS.cadastrePrice] && feature.attributes[FIELDS.cadastrePrice] != ' ' &&
            feature.attributes[FIELDS.cadastrePriceUnit] && feature.attributes[FIELDS.cadastrePriceUnit] != ' ') {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoCadastrePriceRow,
                [numberFormat(feature.attributes[FIELDS.cadastrePrice], { thousands_sep: " " }), UNITS[feature.attributes[FIELDS.cadastrePriceUnit]]]);
        }
        else {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoCadastrePriceRow, [NO_DATA, '']);
        }

        if (feature.attributes[FIELDS.formRights] && feature.attributes[FIELDS.formRights] != ' ') {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoOwnership, [FORM_RIGHTS[feature.attributes[FIELDS.formRights]]]);
        } else {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoOwnership, [NO_DATA]);
        }

        if (feature.attributes["DATE_CREATE"] != ' ' && feature.attributes["DATE_CREATE"] > 0) {
            var d = new Date(feature.attributes["DATE_CREATE"]);
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoDateRow, [formatDate(d.getDate(), d.getMonth() + 1, d.getFullYear())]);
        }
        else {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoDateRow, [NO_DATA]);
        }

        if (feature.attributes[FIELDS.cadastreEngineerSecondName] != ' ') {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoCadastreEngineerRow,
                [feature.attributes[FIELDS.cadastreEngineerSecondName], feature.attributes[FIELDS.cadastreEngineerFirstName],
                    feature.attributes[FIELDS.cadastreEngineerThirdName]]);
        }
        else {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoCadastreEngineerRow, [NO_DATA, '', '']);
        }

        var cadNumber = getFullCadastreNumber(feature.attributes['PARCEL_CN']);

        content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.mapInfoCadastreKvartalRow, [cadNumber.kvartalNumber]);
        content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.mapInfoCadastreRayonRow, [cadNumber.rayonNumber]);
        content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.mapInfoCadastreOkrugRow, [cadNumber.okrugNumber]);

        if (feature.attributes["ONLINE_ACTUAL_DATE"] != ' ' && feature.attributes["ONLINE_ACTUAL_DATE"] > 0) {
            var d = new Date(feature.attributes["ONLINE_ACTUAL_DATE"]);
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoParcelAttrActualDateRow, [formatDate(d.getDate(), d.getMonth() + 1, d.getFullYear())]);
        }
        else {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoParcelAttrActualDateRow, [NO_DATA]);
        }

        if (feature.attributes["ACTUAL_DATE"] != ' ' && feature.attributes["ACTUAL_DATE"] > 0) {
            var d = new Date(feature.attributes["ACTUAL_DATE"]);
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoParcelBorderActualDateRow, [formatDate(d.getDate(), d.getMonth() + 1, d.getFullYear())]);
        }
        else {
            content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoParcelBorderActualDateRow, [NO_DATA]);
        }

        //if (!feature.attributes[FIELDS.geometryError]) {
        //    content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.cadastreMapInfoPlansRow, [feature.attributes['PARCEL_CN']]);
        //}
        //End "MapInfo"

        //Start "Info"
        content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoCategory,
            [(feature.attributes[FIELDS.category] == ' ') ? (NO_DATA) : (CATEGORY_TYPES[feature.attributes[FIELDS.category]])]);

        content += INFO_WINDOW_CONTENT_TEMPLATE.infoUtilizationRow;

        content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoUtilizationVRIZCodeRow,
            [(feature.attributes[FIELDS.utilizationCode] == ' ') ? (NO_DATA) : (feature.attributes[FIELDS.utilizationCode])]);

        //if(UTILIZATIONS[feature.attributes[FIELDS.utilizationCode]]) {
        content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoUtilizationVRIZRow,
            [(!feature.attributes[FIELDS.utilizationCode] || feature.attributes[FIELDS.utilizationCode] == ' ') ?
                (NO_DATA) : (UTILIZATIONS[feature.attributes[FIELDS.utilizationCode]])]);
        //}

        content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.infoUtilizationDocRow,
            [(!feature.attributes[FIELDS.utilizationDoc] || feature.attributes[FIELDS.utilizationDoc] == ' ') ?
                (NO_DATA) : (feature.attributes[FIELDS.utilizationDoc])]);

        //End "Info"

        //Start "Zone"
        //content += INFO_WINDOW_CONTENT_TEMPLATE.zoneWaitListItem;
        //searchZone((feature.clickedPoint) ? (feature.clickedPoint) : (feature.point));
        //End "Zone"

        ////Start "Link"
        ////ссылки на получение кадастровых данных
        //content += INFO_WINDOW_CONTENT_TEMPLATE.linkListHeader;
        //for (var linkItem in INFO_WINDOW_CONTENT_TEMPLATE.linkListItems) {
        //    content += substitute(INFO_WINDOW_CONTENT_TEMPLATE.linkListItems[linkItem], [feature.attributes["PARCEL_CN"], KINDS[-1]]);
        //}
        //content += INFO_WINDOW_CONTENT_TEMPLATE.linkListFooter;
        ////End "Link"

        content += INFO_WINDOW_CONTENT_TEMPLATE.mapInfoTableFooter;
        content += INFO_WINDOW_CONTENT_TEMPLATE.mapInfoContainerFooter;

        return content;
    };

    function buildOksInfoWindowContent(feature) {
        return "Если вы увидели это сообщение, пожалуйста обратитесь в службу поддержки космоснимков, предварительно сделайте снимок карты, и запишите кадастровый номер.";
    };


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

    function getCadastreObjectType(feature) {
        var objectType;
        if (typeof feature.attributes["Тип ОКС"] !== "undefined") {
            objectType = CadastreTypes.oks;
        }
        else if (feature.value.split(':').length == 4) {
            objectType = CadastreTypes.parcel;
        }
        else {
            objectType = getCadastreObjectTypeById(feature.value);
        }
        return objectType;
    };

    function getCadastreObjectTypeById(id) {
        switch (id.length) {
            case 2:
                return CadastreTypes.okrug;
            case 4:
                return CadastreTypes.rayon;
            case 11:
                return CadastreTypes.kvartal;
            case 16:
            case 18:
                return CadastreTypes.parcel;
            case 21:
                return CadastreTypes.oks;
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
    };

    function getFullCadastreNumber(number) {
        var numberParts = number.split(":");

        number = '';

        var cadNumber = {};

        if (numberParts.length >= 1)
            cadNumber.okrugNumber = numberParts[0];
        if (numberParts.length >= 2)
            cadNumber.rayonNumber = cadNumber.okrugNumber + ":" + numberParts[1];
        if (numberParts.length >= 3)
            cadNumber.kvartalNumber = cadNumber.rayonNumber + ":" + numberParts[2];

        return cadNumber;
    };

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

    function getPolygon_merc2wgs(geometry) {
        var poly = [];
        geometry.forEach(function (value) {
            poly.push([from_merc_x(value[0] - parseFloat(dx).toFixed(2) * (-1)),
                from_merc_y(value[1] - parseFloat(dy).toFixed(2) * (-1))]);
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
    var mapListenerInfo, mapListenerInfoRight, cadastreLayerListener, cadastreLayerSearchListener; // Listener для идентификации кадастрового участка на карте
    var balloonInfo, balloonSearch; // balloon для идентификации и поиска кадастрового участка на карте
    var geometry;// геометрия выделенного участка
    var cadastreLayerInfo, cadastreLayerSearch, cadastreLayer, cadastreLayerRight;
    var cadastreServer;
    var cadastreServerThematic;
    var dialog, inputCadNum;
    var geometryRequest = null;
    var checkCadastre;
    var gParams = null;
    var infoClickSelected = false;

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

    var POLE = 20037508.34;

    function clamp_lon(lon) {
        return ShowExt.norm_lon(lon, ShowExt.getWorldByLon(lon).min);
    };

    function clamp_lat(lat) {
        if (lat < -90.0)
            return 180.0 + lat;

        if (lat > 90.0)
            return -180.0 + lat;

        return lat;
    };

    function merc_x(lon) {
        return lon * POLE / 180;
    };

    function merc_y(lat) {
        return Math.log(Math.tan((90 + lat) * Math.PI / 360)) / Math.PI * POLE;
    };

    function from_merc_x(x) {
        return 180 * x / POLE;
    };

    function from_merc_y(y) {
        return 180 / Math.PI * (2 * Math.atan(Math.exp((y / POLE) * Math.PI)) - Math.PI / 2);
    };

    function getObjectIdField(objectType) {
        switch (objectType) {
            case CadastreTypes.okrug:
                return FIELDS.cadastreOkrugId;
            case CadastreTypes.rayon:
                return FIELDS.cadastreRayonId;
            case CadastreTypes.kvartal:
                return FIELDS.cadastreKvartalId;
            case CadastreTypes.parcel:
                return FIELDS.parcelId;
            case CadastreTypes.oks:
                return FIELDS.oksId;
            case CadastreTypes.subject:
                return FIELDS.subjectId;
            case CadastreTypes.mo1Level:
                return FIELDS.mo1LevelId;
            case CadastreTypes.mo2Level:
                return FIELDS.mo2LevelId;
            case CadastreTypes.settlement:
                return FIELDS.settlementId;
        }
    };

    //заменяет все вхождения подстроки в строке
    function replaceAll(src, str1, str2, ignore) {
        return src.replace(new RegExp(str1.replace(/([\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, function (c) { return "\\" + c; }), "g" + (ignore ? "i" : "")), str2);
    };

    function showResultList(objectType, features, forPrint) {
        if (objectType == CadastreTypes.okrug ||
            objectType == CadastreTypes.rayon ||
            objectType == CadastreTypes.kvartal ||
            objectType == CadastreTypes.parcel ||
            objectType == CadastreTypes.oks) {
            features.sort(function (item1, item2) {
                if (!item1.attributes[FIELDS.cadastreNumber])
                    item1.attributes[FIELDS.cadastreNumber] = "";
                if (!item2.attributes[FIELDS.cadastreNumber])
                    item2.attributes[FIELDS.cadastreNumber] = "";

                var val1 = item1.attributes[FIELDS.cadastreNumber].split(":");
                var val2 = item2.attributes[FIELDS.cadastreNumber].split(":");

                for (var i = 0, l = val1.length; i < l; i++) {
                    var n1 = parseInt(val1[i], 10);
                    var n2 = parseInt(val2[i], 10);

                    if (n1 > n2) {
                        return 1;
                    }
                    else if (n1 < n2) {
                        return -1;
                    }
                }

                return 0;
                //if (val1 == val2)
                //    return 0;
                //if (val1 > val2)
                //    return 1;
                //if (val1 < val2)
                //    return -1;
            });
        }
        else if (objectType == CadastreTypes.subject ||
            objectType == CadastreTypes.mo1Level ||
            objectType == CadastreTypes.mo2Level ||
            objectType == CadastreTypes.settlement) {
            features.sort(function (item1, item2) {
                if (!item1.attributes[FIELDS.name])
                    item1.attributes[FIELDS.name] = "";
                if (!item2.attributes[FIELDS.name])
                    item2.attributes[FIELDS.name] = "";

                var val1 = item1.attributes[FIELDS.name];
                var val2 = item2.attributes[FIELDS.name];

                if (val1 == val2)
                    return 0;
                if (val1 > val2)
                    return 1;
                if (val1 < val2)
                    return -1;
            });
        }

        //if (!forPrint) {
        //    if (features.length == 1000)
        //        dojo.byId('resultItemLabel').innerHTML = 'Найдено <strong>более 1000 ' + calulateObjectName(objectType, features.length) + '.</strong>';
        //    else {
        //        var l = (features.length % 10 == 1 && features.length % 100 != 11) ? ("") : ("о");
        //        dojo.byId('resultItemLabel').innerHTML = "Найден" + l + " <strong>" + features.length + " " + calulateObjectName(objectType, features.length) + "</strong>";
        //    }
        //}

        //var resultListInnerHtml = '';
        var errorSymbol = '';
        var hesGeometryError = false;
        var tempObjectType = objectType;
        for (var i = 0; i < features.length; i++) {
            features[i].attributes.ItemNumber = i + 1;

            if (features[i].attributes[FIELDS.geometryError]) {
                hesGeometryError = true;
                errorSymbol = ' *';
            }
            else {
                errorSymbol = '';
                //	addSearchedObject(features[i], PIN_SYMBOL.searched);
            }

            for (var attr in features[i].attributes) {
                if (features[i].attributes[attr] == "Null" || typeof (features[i].attributes[attr]) === 'undefined' || features[i].attributes[attr] == null)
                    features[i].attributes[attr] = " ";
            }

            features[i].attributes.ErrorSymbol = errorSymbol;

            if (features[i].attributes["OKS_FLAG"] === 1) {
                tempObjectType = CadastreTypes.oks;
            }

            //if (!forPrint) {
            //    if (!features[i].attributes[FIELDS.address])
            //        features[i].attributes[FIELDS.address] = "";
            //    if (tempObjectType == PortalObjectTypes.addressLocator) {
            //        resultListInnerHtml += locatorResultItemBuilder(features[i].attributes);
            //    }
            //    else
            //        resultListInnerHtml += substitute(getResultItemhtmlTemplate(tempObjectType), features[i].attributes);
            //}

            //tempObjectType = objectType;
        }

        //if (!forPrint) {
        //    if (hesGeometryError) {
        //        dojo.byId('resultItemLabel').innerHTML += '<br/><small>*Объекты без описания границ</small>'
        //        dojo.byId('resultItemLabel').style.marginTop = '0px';
        //    }
        //    else {
        //        dojo.byId('resultItemLabel').style.marginTop = '8px';
        //    }
        //}


        //_searchResultObjects = features;
        //_searchResultObjectsType = objectType;

        //if (!forPrint) {
        //    if (dojo.hasClass("searchExPanel", "searchExPanelOpenState")) {
        //        searchExClick();
        //    }
        //    dojo.byId('resultList').innerHTML = resultListInnerHtml;
        //    dojo.byId('emptyResultPanel').style.display = 'none';
        //    dojo.byId('resultListPanel').style.display = '';
        //    dojo.byId('bookmarksAllButton').style.display = '';
        //}
    };

    var spatial102100 = { "latestWkid": "3857", "wkid": "102100" };

    var esriPoint = function (x, y, spatialReference) {
        this.spatialReference = spatialReference;
        this.type = "point";
        this.x = x;
        this.y = y;
    };

    function addPointAttribute(features) {
        for (var i in features) {
            if (features[i].attributes[FIELDS.addressId]) {
                features[i].point = new esriPoint(features[i].attributes[FIELDS.xCoord], features[i].attributes[FIELDS.yCoord], spatial102100);
            }
            else
                /*if (features[i].geometry) {
                    features[i].point = new esri.geometry.Point(features[i].geometry.x, features[i].geometry.y, features[i].geometry.spatialReference);
                }
                else*/
                if (features[i].location) {
                    features[i].point = new esriPoint(features[i].location.x, features[i].location.y, features[i].location.spatialReference);
                    var value = LOCATOR_VALUES[features[i].attributes[FIELDS.locatorField]];
                    features[i].attributes[FIELDS.locatorIntField] = value;
                    //features[i].attributes[FIELDS.sortField] = 10 * value + getSettlementStatus(features[i].attributes[FIELDS.usrField]);

                    //features[i].attributes[FIELDS.sortField] = dojo.string.pad(features[i].attributes[FIELDS.sortField],5,'0');
                    //features[i].attributes[FIELDS.sortField]+=('_'+features[i].attributes[FIELDS.parentName]);
                    //features[i].attributes[FIELDS.sortField]+=('_'+features[i].attributes[FIELDS.address]);
                    //features[i].attributes[FIELDS.locatorNameField] = LOCATOR_NAMES[value];					
                } else if (features[i].attributes.XC && features[i].attributes.YC) {
                    features[i].point = new esriPoint(features[i].attributes.XC, features[i].attributes.YC, spatial102100);
                } else if (features[i].attributes.XMIN && features[i].attributes.YMIN) {
                    features[i].point = new esriPoint((features[i].attributes.XMAX + features[i].attributes.XMIN) / 2, (features[i].attributes.YMAX + features[i].attributes.YMIN) / 2, spatial102100);
                }
        }
    };

    function showInfoWindow(objectType, featureSet) {
        $("#loader").hide();
        $("#alert").hide();
        balloonInfo.setVisible(true);
        balloonInfo.visible = true;

        var html = "<div style='width: 370px; max-height: 230px; min-height: 150px; overflow-x: auto; overflow-y: auto;'>";

        var title = '<div class="cadastreTitle">' + buildInfoWindowTitle(objectType, featureSet.features[0]) + '</div>';

        addCadastreNumbers(featureSet.features[0].attributes);
        addPointAttribute(featureSet.features);
        showResultList(objectType, featureSet.features);
        var content = buildInfoWindowContent(objectType, featureSet.features[0]);
        var dwnld = '<div class="getGeom" >Получить геометрию</div>';

        balloonInfo.div.innerHTML = title + content + dwnld;

        var world = ShowExt.getWorldByLon(balloonInfo.getX());
        showGeometry(geometry, world, balloonInfo.getX());

        var fileName = replaceAll(featureSet.features[0].attributes[FIELDS.cadastreNumber], ":", "_");

        $(".getGeom").click(function () {
            var result = JSON.stringify([{
                "properties": { "isVisible": true, "text": "" },
                "geometry": geometry
            }]);
            sendCrossDomainPostRequest(serverBase + "Shapefile.ashx", {
                name: fileName,
                format: "Shape",
                points: '',
                lines: '',
                polygons: result
            });
        });
    };

    function searchParcelObject(objectType, query) {
        query.f = "json";
        query.returnGeometry = false;

        $.ajax(objectType.layerUrl, {
            crossDomain: true,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            async: false,
            dataType: "jsonp",
            jsonpCallback: 'fnsuccesscallback',
            data: query
        }).done(function (featureSet) {
            showInfoWindow(objectType, featureSet);
        }).fail(function () {
            $('#loader').hide();
            $("#alert").show();
        });
    };

    function searchObject(objectType, whereClause) {
        $.ajax(objectType.layerUrl + "/query", {
            crossDomain: true,
            type: "GET",
            contentType: "application/json; charset=utf-8",
            async: false,
            dataType: "jsonp",
            jsonpCallback: 'fnsuccesscallback',
            data: {
                outFields: '*',
                where: whereClause,
                f: 'json',
                returnGeometry: 'false',
                geometryType: 'esriGeometryPoint',
                spatialRel: 'esriSpatialRelIntersects'
            }
        }).done(function (featureSet) {
            showInfoWindow(objectType, featureSet);
        }).fail(function () {
            $('#loader').hide();
            $("#alert").show();
        });
    };

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
        balloonInfo.setVisible(false);
        var geoX = merc_x(clamp_lon(mousePosX));
        var geoY = merc_y(clamp_lat(mousePosY));

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
                geometry: '{"x":' + geoX + ',"y":' + geoY + ',"spatialReference":{"wkid":102100}}',
                tolerance: '0',
                returnGeometry: 'true',
                mapExtent: '{"xmin":' + (merc_x(extent.minX) - parseFloat(dx).toFixed(2)) + ',"ymin":' + (merc_y(extent.minY) - parseFloat(dy).toFixed(2)) + ',"xmax":' + (merc_x(extent.maxX) - parseFloat(dx).toFixed(2)) + ',"ymax":' + (merc_y(extent.maxY) - parseFloat(dy).toFixed(2)) + ',"spatialReference":{"wkid":102100}}',
                imageDisplay: map.width() + ',' + getHeight() + ',96',
                geometryType: 'esriGeometryPoint',
                sr: '102100',
                layers: layerId || 'top' //top or all or layerId
            }
        }).done(function (data) {
            if (!($.isEmptyObject(data)) && data.results && data.results.length > 0) {

                var featureSet = data.results;

                var objectType = getCadastreObjectType(featureSet[0]);

                var whereClause = '';
                var cadNumbers = '';
                for (var i = 0; i < featureSet.length; i++) {
                    whereClause += ",'" + featureSet[i].value + "'";
                    cadNumbers += ",'" + featureSet[i].attributes[objectType == CadastreTypes.oks ? 'Кадастровый номер' : 'Строковый идентификатор ИПГУ'] + "'";
                }

                if (objectType == CadastreTypes.parcel || objectType == CadastreTypes.oks) {
                    searchParcelObject(objectType, { cadNums: "[" + cadNumbers.substring(1) + "]", onlyAttributes: false });
                }
                else {
                    searchObject(objectType, getObjectIdField(objectType) + " IN (" + whereClause.substring(1) + ")");
                }

                geometry = getGeometry_merc2wgs(featureSet[0].geometry.rings);

            } else {
                $("#loader").hide();
                $("#alert").show();
            }
        }).fail(function () {
            $('#loader').hide();
            $("#alert").show();
        });

        balloonInfo.resize();
        balloonInfo.addListener('onClose', function (obj) {
            cadastreLayerInfo.setVisible(false);
        });
    }

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

        value = value.trim();

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
                        returnGeometry: 'false',
                        f: 'json'
                    }
                }).done(function (data) {
                    $('#loader').hide();

                    if (data.features.length == 0) {
                        alert("Не найдено.");
                        return;
                    }

                    var x = converting(data.features[0].attributes.XC, "x"),
                        y = converting(data.features[0].attributes.YC, "y"),
                        maxX = converting(data.features[0].attributes.XMAX, "x"),
                        minX = converting(data.features[0].attributes.XMIN, "x"),
                        maxY = converting(data.features[0].attributes.YMAX, "y"),
                        minY = converting(data.features[0].attributes.YMIN, "y");

                    map.zoomToExtent(minX, minY, maxX, maxY);
                    createBalloonInfo(x, y, { minX: minX, minY: minY, maxX: maxX, maxY: maxY }, "");

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

                    if (data.features.length == 0) {
                        alert("Не найдено.");
                        return;
                    }

                    geometry = getGeometry(data.features[0].geometry.rings);

                    var findInfo = data.features[0].attributes;

                    var x = converting(data.features[0].attributes.XC, "x"),
                        y = converting(data.features[0].attributes.YC, "y"),
                        maxX = converting(data.features[0].attributes.XMAX, "x"),
                        minX = converting(data.features[0].attributes.XMIN, "x"),
                        maxY = converting(data.features[0].attributes.YMAX, "y"),
                        minY = converting(data.features[0].attributes.YMIN, "y");

                    if (minX < 0) {
                        minX += 360;
                        maxX += 360;
                    }
                    map.zoomToExtent(minX, minY, maxX, maxY);

                    var html = "<div style='width:300px; height:300px; overflow-x: hidden; overflow-y: scroll;'>";
                    balloonInfo = map.addBalloon();
                    balloonInfo.setPoint((x < 0 ? x + 360 : x), y);
                    balloonInfo.setVisible(false);

                    showInfoWindow(cadType, data);

                    balloonInfo.addListener('onClose', function (obj) {
                        cadastreLayerInfo.setVisible(false);
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

    var getGeometry_merc2wgs = function (arcgisGeometry) {
        var geom;
        var geo = [];
        if (arcgisGeometry.length > 1) {
            for (var i = 0; i < arcgisGeometry.length; i++) {
                geo.push(getPolygon_merc2wgs(arcgisGeometry[i]));
            }
            geom = {
                "type": "MULTIPOLYGON",
                "coordinates": [geo]
            };
        } else {
            geom = {
                "type": "POLYGON",
                "coordinates": [getPolygon_merc2wgs(arcgisGeometry[0])]
            };
        }
        return geom;
    };

    var showGeometry = function (geom, world, centerX) {
        cadastreLayerInfo = gmxAPI.map.addObject();

        var coords = geom.coordinates;

        if (geom.type == "MULTIPOLYGON") {
            for (var i = 0; i < coords.length; i++) {
                var p = coords[i];
                for (var j = 0; j < p.length; j++) {
                    var c = p[j];
                    for (var k = 0; k < c.length; k++) {

                        var x;
                        if (Math.abs(centerX - world.min) > Math.abs(world.max - centerX))
                            x = world.max;
                        else
                            x = world.min;

                        if (c[k][0] < 0) {
                            c[k][0] += x + 180;
                        } else
                            c[k][0] += x - 180;
                    }

                }
            }

        } else if (geom.type == "POLYGON") {
            for (var i = 0; i < coords.length; i++) {
                var c = coords[i];
                for (var j = 0; j < c.length; j++) {

                    var x;
                    if (Math.abs(centerX - world.min) > Math.abs(world.max - centerX))
                        x = world.max;
                    else
                        x = world.min;

                    if (c[j][0] < 0) {
                        c[j][0] += x + 180;
                    } else
                        c[j][0] += x - 180;
                }
            }
        }

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

            if (cbDivision.checked) {
                $("#loader").show();

                cadastreShowExt.remove();
                cadastreShowExt.initialize();
                if (infoClickSelected)
                    cadastreShowExt.addListener("onClick", function (e) { onCadastreLayerClick(); });

                var cadastreUrlTemplate = "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer/export?dpi=96&transparent=true&format=png32&bbox={minX}%2C{minY}%2C{maxX}%2C{maxY}&size={width},{height}&bboxSR=4326&imageSR=102100&f=image";
                cadastreShowExt.showScreenExtent(cadastreUrlTemplate, function () {
                    $("#loader").hide();
                });

                cadastreShowExt.setCopyright('<a href="http://rosreestr.ru">© Росреестр</a>');

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
                if (mapListenerInfoRight)
                    map.removeListener("onClick", mapListenerInfoRight);
                if (cadastreLayerListener)
                    map.removeListener("onMoveEnd", cadastreLayerListener);
                if (balloonSearch)
                    balloonSearch.remove();
                if (cadastreLayerSearch)
                    cadastreLayerSearch.setVisible(false);

                cadastreShowExt.setVisibility(false);
            }

            var tUrl = cadastreServerThematic + "Cadastre/Thematic/MapServer/export?dpi=96&transparent=true&format=png32";;

            var thmtChecked = false;
            if (rbCostLayer.checked) {
                tUrl += "&layers=show:1,7";
                $("#loader").show();
                cadastreLegend.innerHTML = 'Кадастровая стоимость</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9fUA9usA9+EAPCcsfQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>до 3 млн руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9bgA9rEA96kAxLzpJgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>3 - 15 млн. руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9XsA9ngA93UA+R2pSwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>15 - 30 млн. руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9T0A9kAA90IAF7kxUgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>30 - 100 млн.руб.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9QAA9hIA9yQAeAUndAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>свыше 100 млн. руб.</span></td></tr></tbody></table';
                thmtChecked = true;
            } else if (rbCostByAreaLayer.checked) {
                tUrl += "&layers=show:0,6";
                $("#loader").show();
                cadastreLegend.innerHTML = 'Кадастровая стоимость ЗУ за кв. м</br><table cellspacing="0" cellpadding="0" style="width: 203px;"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9fUA9usA9+EAPCcsfQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><table width="95%"><tbody><tr><td align="">до 100 руб за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9bgA9rEA96kAxLzpJgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><table width="95%"><tbody><tr><td align="">от 101 до 1000 руб. за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9XsA9ngA93UA+R2pSwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><table width="95%"><tbody><tr><td align="">от 1001 до 5000 руб. за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9T0A9kAA90IAF7kxUgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><table width="95%"><tbody><tr><td align="">от 5001 до 50000 руб. за кв. м</td></tr></tbody></table></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY9QAA9hIA9yQAeAUndAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><table width="95%"><tbody><tr><td align="">более 500000 руб. за кв. м</td></tr></tbody></table></td></tr></tbody></table>';
                thmtChecked = true;

            } else if (rbUseType.checked) {
                tUrl += "&layers=show:2,4";
                $("#loader").show();
                cadastreLegend.innerHTML = 'Разрешенные виды использования ЗУ</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/wAA/xIA/yQAxDetmgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли с более чем одним видом использования</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/9if/+Kn/+ywWIVZzQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли жилой застройки</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/8Jy/8t6/9N/nGNq1QAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли под жилыми домами многоэтажной и повышенной этажности застройки</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/50A/6MA/6kA0zjLGAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли под домами индивидуальной жилой застройкой</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY5pkA6ZMA7I4A5xrHhAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Незанятые земли, отведенные под жилую застройку</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+ms//S1//++G44kQgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли общественно-деловой застройки</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+ln//Ru//90X3D6BQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли гаражей и автостоянок</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+kA//QA//8AnfC9ewAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли под объектами торговли, общественного питания, бытового обслуживания, автозаправочными и газонаполнительными станциями, предприятиями автосервиса</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY5uYA6d0A7NMAeryBiQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли учреждений и организаций народного образования, земли под объектами здравоохранения и социального обеспечения физической культуры и спорта, культуры и искусства, религиозными объектами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYqKgAtKIAvZwAgfbyuQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под административно-управленческими и общественными объектами, земли предприятий, организаций, учреждений финансирования, кредитования, страхования и пенсионного обеспечения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYdHQAinEAnW4AzJWFTAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под зданиями (строениями) рекреации</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY5pkA6ZMA7I4A5xrHhAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под объектами промышленности</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYqG8AtGwAvWoA5VasFgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли общего пользования (геонимы в поселениях)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY4eHh5NjX58/MBsJpUwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под объектами транспорта, связи, инженерных коммуникаций</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYzc3N0sXD2Ly5WqFGdQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Под объектами железнодорожного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYs7OzvKyqxaWhGy20FAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Под объектами автомобильного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYnZ2dqpiWtpKN7dt9hwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Под объектами морского, внутреннего водного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYgoKClX98pnt2xUDwLQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Под объектами воздушного транспорта</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYZ2dngmZjl2RdEF9uXAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Под объектами иного транспорта, связи, инженерных коммуникаций</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY0/++2fS13emsMMNQhAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли сельскохозяйственного использования</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYo/90sPRuu+lnNk+fNAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под крестьянскими (фермерскими) хозяйствами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYVf8AdvQAjukAJrp/BQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под предприятиями, занимающимися сельскохозяйственным производством</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYTeYAcd0AitMAoSK+BAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под садоводческими объединениями и индивидуальными садоводами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYN6gAZqIAhJwA4JYcbQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под огородническими объединениями и индивидуальными огородниками</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYJHQAYHEAf24Ao374EAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под дачными объединениями</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYtdefvs6XxsWPI51NXAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под личными подсобными хозяйствами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYpfV7set1u+FuPSy7WwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под служебными наделами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYiM5mmsZhqb1bRGITZwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли оленьих пастбищ</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYW4hFeoVCkYA9J56HwAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Для других сельскохозяйственных целей</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYTXQAcXEAim4AKDuv6gAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под лесами в поселениях (в том числе городскими лесами), под древесно-кустарниковой растительностью, не входящей в лесной фонд (в том числе лесопарками, парками, скверами, бульварами)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYAMX/WL3ze7Xn/71NNgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли, занятые водными объектами, земли водоохранных зон водных объектов, а также земли, выделяемые для установления полос отвода и зон охраны водозаборов, гидротехнических сооружений и иных водохозяйственных сооружений, объектов.</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAAC1QTFRF/v///vTz2dra5tva2c3L/sO7/rSqlJSUqJaU/6KUlH58lF9Y/3ZYAAAAeyQA0xTD0AAAAA90Uk5TAP//////////////////5Y2epgAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHdJREFUKJGd0ksOgCAQA9DhIyAi9z+uiTYyZVjRVZMXFg0jspmjLZJealdwX2pBib19FPA8ZxR/R5Az4h2RFiEiIWLRNImiWQYZ+akakQIqRnLlyUoyT9bCk0mIWDRNomiWQUZ+ikYkgHrEv5eKEnAAaXU2p2zmAUZoBsjYet62AAAAAElFTkSuQmCC"></td><td><span>Земли, не вовлеченные в градостроительную или иную деятельность (земли &ndash; резерв)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYlUu6pE2ysU2ogM8VNAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под военными и иными режимными объектами</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZYx00zzk0w008r5GEnuAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли под объектами иного специального назначения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+nn//Tz////4iZzJgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Неопределено</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v///sO7/rSq/6KU/3ZY/+nn//Tz////4iZzJgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Значение отсутствует</span></td></tr></tbody></table>';
                thmtChecked = true;

            } else if (rbCategory.checked) {
                tUrl += "&layers=show:3,5";
                $("#loader").show();
                cadastreLegend.innerHTML = 'Категории земель ЗУ</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYAG//TWzza2rnJL3s7wAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли водного фонда</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYtGokuWkkvWYfu6YNWgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли запаса</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYVf8AbvQAgekA3+ZdMgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли лесного фонда</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYJHQAVnEAcW4AZkbUVgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли особо охраняемых территорий и объектов</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZY+Z0A/KMA/6kAOzMlwAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли поселений (земли населенных пунктов)</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYdE0AhU0Akk8AWdadagAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Земли промышленности, энергетики, транспорта, связи, радиовещания, телевидения, информатики, земли для обеспечения космической деятельности, земли обороны, безопасности и земли иного специального назначения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZY6Oms6PS16f++yNID5wAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>Земли сельскохозяйственного назначения</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//8MO77bSq6qKU5HZYs7OzuKyqvaWhx9sqFgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>Категория не установлена</span></td></tr></tbody></table>';
                thmtChecked = true;

            } else if (rbMapUpdate.checked) {
                tUrl += "&layers=show:8";
                $("#loader").show();
                cadastreLegend.innerHTML = 'Актуальность сведений</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWFN6gAQKMfR58wW5lrlgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFnY2DMDOApFiY8UAbKNSw00KdwJgwpZsmMlNhADmvglpoglhjgAAAABJRU5ErkJggg=="></td><td><span>менее 1 недели</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWFh8IwiMofi9EAQ7oGzAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>1 - 2 недели</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWFv9wwxuUfzu4A5y7xwQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>2 недели - 1 месяц</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF674w9cYf/80AxdGebAAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>1 - 3 месяца</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF63ww9X4f/38ACxZRyQAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>3 месяца - 1 год</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF6zAw9R8f/wAAedG9rwAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>более 1 года</span></td></tr></tbody></table>';
                thmtChecked = true;

            } else if (rbMapVisitors.checked) {
                tUrl += "&layers=show:9";
                $("#loader").show();
                cadastreLegend.innerHTML = 'Общее количество посещений</br><table cellspacing="0" cellpadding="0"><tbody><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0"src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF676+9cbG/83No3FH3QAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>менее 100 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF656U9aOZ/6eccAhG3wAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>100 000 - 500 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF6YBu84Ju/YVuMQ3iHgAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>500 000 - 1 000 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF4mNR7GFL9WBHhZwXygAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>1 000 000 - 5 000 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWF10k94EUw6D0k9XeHogAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>5 000 000 - 10 000 000</span></td></tr><tr><td class=cadastreLegendImageColumn><img class=cadastreLegendImage border="0" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAAXNSR0IB2cksfwAAABhQTFRF/v//x8fHubq6qaqqhIWFzDAw1B8f3AAAabp87wAAAAh0Uk5TAP/////////VylQyAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAALklEQVQokWNgIBMwsmABTGApFlY2DMDKApFiY8cAbKNSw00KdwJgwpZsmMlNhABUegvpjanC7gAAAABJRU5ErkJggg=="></td><td><span>более 10 000 000</span></td></tr></tbody></table>';
                thmtChecked = true;
            }

            thematicShowExt.setVisibility(thmtChecked);
            if (thmtChecked) {
                thematicShowExt.remove();
                thematicShowExt.clearImagesCache();
                thematicShowExt.initialize();
                thematicShowExt.showScreenExtent(tUrl + "&bbox={minX}%2C{minY}%2C{maxX}%2C{maxY}&size={width},{height}&bboxSR=4326&imageSR=102100&f=image");
            }

            thematicShowExt.setDepth(950);

            cadastreShowExt.setDepth(1000);
            cadastreShowExt.setVisibility(cbDivision.checked);
        }
        var cbDivision, rbNo, rbCostLayer, rbCostByAreaLayer, rbUseType, rbCategory, rbMapUpdate, rbMapVisitors;
        var thmtLayer, thmtLayerRight;
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
        thmtLayer = this.mapObject.addObject(null, { type: 'Overlay' });
        thmtLayerRight = this.mapObject.addObject(null, { type: 'Overlay' });
        cadastreLayer = this.mapObject.addObject();
        //cadastreLayerRight = this.mapObject.addObject();

        thmtLayer.addListener('onImageLoad', function (e) {
            $("#loader").hide();
            $("#alert").hide();
        });
        thmtLayer.addListener('onImageError', function (e) {
            $("#loader").hide();
            $("#alert").show();
        });

        var iListenerID = -1;

        this.load = function () {
            cadastreShowExt.initialize();
            cadastreShowExt.setVisibility(cbDivision.checked);

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
            if (mapListenerInfoRight)
                cadastreLayerRight.removeListener('onClick', mapListenerInfoRight);
            if (cadastreLayerListener)
                map.removeListener("onMoveEnd", cadastreLayerListener);
            if (iListenerID)
                map.removeListener("onMoveEnd", iListenerID);
            if (cadastreLayerInfo)
                cadastreLayerInfo.remove();

            cadastreShowExt.remove();
            infoClickSelected = false;

            thematicShowExt.remove();

            //if (thmtLayer)
            //    thmtLayer.remove();
            //if (thmtLayerRight)
            //    thmtLayerRight.remove();

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
    };

    function onCadastreLayerClick() {
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
    };

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
                if (cadastreLayerRight)
                    cadastreLayerRight.disableDragging();
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

                cadastreShowExt.addListener("onClick", function (e) { onCadastreLayerClick(); });
                infoClickSelected = true;

            },
            'onCancel': function () {
                infoClickSelected = false;
                gmxAPI._tools.standart.selectTool("move");

                cadastreShowExt.removeListener("onclick");

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
                if (mapListenerInfoRight)
                    gmxAPI.map.removeListener("onClick", mapListenerInfoRight);
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

            cadastreShowExt = new ShowExt();
            thematicShowExt = new ShowExt();
        },

        _onClickCadastreTools: function () {
            var container = null;
            if (gParams.showLeftPanel) {
                var alreadyLoaded = this._cadastreMenu.createWorkCanvas("cadastre", {
                    closeFunc: function () {
                        if (checkCadastre != null) {
                            checkCadastre.unloadCadastre();
                        }
                        gmxAPI._tools.cadastre.setActiveTool(false);
                    },
                    path: ["Кадастровые данные"]
                });
                if (!alreadyLoaded) {
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
        init: function (module, path) {
            return $.when(
                gmxCore.loadScript(path + "showExt.js")
            );
        },
        css: "cadastre.css"
    });

})();
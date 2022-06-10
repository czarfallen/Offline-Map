var db = null;
angular.module('app')
    .run(function ($ionicPlatform, $cordovaSQLite, LEAFLET_MAP_MODULE_DB_CONFIG, tblLeafletMapDatabaseFile) {
        $ionicPlatform.ready(function () {
            if (window.cordova) {
                db = $cordovaSQLite.openDB({name: 'database.db', location: 'default'});
            } else {
                // Ionic serve syntax
                db = window.openDatabase('database.db', '1.0', 'Database', -1);
            }

            //  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|content):|data:image//);

            // Module DB
            angular.forEach(LEAFLET_MAP_MODULE_DB_CONFIG.tables, function (table) {
                var columns = [];

                angular.forEach(table.columns, function (column) {
                    columns.push(column.name + ' ' + column.type);
                });

                // Necessary to update database ONLY WITH DEVELOP PURPOSES

                $cordovaSQLite.execute(db, `DROP TABLE IF EXISTS ${table.name}`);
                console.log(`${table.name} DROPED`);
                let query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
                $cordovaSQLite.execute(db, query).then(function (res){
                }, function (err){
                });
            });

            tblLeafletMapDatabaseFile.get().then(function (response) {
                if (response.length === 0) {
                    angular.forEach(LEAFLET_MAP_MODULE_DB_CONFIG.tblLeafletMapDatabaseFile, function (record) {
                        tblLeafletMapDatabaseFile.add(record);
                    });
                }
            });

            tblLeafletMapDatabaseFile.getStyles().then(function (response) {
                if (response.length === 0) {
                    angular.forEach(LEAFLET_MAP_MODULE_DB_CONFIG.tblLeafletMapGLLayers, function (record) {
                        tblLeafletMapDatabaseFile.addStyle(record);
                    });
                }
            });


        });
    });

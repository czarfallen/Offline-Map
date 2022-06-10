L.TileLayer.MBTilesSqlite = L.TileLayer.extend({
    //db: SQLitePlugin
    mbTilesDB: null,

    initialize: function(url, options, db) {
        console.log("sql plugin: " + db);
        this.mbTilesDB = db;
        L.Util.setOptions(this, options);
    },
    createTile: function (coords, done) {
        var tile = document.createElement('img');

        L.DomEvent.on(tile, 'load', L.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', L.bind(this._tileOnError, this, done, tile));

        if (this.options.crossOrigin) {
            tile.crossOrigin = '';
        }

        tile.alt = '';
        tile.setAttribute('role', 'presentation');

        tile.src = this.getTileUrl(coords,tile);

        return tile;
    },
    getTileUrl: function (tilePoint,tile) {
        var x = tilePoint.x;
        var y = this._globalTileRange.max.y - tilePoint.y;
        var z = tilePoint.z;
        //console.log('Be about to load tile [z, x ,y]' + '[' + z + ',' + x + ',' + y + ']');

        var base64Prefix = 'data:image/gif;base64,';

        this.mbTilesDB.executeSql("SELECT tile_data FROM tiles WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?", [z, x, y], function (res) {
            tile.src = base64Prefix + res.rows.item(0).tile_data;
        }, function (er) {
            console.log('error with executeSql', JSON.stringify(er));
        });
    }
});

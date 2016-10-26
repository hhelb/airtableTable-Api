var Airtable = require('airtable');
var Promise = require('promise');
var json2csv = require('json2csv');
var fs = require('fs');
var csv = require('fast-csv');

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'keyKWYJPOEObWhNt2'
});
var base = Airtable.base('appFAYT9BkT4zn1lA');

var view       = 'Main View';
var places     = "places";
var people     = "people";
var objects    = "objects";
var events     = "events";
var media      = "media";
var types      = "types";
var tags       = "tags";
var categories = "categories";
var themes     = "themes";
var links      = "links";

var tables = [places, people , objects, events , media  , types  , tags , categories, themes  , links];

function getrecords(base, view,nomTable) {
    return new Promise(function(resolve, reject){
        var table = [];
        var links = [];
        base(nomTable).select({
            view: view
        }).eachPage(function page(records, fetchNextPage) { 
            records.forEach(function(record) {
                var tableField = {};
                var tabLinked = {};
                for (var field in record['fields']){
                // /!\ Si les colonnes n'ont pas de valeurs, elles ne vont pas être retournées.
                    if(field.indexOf("linked") == -1){
                        tableField[field] = record.get(field);
                    }
                    else{
                        var nomField = field.slice(7);
                        // un tableau contenant les Ids des données étrangères à la table en cours de traitement
                        /*
                        base(nomTable).find(record.get(field, function(err, record){
                            if(err){console.log(err); return;}
                            tabLinked['id_'+nomField] = record.get('id');
                        }));
                        */
                        tabLinked['id_'+nomTable] = record.get('id');

                }
                }
                table.push(tableField);
                links.push(tabLinked);
                /*
                for(var i = 0;i<column.length; i++){
                    // On fusionne dans un tableau le nom de la colonne avec ses valeurs, pour l'avoir au format JSON plus tard.
                        table[column[i]] = tab[i];
                    console.log(tab[i]);
                }

                for(var i = 0; i<columnLinked.length; i++){
                    links[columnLinked[i]] = tabLinked[i];
                }
                 */
        });
        fetchNextPage();
        // On va faire un callback à la fonction d'écriture une fois que les données ont bien été stockées
        resolve(writeTableToJson(table, links, nomTable));
        reject("nonono");
            console.log(links);
       }, function done(error){
           if (error){console.log(error);}}
       );
    })
}

function writeTableToJson(table,links,nomTable){
    fs.writeFile("./json/"+nomTable+".json", JSON.stringify(table), function(err){
        if(err) return console.log(nomTable + " " + err);
    //    console.log(nomTable+ " ecrit");
    });

    fs.writeFile("./json/"+nomTable+"_link.json", JSON.stringify(links), function(err){
        if(err) return console.log(nomTable + " " + err);
    //    console.log(nomTable+ " linked ecrit");
    }); 
}

function chaining(tables){
    for (var i = 0; i<tables.length; i++){
        getrecords(base, view, tables[i]); // dans la méthode resolve de cette fonction
    }
}
function processField(field){

}
chaining(tables);
/**
 * Created by hasj on 26/10/2016.
 */

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
        var table = [];
        base(nomTable).select({
            view: view
        }).eachPage(function page(records, fetchNextPage) {
                records.forEach(function(record) {
                    var tableField = {};
                    for (var field in record['fields']){
                        tableField[field] = record.get(field);
                    }
                    table.push(tableField);
                });
                fetchNextPage();
                // On va faire un callback à la fonction d'écriture une fois que les données ont bien été stockées
            }, function done(error){
            fromOneToTwoTabs(table, nomTable);
                if (error){console.log(error);}}
        );
}
/*
function writeArrayToJson(table,nomTable){
    fs.writeFile("./json/"+nomTable+".json", JSON.stringify(table), function(err){
        if(err) return console.log(nomTable + " " + err);
        //    console.log(nomTable+ " ecrit");
    });
    fs.writeFile("./json/"+nomTable+"_link.json", JSON.stringify(links), function(err){
        if(err) return console.log(nomTable + " " + err);
        //    console.log(nomTable+ " linked ecrit");
    });
}
*/
function writeArrayToJson(nameTable, nameField, array){
    console.log(JSON.stringify(array));
    fs.writeFile("./json/"+nameTable+"_"+nameField+".json", JSON.stringify(array), function(err){
        if(err) console.log("ERROR "+nameTable+"_"+nameField+".json : "+ err);
    });
}

function fromOneToTwoTabs(table, nomTable){
    var tableFinale = [];
    for(var i = 0; i<table.length; i++){
        var id_table = table[i]['id'];
        var entry = {};
        for (var key in table[i]){
            var linkEntry = {};
            var linkedVariable = table[i][key];
            if(key.indexOf("linked_") !== -1){
                var nomField = key.slice(7);
                findID(nomTable, linkedVariable, id_table,linkEntry, nomField)
                    .then(function() {
                        console.log("Ecriture effectuée");
                    })
            }
            else{
                entry[key] = linkedVariable;
            }
        }
        tableFinale.push(entry);
    }
}

function findID(nameTable, airtableID,id_table, table,nameField){
    return new Promise ( function(resolve, reject){
        var id = "";
        var array = [];
        base(nameTable).find(airtableID, function(err, record){
            if(err){console.log(err); return;}
            id = record.get('id');
            table['id_'+nameTable] = id_table;
            table['id_'+nameField] = id;
            array.push(table);
            resolve(writeArrayToJson(nameTable, nameField, array));
            reject("no table");
        });
    })
}

function chaining(tables){
    for (var i = 0; i<tables.length; i++){
        getrecords(base, view, tables[i]); // dans la méthode resolve de cette fonction
    }
}
chaining(tables);
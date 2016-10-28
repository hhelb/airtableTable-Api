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

chaining(tables);

function chaining(tables){
    for (var i = 0; i<tables.length; i++){
        getrecords(base, view, tables[i]); // dans la méthode resolve de cette fonction
    }
}
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
function fromOneToTwoTabs(table, nameTable){
    var tableFinale = [];
    var array = [];
    for(var i = 0; i<table.length; i++){
        var id_table = table[i]['id'];
        var entry = {};
        for (var key in table[i]){
            var linkEntry = {};
            var linkedVariable = table[i][key];
            if(key.indexOf("linked_") !== -1){
                var nameField = key.slice(7);
                findID(nameTable,linkedVariable,id_table,linkEntry,nameField,array)
                    .then(function() {
                        console.log("ecriture effectuee");
                    })
            }
            else{
                entry[key] = linkedVariable;
            }
        }
        tableFinale.push(entry);
    }
    writeTableArrayToJson(nameTable, tableFinale);
}

function findID(nameTable, airtableID,id_table,jsonTable,nameField,array){
    return new Promise ( function(resolve, reject){
        var id = "";
        base(nameTable).find(airtableID, function(err, record){
            if(err){console.log(err); return;}
            id = record.get('id');
            jsonTable['id_'+nameTable] = id_table;
            jsonTable['id_'+nameField] = id;
            array.push(jsonTable);
            resolve(tableLinkCreator(nameTable, nameField, array));
            //resolve(writeLinkedArrayToJson(nameTable, nameField, array));
            reject("no table");
        });
    })
}

function tableLinkCreator(nameTable, nameField, array){
    var tab = [];
    var k = 0 ;
    var bool = [];
    for (var i = 0; i<array.length; i++){
        bool.push(false);
    }
    while (k<= array.length){
        if(bool[k] == false){
            tab.push(array[k]);
            bool[k] = true;
            for (var i =k+1; i<array.length; i++){
                var tmptab =[];
                var tmparray = [];
                for (var key in tab[0]) {
                    tmptab.push(key);
                }
                for (var keyT in array[i]) { /*erreur, il faut seulement récupérer le deuxième élément*/
                        tmparray.push(keyT);
                }
                if(bool[i] == false && (tmptab[1] == tmparray[1])){
                    tab.push(array[i]);
                    bool[i] = true;
                }
                }
            writeLinkedArrayToJson(nameTable, nameField, tab);

        }
        k +=1;
        tab = [];
    }
}

function writeLinkedArrayToJson(nameTable, nameField, array){
    console.log(JSON.stringify(array));
    var path = "./json/"+nameTable+"_"+nameField+".json";
    fs.writeFile(path, JSON.stringify(array), function(err){
        if(err) console.log("ERROR "+path+" : "+ err);
    });
}

function writeTableArrayToJson(nameTable, array){
    fs.writeFile("./json/"+nameTable+".json", JSON.stringify(array), function(err){
        if(err) console.log("ERROR "+ nameTable+ " : "+ err);
    })
}
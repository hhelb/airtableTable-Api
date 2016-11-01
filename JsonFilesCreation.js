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

// loop over all the tables declared above
function chaining(tables){
    for (var i = 0; i<tables.length; i++){
        getRecords(base, view, tables[i]);
    }
}
// get the records of the current table in the loop from AirtableDB
function getRecords(base, view, nameTable) {
        var table = [];
        base(nameTable).select({
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
            }, function done(error){
            fromOneToTwoTabs(table, nameTable);
                if (error){console.log(error);}}
        );
}
// split the table into two arrays : one with the main fields, the second with the linked fields and their airtable ids:
// [linked_people:"4jkey023nd", linked_tag:"4jkey016pkj", linked_event: "4jkey1818op"]
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
                        console.log("File written");
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
// async call getting our written ids instead of the airtableid and pushing it into an array
function findID(nameTable, airtableID, id_table, jsonTable, nameField, array){
    return new Promise ( function(resolve, reject){
        var id = "";
        base(nameTable).find(airtableID, function(err, record){
            if(err){console.log(err); return;}
            id = record.get('id');
            var nametable = nameTable.slice(0,-1);
            var namefield = nameField.slice(0,-1);
            jsonTable[nameTable.slice(-1) == 's'? nametable+'_id':nameTable+'_id'] = id_table;
            jsonTable[nameField.slice(-1) == 's'? namefield+'_id':nameField+'_id'] = id;
            console.log(namefield);
            console.log(nameField +" "+ nametable);
            array.push(jsonTable);
            resolve(tableLinkCreator(nameTable, nameField, array));
            reject("No table");
        });
    })
}
// transform the array "linked_places" [place_id:1, people_id: 1 , tag_id: 5, event_id:8] into several arrays:
// [place_id:1, people_id:1] ,
// [place_id:1, tag_id:5] ,
// [place_id:1, event_id:8]
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
                for (var keyT in array[i]) {
                        tmparray.push(keyT);
                }
                if(bool[i] == false && (tmptab[1] == tmparray[1])){
                    tab.push(array[i]);
                    console.log(tab);
                    bool[i] = true;
                }
                }
            writeLinkedArrayToJson(nameTable, nameField, tab);
        }
        k +=1;
        tab = [];
    }
}
// write the linked arrays in a json file,
// file is named  "nameTable_nameField" or "nameField_nameTable"
// if one of them already exists do not write
function writeLinkedArrayToJson(nameTable, nameField, array){
    var path = "./json/"+nameTable+"_"+nameField+".json";
        fs.access("./json/"+nameField+"_"+nameTable+".json", fs.F_OK, function(err){
            if(!err){
                console.log("Already exists");
            }
            else{
                fs.writeFile(path, JSON.stringify(array), function(err){
                    if(err) console.log("ERROR "+path+" : "+ err);
                });
            }
        });
}
// write the main tables into json files
function writeTableArrayToJson(nameTable, array){
    fs.writeFile("./json/"+nameTable+".json", JSON.stringify(array), function(err){
        if(err) console.log("ERROR "+ nameTable+ " : "+ err);
    })
}
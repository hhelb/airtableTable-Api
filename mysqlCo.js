var mysql = require('promise-mysql');
var fs = require("fs");
var moment = require('moment');
var connection;

mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password: '',
	database: 'pep'
}).then(function(conn){
	connection = conn;
}).then(function() {
	//array of the path of the Json files
	var myTables = getMainTable();
	//slice the names to get the same names as in mysql
	var names = processNames(myTables);
	//loop to insert the values from the json files
	for (var i = 0; i < names.length; i++) {
        // MAZ de la bdd avant traitement
        connection.query("SET FOREIGN_KEY_CHECKS=0");
        connection.query("DELETE FROM " + names[i]);
        var tabJsonData = require(myTables[i]);
        for (var k = 0; k< tabJsonData.length; k++) {
            var jsonData = tabJsonData[k];
            var columns = [];
            var values = [];
            var str = "";
            for (var key in jsonData) {
                if (key == "presentations" && jsonData.presentations !== undefined && jsonData.presentations.indexOf('"') > -1) {
                    var res = jsonData.presentations.replace(/["']/g, "'");
                    jsonData.presentations = res;
                    console.log(res);
                }
                if (jsonData.name == undefined) {
                    jsonData.name = "PAS DE NOM";
                }
                if (jsonData.start_date !== undefined) {
                    jsonData.start_date = processDate(jsonData.start_date);
                }
                if (jsonData.end_date !== undefined) {
                    jsonData.end_date = processDate(jsonData.end_date);
                }
                if (jsonData.birthday !== undefined) {
                    jsonData.birthday = processDate(jsonData.birthday);
                }
                if (jsonData.deathday !== undefined) {
                    jsonData.deathday = processDate(jsonData.deathday);
                }
                if (key == "Attachments") {
                    if (jsonData.Attachments !== undefined) {
                        jsonData.Attachments = jsonData.Attachments[0].url;
                    }
                }
                columns.push(key);
                if (typeof jsonData[key] !== "number") {
                    if (typeof jsonData[key] == "object") {
                        str = '"' + JSON.stringify(jsonData[key] + '"');
                    } else {
                        str = '"' + jsonData[key] + '"';
                    }
                } else {
                    str = jsonData[key];
                }
                values.push(str);

            }
            console.log("INSERT INTO " + names[i] + " ("+columns+")"+" VALUES ("+values+")");
            connection.query("SET FOREIGN_KEY_CHECKS=1");
            connection.query("INSERT INTO " + names[i] + " (" + columns + ")" + " VALUES (" + values + ")");
        }
    }
}).then(function(){
	console.log("done");
});

function getMainTable(){
		var results = [];
		var dir = './json/';
		fs.readdirSync(dir).forEach(function(file){
			    //push the name of the file
				results.push(dir+file);
		});
		return results;
	}

function processNames(arrayOfJsonFiles){
	var names = [];
	arrayOfJsonFiles.forEach(function(name){
		var tableSliced = name.slice(-name.length, -5);
		var tableName = tableSliced.slice(7);
		names.push(tableName);
	});
	return names;
}
function processDate(date) {
	var dateStr = String(date);
	return dateStr.substr(0, 10);
}
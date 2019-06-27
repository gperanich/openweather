var express = require("express");
var app = express();
const rp = require('request-promise');

const sheetsApiKey = 'AIzaSyDHUOotmy6NuuPgwNszRp4UHbgVO5VD4nc';
const weatherApiKey = '31bf8b6ccb76162eeaa8103830560941';

app.get(`/weather/:condition`, (req, res) => {
    var cities = getCities(res, req.params.condition);
    cities.then((cityMap) => {
        getWeatherData(cityMap, req.params.condition, res)
    })
})

app.listen(8080, () => {
    console.log("Server running on port 8080");
});

function getCities(response, condition) {
    var options = {
        url: `https://sheets.googleapis.com/v4/spreadsheets/1_Rxr-2jkJgWmmO6xLJJ61SHEXeRCUVIgv6cXXnvz438/values/Cities!A2:B250?key=${sheetsApiKey}`,
        json: true
    }
    return rp(options).then((res) => {
        let cities = res.values.map((city) => {
            return city[0];
        })

        // let citySet = new Set(cities);
        let cityMap = new Map(res.values);
        return cityMap;
    })
        .catch((err) => {
            return err;
        })
}

function getWeatherData(cityMap, condition, res) {
    // lat-long mapping for continental US
    // lon numbers need to be negative to represent west
    let minLong = -70;
    let maxLong = -126;
    let minLat = 25;
    let maxLat = 50;

    let outputObj = {};
    let promiseArr = [];

    for (let i = minLong; i > maxLong; i--) {
        let right = i;
        let left = i - 1;
        promiseArr.push(rp(weatherOptionsConstructor(left, minLat, right, maxLat, weatherApiKey)));
    }

    // add queries for Honalulu and Anchorage (edge cases)
    promiseArr.push(rp(`http://api.openweathermap.org/data/2.5/weather?q=Honolulu&appid=${weatherApiKey}&units=imperial`))
    promiseArr.push(rp(`http://api.openweathermap.org/data/2.5/weather?q=Anchorage&appid=${weatherApiKey}&units=imperial`))

    Promise.all(promiseArr).then((values) => {
        values.forEach((val) => {
            // test to see if weather data is JSON
            if (isJson(val) === true) {
                val = JSON.parse(val);
            }
            if (val) {
                // check to see if response contains a single city
                if (val.name) {
                    if (cityMap.has(val.name)) {
                        if (val.weather[0].main === condition) {
                            outputObj[val.name] = {
                                'temperature': val.main.temp,
                                'wind': val.wind.speed
                            };
                        }
                    }
                }
                // check to see if response contains a list of cities
                if (val.list) {
                    val.list.forEach((city) => {
                        if (cityMap.has(city.name)) {
                            if (city.weather[0].main === condition) {
                                outputObj[city.name] = {
                                    'temperature': city.main.temp,
                                    'wind': city.wind.speed,
                                    'state': cityMap.get(city.name)
                                };
                            }
                        }
                    })
                } 
            }
        })
        res.send(JSON.stringify(outputObj));
    }).catch((err) => {
        console.log('Too many requests in a row!', err)
    })
}

// format for rect lat/lon box [lon-left,lat-bottom,lon-right,lat-top,zoom]

function weatherOptionsConstructor(leftLon, bottomLat, rightLon, topLat, key) {
    return {
        url: `http://api.openweathermap.org/data/2.5/box/city?bbox=${leftLon},${bottomLat},${rightLon},${topLat},1000&appid=${key}&units=imperial`,
        json: true
    }
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
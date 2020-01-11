var cityInfoContainerTemplate = $(".cityInfo").clone();
var fiveDayContainerTemplate = $("#fiveDayContainer").clone();
var cityListElementTemplate = $(".cityList").clone();

var weatherBaseUrl = 'http://api.openweathermap.org/data/2.5/weather?q=';
var apiKey = '&appid=85e68b224ff5d7b63d454f3ff7f9e09e';
var iconUrlPrefix = 'http://openweathermap.org/img/wn/';
var iconUrlSuffix = '@2x.png';
var unitsQuery = '&units=imperial';
var uvIndexBaseUrl = `http://api.openweathermap.org/data/2.5/uvi?appid=85e68b224ff5d7b63d454f3ff7f9e09e`;

$(document).ready(function () {

    //bind functionality to sidebar
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });

    //bind event listener to search city option
    $('#searchCityBttn').on('click', searchCity);

    //remove on load placeholder templates
    removeCurrentData();
    $(".cityList").remove();

    $(document).on("click", "a", function() { 
        searchCity($(this).attr("data-city"), $(this).attr("data-country"));
    });

    $(document).on("click", "#pastSearchBttn", deletePastSearch)
});

function searchCity(cityName="", country="") {
    event.preventDefault();
    removeCurrentData();

    let userInput;
    //used for link clicks.  Only time passed in cityName and country will be used
    if(cityName !== "" && country !== "") {
        userInput = `${cityName}, ${country}`;
    } else {
        userInput = $("#inputCity").val().trim(); 
    }

    if(userInput === '') return;

    let citySearch, countryCode;
    if(userInput.includes(',')) {
        citySearch = userInput.substr(0, userInput.indexOf(',')).trim();
        countryCode = `,${userInput.substr(userInput.indexOf(',') + 1, userInput.length - 1).trim()}`;
    } else {
        citySearch = userInput;
        countryCode = '';
    }

    let urlBuilder = `${weatherBaseUrl}${citySearch}${countryCode}${unitsQuery}${apiKey}`;
    currentWeatherRequest(urlBuilder, citySearch, countryCode);
}

function fiveDayWeatherRequest(urlBuilder) {
    $.ajax({
        url: urlBuilder,
        method: 'GET'
    }).then(function(response) {
        renderfiveDayForecast(response);
    });
}

function renderfiveDayForecast(response) {
    let addFiveDayContainer = fiveDayContainerTemplate.clone();
    addFiveDayContainer.find(".forecastCard").remove(); 

    let index = 4;
    for(let i=0; i<5; i++) {
        //grab desired templates and duplicate them
        let addFiveDayCard = fiveDayContainerTemplate.find(".forecastCard").clone();

        let dt = response.list[index].dt_txt;
        let formattedDate = dt.substr(0, dt.indexOf(" "));

        addFiveDayCard.find(".forecastDateTitle").text(formattedDate);
        addFiveDayCard.find(".forecastTemp").text(`Temp: ${response.list[index].main.temp} °F`);
        addFiveDayCard.find(".forecastHumid").text(`Humidity: ${response.list[index].main.humidity}%`);
        addFiveDayCard.find(".forecastWeatherIcon").attr("src", `${iconUrlPrefix}${response.list[index].weather[0].icon}${iconUrlSuffix}`);
        addFiveDayContainer.find("#forecastContainer").append(addFiveDayCard);

        index+=8
    }

    $("#content").append(addFiveDayContainer);
}

function currentWeatherRequest(urlBuilder, citySearch, countryCode) {
    $.ajax({
        url: urlBuilder,
        method: 'GET'
    }).then(function(response) {
        //console.log(response);

        let lat = response.coord.lat;
        let lon = response.coord.lon;

        $.ajax({
            url: `${uvIndexBaseUrl}&lat=${lat}&lon=${lon}`,
            method: 'GET'
        }).then(function(uvResponse) {
            //console.log(uvResponse);
            renderCityWeatherInfo(response);
            renderUVIndex(uvResponse);

            urlBuilder = `https://api.openweathermap.org/data/2.5/forecast?q=${citySearch}${countryCode}${unitsQuery}${apiKey}`
            fiveDayWeatherRequest(urlBuilder);
        }).fail(function(uvResponse) {
            renderCityWeatherInfo(response);
            renderUVIndex(uvResponse);

            urlBuilder = `https://api.openweathermap.org/data/2.5/forecast?q=${citySearch}${countryCode}${unitsQuery}${apiKey}`
            fiveDayWeatherRequest(urlBuilder);
        });
    }).fail(function(xhr) {
        console.log('Error sending AJAX request!');
    });
}

function renderCityWeatherInfo(weatherData) {
    console.log(weatherData);
    let dt = moment();
    let currentDate = dt.format("MM/DD/YYYY");

    let currentCityForecast = cityInfoContainerTemplate.clone();
    currentCityForecast.find("#cityName").text(`${weatherData.name} ${currentDate}`);
    currentCityForecast.find("#temperature").text(`Temperature: ${weatherData.main.temp} °F`);
    currentCityForecast.find("#humidity").text(`Humidity: ${weatherData.main.humidity}%`);
    currentCityForecast.find("#windSpeed").text(`Wind Speed: ${weatherData.wind.speed} MPH`);
    currentCityForecast.find("#weatherStatusIcon").attr("src", `${iconUrlPrefix}${weatherData.weather[0].icon}${iconUrlSuffix}`);

    $("#content").append(currentCityForecast);

    //TODO: Add all necessary info to a button for future pulling
    let addCityToList = cityListElementTemplate.clone();
    addCityToList.find("#cityListName").text(weatherData.name);
    addCityToList.find("#cityNameLink").attr("data-city", weatherData.name);
    addCityToList.find("#cityNameLink").attr("data-country", weatherData.sys.country);

    let alreadyExists = false;
    $('.list-unstyled').children('li').each(function () {
        if($(this).find("#cityNameLink").attr("data-city") === weatherData.name) {
            alreadyExists = true;
            return;
        }
    });

    if(alreadyExists === false) $(".list-unstyled").append(addCityToList); //only append to list if the entry does not already exist
}

function renderUVIndex(uvResponse) {
    let uvText = uvResponse.value;

    if(uvText) {
        $("#uvValue").text(uvText)
        if(parseInt(uvText) > 7) $("#uvValue").addClass("label-red");
        if((parseInt(uvText) > 3) && (parseInt(uvText) <= 7)) $("#uvValue").addClass("label-yellow");
        if(parseInt(uvText) <= 3) $("#uvValue").addClass("label-green");
    } else {
        //Error with loading index
        uvIndex = "Error loading UV Index";
        $("#uvValue").text(uvText);
        $("#uvValue").addClass("error");
    }
}

function removeCurrentData() {
    $(".cityInfo").remove();
    $("#fiveDayContainer").remove();
}

function deletePastSearch(event) {
    event.stopPropagation();
    $(this).parent().parent().remove();

    //TODO: Local storage removal of necessary item
}
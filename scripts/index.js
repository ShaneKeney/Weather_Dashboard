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
});

function searchCity(event) {
    event.preventDefault();
    
    let userInput = $("#inputCity").val().trim();
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
    
    $.ajax({
        url: urlBuilder,
        method: 'GET'
    }).then(function(response) {
        console.log(response);

        let lat = response.coord.lat;
        let lon = response.coord.lon;

        $.ajax({
            url: `${uvIndexBaseUrl}&lat=${lat}&lon=${lon}`,
            method: 'GET'
        }).then(function(uvResponse) {
            console.log(uvResponse);
            renderCityWeatherInfo(response);
            renderUVIndex(uvResponse);
        }).fail(function(uvResponse) {
            renderCityWeatherInfo(response);
            renderUVIndex(uvResponse);
        });

    }).fail(function(xhr) {
        console.log('Error sending AJAX request!');
    });

    //TODO: start next method call

}

function renderCityWeatherInfo(weatherData) {
    removeCurrentData();

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
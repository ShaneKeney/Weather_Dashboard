var cityInfoContainerTemplate = $(".cityInfo").clone();
var fiveDayContainerTemplate = $("#fiveDayContainer").clone();
var cityListElementTemplate = $(".cityList").clone();

var baseUrl = 'http://api.openweathermap.org/data/2.5/weather?q=';
var apiKey = '&apiKey=85e68b224ff5d7b63d454f3ff7f9e09e';

$(document).ready(function () {

    //bind functionality to sidebar
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });

    //bind event listener to search city option
    $('#searchCityBttn').on('click', searchCity);

    //remove on load placeholder templates
    $(".cityInfo").remove();
    $("#fiveDayContainer").remove();
    $(".cityList").remove();
});

function searchCity(event) {
    event.preventDefault();
    
    let userInput = $("#inputCity").val().trim();
    if(userInput === '') return;

    let citySearch, countryCode;
    if(userInput.includes(',')) {
        citySearch = userInput.substr(0, userInput.indexOf(',')).trim();
        countryCode = userInput.substr(userInput.indexOf(',') + 1, userInput.length - 1).trim();
    } else {
        citySearch = userInput;
    }

    
}
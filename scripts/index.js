var cityInfoContainerTemplate = $(".cityInfo").clone();
var fiveDayContainerTemplate = $("#fiveDayContainer").clone();
var cityListElementTemplate = $(".cityList").clone();

$(document).ready(function () {

    //bind functionality to sidebar
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });

    //remove on load placeholder templates
    $(".cityInfo").remove();
    $("#fiveDayContainer").remove();
    $(".cityList").remove();
});
var ottor_url = "http://localhost:3000/"
//var ottor_url = "http://ottor-live.herokuapp.com/"
//var ottor_url = "http://ottor-stage.herokuapp.com/"
/****************************************************************************************
 *  Main shared ottor logic                                                             *
/****************************************************************************************/
/*  Find out it this is a valid page and read the relevant information */
function runOttor () {
    console.log("runOttor")
    if (propertyDetailsPage()) {
        runForPropertyDetails();
    } else if (propertyListPage()) {
        runForPropertyList();
    }
}
/*  Check if this user is logged in to Ottor */
function loggedIn() {
    console.log("loggedIn")
    return false;
}
/*  Show the Ottor login div */ 
function showLogin() {    
    console.log("showLogin")
}
/****************************************************************************************
 *  Getters will need changing when rightmove update their system                       *
 ****************************************************************************************/
function getUrl() {
    url = window.location.pathname;
}
function getHostname() {
    hostname = $(location).attr('hostname'); 
}
function getAddress() {
    address = $('#addresscontainer').text().trim();
}
function getPostCode() {
    post_code = $('#broadband-link').attr("href").trim();    
    post_code = post_code.substr(post_code.indexOf("#") + 1)
}
function getEstateAgent() {
    estate_agent = $('#agentdetails a:first').text().trim();
}
function getBranch() {
    branch = $('#branchaddress').text().trim();
}
function getAskingPrice() {
    asking_price = $('#propertyprice').text().trim();    
}
function getSSTC() {
    sstc = $('.propertystatus').length > 0;        
}
function getImageUrl() {
    image_url = $('#mainphoto').attr("src").trim();        
}
/****************************************************************************************
 *  Property Details Section                                                            *
 ****************************************************************************************/
/*  Check to see if this is a rightmove property details page */
function propertyDetailsPage() {
    console.log("Checking to see if this is a property details page")
    if ($("body").hasClass("property-details")) {
        return true;
    }
    return false;
}
/*  Try to load the property from ottor */ 
function runForPropertyDetails() {    
    console.log("Running ottor in property details mode")
    if (loggedIn()) {
        showPropertyDetails();
    } else {
        showLogin();
    }
}
/*  Show the main Ottor div */ 
function showPropertyDetails() {  
    console.log("Try to load the property from ottor and display it")
    grabDetails();
    loadOttorProperty();    
}
/*  Grab property details */ 
function grabDetails() {    
    console.log("Grab the property details from this page")
    getUrl();
    getHostname();
    getAddress();
    getPostCode();
    getEstateAgent();
    getBranch();
    getAskingPrice();
    getSSTC();
    getImageUrl();        
}
/*  Load Ottor property */ 
function loadOttorProperty() {    
    console.log("Load the property from Ottor")
}
/****************************************************************************************
 *  Property List Section                                                               * 
 ****************************************************************************************/
/*  Check to see if this is a rightmove search page */
function propertyListPage() {
    console.log("Checking to see if this is a property list page")
    if ($("body").is("#searchresults")) {
        return true;
    }
    return false;
}
/*  Flag the ottor properties in the list with the ottor status */
function runForPropertyList() {   
    console.log("Running ottor in property list mode")
    if (loggedIn()) {
        showPropertyList();
    } else {
        showLogin();
    }
}
/*  Flag the properties saved in Ottor */ 
function showPropertyList() {    
    console.log("Load properties from Ottor and flag the corresponding properties in this page")
    loadOttorProperties();    
}
/*  Load Ottor properties */ 
function loadOttorProperties() {    
    console.log("load the properties from Ottor")
}
/****************************************************************************************
 *  Run the Ottor pluggin                                                               *
 ****************************************************************************************/
runOttor();



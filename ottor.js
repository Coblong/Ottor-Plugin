var ottor_url = "http://localhost:3000/"
//var ottor_url = "http://ottor-live.herokuapp.com/"
//var ottor_url = "http://ottor-stage.herokuapp.com/"

var loadPropertyUrl = ottor_url + "external/property"
var loginUrl = ottor_url + "/quietsession"
var savePropertyUrl = ottor_url + "/properties"
var saveNoteUrl = ottor_url + "/notes"

var mainAgentDivId = "#secondaryAgentDetails"
/****************************************************************************************
 *  Main shared ottor logic                                                             *
/****************************************************************************************/
/*  Find out it this is a valid page and read the relevant information */
function runOttor () {
    console.log("Starting Ottor script")
    if (propertyDetailsPage()) {
        runForPropertyDetails();
    } else if (propertyListPage()) {
        runForPropertyList();
    }
}
/*  Show the Ottor login div */ 
function showLogin() {    
    console.log("User not logged in so show login div")
    html =  "<div id='ottor-main'>"
    html += "<form id='ottor-login-form'>"
    html += "<table class='ottor'>"
    html += "<tr><td class='ottor' id='ottor-login-error' colspan='2'></td></tr>"
    html += "<tr><td class='ottor'>Email</td>"
    html += "<td class='ottor'><input class='ottor-input' id='ottor-email' name='email'/></td></tr>"
    html += "<tr><td class='ottor'>Password</td>"
    html += "<td class='ottor'><input class='ottor-input' type='password' id='ottor-password' name='password'/></td></tr>"
    html += "<tr><td class='ottor'></td>"
    html += "<td class='ottor'><a href='#' class='ottor-link' id='ottor-login-btn'>Login to Ottor</a></td></tr>"
    html += "</table>"
    html += "</form>"
    html += "</div>"    
    html += "<div class='ottor-footer'></div>"    
    $( html ).insertAfter( mainAgentDivId );
    
    $("#ottor-login-btn").click(function() {
        var email = $("#ottor-email").val();
        var pwd = $("#ottor-password").val();
        $.ajax({
            type: "POST",
            url: loginUrl,
            data: 'email=' + email + '&pwd=' + pwd,
            dataType: "json",
            error: function(xhr, status, error) {
                $('#ottor-login-error').text('Invalid email/password combination');
            },
            success: function (xhr, data) {
                $("#ottor-login").hide();
                runForPropertyDetails();
            }
        });
    });
}
/****************************************************************************************
 *  Getters will need changing when rightmove update their system                       *
 ****************************************************************************************/
function getUrl() {    
    url = window.location.pathname;
    console.log("url=" + url);
}
function getHostname() {
    hostname = $(location).attr('hostname'); 
    console.log("hostname=" + hostname)
}
function getAddress() {
    address = $('.property-header-bedroom-and-price address').text().trim();
    console.log("address=" + address)
}
function getPostCode() {
    post_code = $('#broadband-link').attr("href").trim();    
    post_code = post_code.substr(post_code.indexOf("#") + 1)
    console.log("post_code=" + post_code)
}
function getEstateAgent() {
    estate_agent = $('.agent-details-display:first a:first').text().trim();
    console.log("estate_agent=" + estate_agent)
}
function getBranch() {
    branch = $('.agent-details-display:first address').text().trim();
    console.log("branch=" + branch)
}
function getAskingPrice() {
    asking_price = $('.property-header-price strong').text().trim();        
    console.log("asking_price=" + asking_price)
}
function getSSTC() {
    qualifier = $('.property-header-qualifier').text();        
    if (qualifier == "Sold STC" || qualifier == "Under Offer") {
        sstc = true;
    } else {
        sstc = false;
        asking_price = qualifier + ' ' + asking_price;
        console.log("updated asking_price=" + asking_price)
    }
    console.log("sstc=" + sstc)    
}
function getImageUrl() {
    image_url = $('.gallery-main-img img').attr("src").trim();        
    console.log("image_url=" + image_url)
}
/****************************************************************************************
 *  Property Details Section                                                            *
 ****************************************************************************************/
/*  Check to see if this is a rightmove property details page */
function propertyDetailsPage() {
    if ($("body").hasClass("property-details")) {
        return true;
    }
    return false;
}
/*  Try to load the property from ottor */ 
function runForPropertyDetails() {     
    console.log("Running in property details mode")
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
    
    console.log("Trying to load the property from Ottor");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", loadPropertyUrl + "?url=" + url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status==401) {
            showLogin();            
        } else {
            ottorJSON = JSON.parse(xhr.responseText);
            if (ottorJSON.hasOwnProperty("status_id")) {
                status_id = ottorJSON.status_id;    
                property_id = ottorJSON.id;
                closed_yn = ottorJSON.closed;
            } else {
                status_id = -1;
                property_id = -1;
                closed_yn = false;
            }                        
            showOttor();
        }
      }
    }
    xhr.send();    
}
function showOttor() {
    console.log("Showing property")
    if(status_id > 0) {
        sendUpdates();
    }
    showProperty();    
}
function sendUpdates() {    
    console.log('SSTC was ' + ottorJSON.sstc + ' and now is ' + sstc);
    console.log('Asking price was ' + ottorJSON.asking_price + ' and now is ' + asking_price);
    if (sstc != ottorJSON.sstc || asking_price != ottorJSON.asking_price) {
        saveProperty();
    } else {
        console.log('No updates')        
    }
}
function showStatusButtons() {
    console.log('Showing status buttons');
    if (property_id < 0) {
        html += "<div id='ottor-header'><div class='ottor-link'><a href='" + ottor_url + "' target='_new'>View on Ottor</a></div>";    
    } else {
        html += "<div id='ottor-header'><div class='ottor-link'><a href='" + ottor_url + "properties/" + property_id + "' target='_new'>View on Ottor</a></div>";    
    }    
    html += "<div id='ottor-buttons'>";    
    if(closed_yn){
        html += "<img width='24' title='Reopen' id='ottor-reopen-btn' src='" + chrome.extension.getURL("reopen.png") + "'/></div></div>";    
    } else {
        html += "<img width='24' title='Close' id='ottor-close-btn' src='" + chrome.extension.getURL("close.png") + "'/></div></div>";            
        html += "<div id='status-buttons'>";
        $.each( $.parseJSON(ottorJSON['statuses']), function( index, value ){        
            if (status_id > 0) {
                if (status_id == value['id']) {    
                    html += "<button id='" + value['id'] + "' class='update-status-btn' style='background:#" + value['colour'] + "'>" + value['description'] + "</button>";
                } else {
                    html += "<button id='" + value['id'] + "' class='update-status-btn'>" + value['description'] + "</button>";
                }
            } else {
                html += "<button id='" + value['id'] + "' class='update-status-btn' style='background:#" + value['colour'] + "'>" + value['description'] + "</button>";    
            }                
        });  
    }
    html += "</div>";    
}
function showProperty() {    
    console.log('Showing property details from Ottor');
    html = "<div id='ottor-main'><div>";    
    showStatusButtons();            
    if (status_id > 0) {
        if(!closed_yn) {
            html += "<table>";    
            html += "<tr><td class='ottor'>";    
            html += "<input class='ottor-input' id='ottor-agent' list='agents' placeholder='Agent'>";
            html += "<datalist id='agents'>";
            $.each( $.parseJSON(ottorJSON['agents']), function( index, value ){        
                html += "<option value='" + value['name'] + "'/>";        
            });              
            html += "</datalist>";
            html += "</td></tr><tr><td class='ottor'>";    
            html += "<textarea class='ottor-textarea' id='ottor-note' placeholder='Add a note...'/>";
            html += "</td></tr>";    
            html += "<tr><td align='right' class='ottor'><button id='add-note-btn'>Add Note</button></td></tr>";    
            html += "</table>";
        }        
        html += "<ul class='ottor-note-ul'>";
        $.each( $.parseJSON(ottorJSON['notes']), function( index, value ){        
            var note_class = '';
            if (value['note_type'] == 'status') {
                note_class = 'status_change';
            } else if (value['note_type'] == 'sstc') {
                note_class = 'ottor-note-sstc-change';
            } else if (value['note_type'] == 'price') {
                note_class = 'ottor-note-price-change';
            } else if (value['note_type'] == 'offer') {
                note_class = 'ottor-note-offer';
            } else if (value['note_type'] == 'viewing') {
                note_class = 'ottor-note-viewing';
            } else if (value['note_type'] == 'auto' || value['note_type'] == 'action') {
                note_class = 'ottor-note-auto';
            }
            html += "<li class='ottor-note-li " + note_class + "'><ul class='ottor-note-details-ul'>";    
            if (value['agent_name'] == null) {
                html += "<li class='ottor-note-details-li'>" + value['formatted_date'] + "</li>";        
            } else {
                html += "<li class='ottor-note-details-li'>" + value['formatted_date'] + " - " + value['agent_name'] + "</li>";    
            }
            html += "<li class='ottor-note-details-li'>" + value['content'] + "</li>";    
            html += "</ul></li></ul>";    
        });              
        html += "<br><br><br>";    
    }    
    html += "</div></div>";

    ottorDiv = $("#ottor-main")
    if (ottorDiv.length > 0) {
        console.log('Ottor already exists so just replace the content with the new content')
        ottorDiv.replaceWith(html)
    } else {
        console.log('No Ottor div yet so create a new div and insert the new content')
        $( html ).insertAfter( mainAgentDivId );
    }

    $("#ottor-close-btn").click(function(event) {
        closed_yn = true;
        saveProperty();
    });

    $("#ottor-reopen-btn").click(function(event) {
        closed_yn = false;
        saveProperty();
    });

    $(".update-status-btn").click(function(event) {
        console.log('Trying to update the status to ' + event.target.id);
        status_id = event.target.id;
        saveProperty();
    });

    $("#add-note-btn").click(function(event) {
        saveProperty();
        var agent = $("#ottor-agent").val();
        var note = $("#ottor-note").val();
        $.ajax({
            type: "POST",
            url: saveNoteUrl,
            data: 'url=' + url +'&agent=' + agent +'&note=' + note,
            dataType: "json",
            error: function(xhr, status, error) {
                console.log('Unable to save property');
            },
            success: function (xhr, data) {
                console.log('Property saved');                
                loadPropertyDetails();
            }
        });
    });
}
function saveProperty() {
    $.ajax({
        type: "POST",
        url: savePropertyUrl,
        data: 'hostname=' + hostname + '&closed=' + closed_yn + '&url=' + url +'&address=' + address + '&post_code=' + post_code + '&estate_agent=' + estate_agent +'&branch=' + branch +'&asking_price=' + asking_price +'&sstc=' + sstc + '&status_id=' + status_id + '&image_url=' + image_url,
        dataType: "json",
        error: function(xhr, status, error) {
            console.log('Unable to save property');
        },
        success: function (xhr, data) {
            console.log('Property saved');                
            runForPropertyDetails();
        }
    });
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



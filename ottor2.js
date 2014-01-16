/**
 1. Check if this is a property page
 2. Strip oput the relevant information 
    a. url = external_ref
    b. hostname = http://rightmove.co.uk
    c. address = The property address
    d. estate_agent = The estate agents name to be stored in the ottor external_ref
    e. branch = The estate agent brnaches name to be stored in the ottor external_ref     
 3. If the user is not logged in we show the login form
 4. If the user is logged in we show the property details from ottor
 */
//var ottor_url = "http://localhost:3000/"
var ottor_url = "http://ottor-live.herokuapp.com/"
//var ottor_url = "http://ottor-stage.herokuapp.com/"

function loadOttorInformation() {
    console.log ('Checking if this is a property page');
    if ($('.propertyDetails').length == 0) {
        console.log('...its not so do nothing');
    } else {        
        removeJunk();
        stripOutDetails();            
        loadPropertyDetails();
    }    
}

function loadPropertyDetails() {
    console.log ('Loading property details from Ottor');
    var xhr = new XMLHttpRequest();
    xhr.open("GET", ottor_url + "external/property?url=" + url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status==401) {
            showLoginDiv();            
        } else {
            jsonResponse = JSON.parse(xhr.responseText);
            status_id = jsonResponse.status_id

            if(jsonResponse.hasOwnProperty("status_id")) {
                property_id = jsonResponse.id    
                closed_yn = jsonResponse.closed;
                checkForUpdates();
            } else {
                property_id = -1;
                status_id = -1;
                closed_yn = false;
            }

            showProperty();
        }
      }
    }
    xhr.send();
}

function showLoginDiv() {
    console.log('Showing login block');
    $( "<div id='ottor-login'><form id='ottorLoginForm'><table><tr><td id='ottorLoginError' colspan='2'></td></tr><tr><td rowspan='4'><img width='120' src='" + chrome.extension.getURL("ottor.png") + "'/></td></tr><tr><td><input id='ottorEmail' name='email' placeholder='Username'/></td></tr><tr><td><input type='password' id='ottorPwd' name='password' placeholder='Password'/></td></tr><tr><td><input id='ottorLoginButton' class='button secondary' type='button' value='Login to Ottor'/></td></tr></table></form></div>" ).insertAfter( "#branchdetails" );
    
    $("#ottorLoginButton").click(function() {
        var email = $("#ottorEmail").val();
        var pwd = $("#ottorPwd").val();
        $.ajax({
            type: "POST",
            url: ottor_url + "/quietsession",
            data: 'email=' + email + '&pwd=' + pwd,
            dataType: "json",
            error: function(xhr, status, error) {
                $('#ottorLoginError').text('Invalid email/password combination');
            },
            success: function (xhr, data) {
                $("#ottor-login").hide();
                loadPropertyDetails();
            }
        });
    });
}

function removeJunk() {    
    console.log('Removing unwanted divs');
    //$('#button-rhs').removeClass().remove();    
    //$('#branchnumber').removeClass().remove();
    //$('#branchnumber>span').removeClass().empty().remove();
    //$('#requestdetailsbutton').removeClass().remove();
    //$('#requestdetails').removeClass().empty().remove();
    //$('#socialmedia').removeClass().remove();
    //$('#likebutton').removeClass().remove();
    //$('#pageoptions').removeClass().remove();
}

function stripOutDetails() {
    console.log('Stripping out details');
    url = window.location.pathname;
    hostname = $(location).attr('hostname'); 
    address = $('#addresscontainer').text().trim();
    post_code = $('#broadband-link').attr("href").trim();    
    post_code = post_code.substr(post_code.indexOf("#") + 1)
    estate_agent = $('#agentdetails a:first').text().trim();
    branch = $('#branchaddress').text().trim();
    asking_price = $('#propertyprice').text().trim();    
    sstc = $('.propertystatus').length > 0;        
    image_url = $('#mainphoto').attr("src").trim();        
}

function showStatusButtons() {
    console.log('Showing status buttons');
    if (property_id < 0) {
        html += "<div id='ottor-header'><div id='ottor-link'><a href='" + ottor_url + "' target='_new'>View on Ottor</a></div>";    
    } else {
        html += "<div id='ottor-header'><div id='ottor-link'><a href='" + ottor_url + "properties/" + property_id + "' target='_new'>View on Ottor</a></div>";    
    }    
    html += "<div id='buttons'>";    
    if(closed_yn){
        html += "<img width='24' title='Reopen' id='reopenPropertyButton' src='" + chrome.extension.getURL("reopen.png") + "'/></div></div>";    
    } else {
        html += "<img width='24' title='Close' id='closePropertyButton' src='" + chrome.extension.getURL("close.png") + "'/></div></div>";            
        html += "<div id='status-buttons'>";
        $.each( $.parseJSON(jsonResponse['statuses']), function( index, value ){        
            if (status_id > 0) {
                if (status_id == value['id']) {    
                    html += "<button id='" + value['id'] + "' class='savePropertyButton' style='background:#" + value['colour'] + "'>" + value['description'] + "</button>";
                } else {
                    html += "<button id='" + value['id'] + "' class='savePropertyButton secondary'>" + value['description'] + "</button>";
                }
            } else {
                html += "<button id='" + value['id'] + "' class='savePropertyButton' style='background:#" + value['colour'] + "'>" + value['description'] + "</button>";    
            }                
        });  
    }
    html += "</div>";    
}

function checkForUpdates() {    
    if (sstc != jsonResponse['sstc'] || asking_price != jsonResponse['asking_price']) {
        saveProperty(status_id);
    }
}

function showProperty() {    
    console.log('Showing property details from Ottor');

    html = "<div id='ottor'><div>";    
    showStatusButtons();            
    if (status_id > 0) {
        if(!closed_yn) {
            html += "<table>";    
            html += "<tr><td>";    
            html += "<input id='agent' list='agents' placeholder='Agent'>";
            html += "<datalist id='agents'>";
            $.each( $.parseJSON(jsonResponse['agents']), function( index, value ){        
                html += "<option value='" + value['name'] + "'/>";        
            });              
            html += "</datalist>";
            html += "</td></tr><tr><td>";    
            html += "<textarea id='note' placeholder='Add a note...'/>";
            html += "</td></tr>";    
            html += "<tr><td align='right'><button class='addNoteButton'>Add Note</button></td></tr>";    
            html += "</table>";
        }
        html += "<table>";
        $.each( $.parseJSON(jsonResponse['notes']), function( index, value ){        
            var note_class = '';
            if (value['note_type'] == 'status') {
                note_class = 'status_change';
            } else if (value['note_type'] == 'sstc') {
                note_class = 'sstc_change';
            } else if (value['note_type'] == 'price') {
                note_class = 'price_change';
            } else if (value['note_type'] == 'offer') {
                note_class = 'offer';
            } else if (value['note_type'] == 'viewing') {
                note_class = 'viewing';
            } else if (value['note_type'] == 'auto' || value['note_type'] == 'action') {
                note_class = 'auto';
            }
            html += "<tr><td class='rows " + note_class + "'><ul>";    
            if (value['agent_name'] == null) {
                html += "<li>" + value['formatted_date'] + "</li>";        
            } else {
                html += "<li>" + value['formatted_date'] + " - " + value['agent_name'] + "</li>";    
            }
            html += "<li>" + value['content'] + "</li>";    
            html += "</ul></td></tr>";    
        });              
        html += "</table><br><br><br>";    
    }    
    html += "</div></div>";

    ottorDiv = $("#ottor")
    if (ottorDiv.length > 0) {
        console.log('Ottor already exists so just replace the content with the new content')
        ottorDiv.replaceWith(html)
    } else {
        console.log('No Ottor div yet so create a new div and insert the new content')
        $( html ).insertAfter( "#branchdetails" );
    }

    $("#closePropertyButton").click(function(event) {
        closed_yn = true;
        saveProperty();
    });

    $("#reopenPropertyButton").click(function(event) {
        closed_yn = false;
        saveProperty();
    });

    $(".savePropertyButton").click(function(event) {
        status_id = event.target.id;
        saveProperty();
    });

    $(".addNoteButton").click(function(event) {
        saveProperty();
        var agent = $("#agent").val();
        var note = $("#note").val();
        $.ajax({
            type: "POST",
            url: ottor_url + "/notes",
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
        url: ottor_url + "/properties",
        data: 'hostname=' + hostname + '&closed=' + closed_yn + '&url=' + url +'&address=' + address + '&post_code=' + post_code + '&estate_agent=' + estate_agent +'&branch=' + branch +'&asking_price=' + asking_price +'&sstc=' + sstc + '&status_id=' + status_id + '&image_url=' + image_url,
        dataType: "json",
        error: function(xhr, status, error) {
            console.log('Unable to save property');
        },
        success: function (xhr, data) {
            console.log('Property saved');                
            loadPropertyDetails();
        }
    });
}

loadOttorInformation();

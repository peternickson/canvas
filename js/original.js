if (document.title == 'Log in to canvas') { document.title = 'King Alfred School Canvas'; }

// From Gideon
var LinkText = "Check Homework"; //Edit between quotes to change the link text
var cururl = location.href;
if (cururl.indexOf("/courses/") >= 0)

{

var CanvasTenant = window.location.host.split('.')[0]

                var courseid = cururl.split('/')[4];

                var newsechtml = "<li class='section'><a href='https://" + CanvasTenant + ".instructure.com/calendar?include_contexts=course_" + courseid + "' class='settings' style='font-weight:bold;' tabindex='0'>" + LinkText + "</a></li>";

 $('#section-tabs').append(newsechtml);

}

//In Google Analytics you'll need to set up custom dimensions as follows
// Custom Dimension 1 = Canvas User ID --- Scope = User
// Custom Dimension 2 = Archived --- Scope = User
// Custom Dimension 3 = Canvas User Role --- Scope = User
// Custom Dimension 4 = Canvas Course ID --- Scope = Hit
// Custom Dimension 5 = Canvas Course Name --- Scope = Hit
// Custom Dimension 6 = Canvas Sub-Account ID --- Scope = Hit

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

$(document).ready(function () {

    // START - More Google Analytics Tracking Code
    var sUserId
    var sUserRole
    var sTemp // Course ID from URL
    var _course
    var sCourseName = null
    var parent_account //Give you the subaccount_id that the course is in

////////////////// CHANGE UA # HERE /////////////////////
    ga('create', 'UA-62941974-1', 'auto');

    //Get User Information
    sUserId = ENV["current_user_id"]
    ga('set', 'dimension1', sUserId);


    //Get User Role
    if ($.inArray('admin', ENV['current_user_roles']) == -1 && $.inArray('teacher', ENV['current_user_roles']) == -1 && $.inArray('student', ENV['current_user_roles']) > -1) {
        sUserRole = "student"
    } else if ($.inArray('admin', ENV['current_user_roles']) == -1 && $.inArray('teacher', ENV['current_user_roles']) > -1) {
        sUserRole = "teacher"
    } else if ($.inArray('admin', ENV['current_user_roles']) > -1) {
        sUserRole = "admin"
    } else {
        sUserRole = "other"
    }

    ga('set', 'dimension3', sUserRole);

    //If the user is in a course
    try {
        sTemp = window.location.pathname.match(/\/courses\/(\d+)/);
        if (sTemp[1]) {

            //Get Course information - Course Name and parent sub-account id
            var d1 = $.get('/api/v1/courses/' + sTemp[1], function (_course) {
                parent_account = _course.account_id
                parent_account = parent_account.toString();
                sCourseName = _course.name
            });


            $.when(d1).done(function (_account) {
                // ...do stuff...
                ga('set', 'dimension4', sTemp[1]);
                ga('set', 'dimension5', sCourseName);
                ga('set', 'dimension6', parent_account);
                ga('send', 'pageview');
            });
        } else {
            ga('send', 'pageview');
        }
    } catch (err) {}

    // END - Google Analytics Tracking Code

});

//CODE FOR PARENTS OF TWO OR MORE CHILDREN
//Calling the api to get information about observees of logged in user
//If you want to test this, change "self" to a user with none, 1 or more observees to test if this works.
var CanvasTenant = window.location.host.split('.')[0]
var xhr;
xhr = new XMLHttpRequest();
xhr.open("GET","/api/v1/users/self/observees?per_page=50 ",false);
xhr.send();
/*
If we just use the xhr.response command, we get information in JSON format about the observer, 
however the JSON retrieved has while(1) at the start and is surrounded by square brackets. 
I'm new to JSON so had some problems when trying to parse this text.   
In order to parse, I've removed these using replace commands.  We have to do this each time we 
retrieve an API response, so I've created a function called cleanupAdult for observers and
cleanupChild for when we retrieve the student information.
*/
function cleanupAdult(response){
	return response.replace("while(1);[", "").replace("]", "");
}
function cleanupChild(response){
	return response.replace("while(1);[", "").replace("e}]", "e}");
}
//Need to split the JSON string, which I still can't work out how to parse correctly, into an array of JSON elements.  
//The individual JSON array elements are easy to parse.  Probably didn't need to do this, but who cares... it works.
function splitJson(longJson){
	var splitted = longJson.split("},{");
	var i = 0;
	for (i=0; i < splitted.length; i++){
		if (splitted[i].charAt(0) !== "{") {
			splitted[i] = "{" + splitted[i];
		}
		if (splitted[i].charAt(splitted[i].length - 1) !=="}"){
		splitted[i] = splitted[i] + "}";
		}
	}
	return splitted;
}
//The calendarLinks function takes an array of JSON formatted elements to create a link
//Shoutout to Gideon Williams and his amazing IT guys for showing me the general format for these links
function calendarLinks(listofcourses){
	var i = 0;
	var httplink = "https://" + CanvasTenant + ".instructure.com/calendar?include_contexts="
	for (i = 0; i < listofcourses.length; i++){
		httplink = httplink + ",course_" + String(JSON.parse(listofcourses[i]).id);
	}
	return httplink.replace("=,","=")
}

var userObservees = cleanupAdult(xhr.response);

//Trying to count the number of children attached to the observer
//This should cycle through the whole text and when you see a "{" add 1 to howManyChildren
var howManyChildren = 0;
var i;
for ( i=0; i < userObservees.length; i++ ) {
	var char = userObservees.substr( i, 1 );
		if (char == "{" ) {
			howManyChildren++;
		}
	}

//So now lets start putting in the html based on zero observees, one observee or multiple observees
if(howManyChildren === 0){
	console.log("The current user is not observing any students");
}
else if(howManyChildren === 1){
//Add a single button for observers that only watch one child
//When clicked should show all subjects for that child.
	var onlychild = JSON.parse(userObservees);
		//API call to gather the courses of this child
        var xhr2;
        xhr2 = new XMLHttpRequest();
        xhr2.open("GET","/api/v1/users/" + onlychild.id + "/courses?per_page=20",false);
        xhr2.send();
        var childCourses = splitJson(cleanupChild(xhr2.response)); 
	var newbuttonhtml = "<a href=" + calendarLinks (childCourses) +" class='btn'> Show all homework for " + onlychild.name +"</a>";
	$('#calendar_header').append(newbuttonhtml);
}
else{
	//Add a dropdown list for observers that watch more than one child
	var j;
	var newdropdownhtml = "<select onChange='window.location.href=this.value'><option>Select your child</option>"
	//userObservees was able to be parsed if there was one observee.  However with two, we need to split (splitJson function)
	var students = splitJson(userObservees); 
	for (j=0; j < howManyChildren; j++){
		//We an API call to gather the courses of the student
		var individualStudent = JSON.parse(students[j]);
        console.log(individualStudent.id)
        var xhr3;
        xhr3 = new XMLHttpRequest();
        xhr3.open("GET","/api/v1/users/" + individualStudent.id + "/courses?per_page=20",false);
        xhr3.send();
        var studentCourses = splitJson(cleanupChild(xhr3.response));  
		newdropdownhtml = newdropdownhtml + "<option value='" + calendarLinks (studentCourses) + "'>" +	JSON.parse(students[j]).name	+	"</option>"	
	}
	var newdropdownhtml = newdropdownhtml + "</select>";
 $('#calendar_header').append(newdropdownhtml);
}

 
 
 
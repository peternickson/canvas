/*! MIT License | github.com/kingalfred/canvas */

/*
 * Replace title
 */
if (document.title === 'Canvas - Instructure') {
  document.title = 'Canvas - King Alfred School';
}

/*
 * Add "Check Homework button"
 */
if (window.location.href.indexOf('courses')) {
  var text = 'Calendar';
  var course = window.location.pathname.split('/')[2];

  $('#section-tabs').append(
    `<li class="section">
      <a class="settings" href="/calendar?include_contexts=course_${course}">
        ${text}
      </a>
    </li>`
  );
}

/*
 * Parent's multiple children
 */
function addChooseChild() {
  
  $.ajax({
    method: 'get',
    url: '/api/v1/users/self/observees?per_page=50',
    dataType: 'json'
  }).then(children => {
    var p = [];
    for (let child of children) {
      p.push(new Promise(function(resolve, reject) {
        $.ajax({
          method: 'get',
          url: '/api/v1/users/' + child.id + '/courses?per_page=20',
          dataType: 'json'
        }).then(courses => {
          var listCourses = [];
          for (var course of courses) {
            listCourses.push(course.id)
          }
          resolve({
            name: child.name,
            courses: listCourses
          });
        }).fail(err => {
          reject(err);
        });
      }));
    }
    Promise.all(p).then(res => {
      $('#calendar_header').append(`
        <select id="calendar_children" onchange="location = this.value;">
          <option class="calendar_child">Select Child</option>
          ${
            res.map(
              x => `<option class="calendar_child" value=${x.id}>${x.name}</option>`
            )
          }
        </select>
      `)
    })
  }).fail(err => {
    throw err;
  })
  
};

if (window.location.href.indexOf('calendar')) {
  addChooseChild();
}

/*
 * Change favicon of beta environment to green icon
 */
function changeFavicon(img) {
  var favicon = $('link[rel="shortcut icon"]');
  if (!favicon) $('head').append('<link rel="shortcut icon">');
  favicon.attr('type', 'image/png');
  favicon.attr('href', img);
}

if (window.location.hostname.indexOf('beta')) {
  changeFavicon('https://i.imgur.com/DpAI7L4.png');
}

/*
 * Replace title
 */
if (document.title === 'Log in to canvas') {
  document.title = 'King Alfred School Canvas'
}

/*
 * Add "Check Homework button"
 */
if (window.location.href.indexOf('courses')) {
  var text = 'Calendar'
  var course = window.location.pathname.split('/')[2]

  $('#section-tabs').append(
    `<li class="section">
      <a class="settings" href="/calendar?include_contexts=course_${course}">
        ${text}
      </a>
    </li>`
  )
}

/*
 * Parent's multiple children
 */
(function() {

  // Add initial option selector
  $('#calendar_header').append(
    `
    <select id="calendar_children" onchange="location = this.value;">
      <option class="calendar_child">Select Option</option>
      <option class="calendar_child" value="/calendar">All Children</option>
    </select>
    `
  )

  // Get user's children
  $.ajax({
    method: 'get',
    url: 'api/v1/users/self/observees?per_page=50',
    dataType: 'json'
  }).then(children => {
    if (children.length < 1) {
      $('#calendar_children').remove();
    }

    var counter = 2;
    // Each child...
    for (var child of children) {
      // Add child option
      $('#calendar_children').append(
        `
        <option class="calendar_child">${child.name}</option>
        `
      )
      // Get courses of that child
      $.ajax({
        method: 'get',
        url: '/api/v1/users/' + child.id + '/courses?per_page=20',
        dataType: 'json'
      }).then(courses => {
        // Create the calendar link
        var courseLinks = '/calendar?include_contexts='

        // Add every course ID to the link
        for (var course of courses) {
          courseLinks += `course_${course.id},`
        }

        // Add child option
        $(`.calendar_child`).eq(counter).attr('value', courseLinks)
        counter++;
      }).fail(err => {
        throw err
      })
    }
   }).fail(err => {
     throw err
   })
})()
var parsed_url = parse_url(window.location.href);

$('#new-discussion_button').on('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  // Redirect to new topic with the same tag.
  disableScreen();
  let future_location = 'topic.html?tag=' + parsed_url['tag'];
  retrieveCurrentUser(changeWindowLocation, {'location' : future_location}, future_location, askUserForLogin=true);
});
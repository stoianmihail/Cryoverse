// Set the tag from the parsed url.
var parsed_url = parse_url(window.location.href);
document.getElementById('custom-simple-tags').setAttribute('data-simple-tags', parsed_url['tag']);

async function createPost(args) {
  console.log(args);

  // Get a key for a new invoice.
  let key = firebase.database().ref().child('posts').push().key;

  // And update.
  let updates = {};
  updates['/posts/' + key] = args;
  db.ref().update(updates);
}

$('#post_button').on('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  console.log(getTimestamp());
  debugger;

  let args = {
    title: $('#title').val(),
    content: $('#content').val(),
    timestamp: getTimestamp(),
    tags: document.getElementById('custom-simple-tags').getAttribute('data-simple-tags')
  };

  disableScreen();
  createPost(args).then(() => {
    enableScreen();
  });
});
// Set the tag from the parsed url.
var parsed_url = parse_url(window.location.href);
document.getElementById('custom-simple-tags').setAttribute('data-simple-tags', parsed_url['tag']);

async function createPost(uid, title, content) {
  let post = {
    user:  uid,
    title: title,
    content: content
  };

  // Get a key for a new invoice.
  let key = firebase.database().ref().child('posts').push().key;

  // And update.
  let updates = {};
  updates['/posts/' + key] = invoiceData;
  db.ref().update(updates);
}

$('#post_button').on('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  let title = $('title').val();
  let content = $('content').val();

  console.log(title);
  console.log(content);

  auth.onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      db.ref('users').child(firebaseUser.uid).once('value', snapshot => {
        if (snapshot.exists()) {
          createPost(firebaseUser.uid, title, content)
          .then(() => {
            console.log('finished');
            // TODO: success
          });
        } else {
          // TODO: error
        }
      });
    } else {
      // TODO: error
    }
  });
});
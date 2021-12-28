// Toggle Function
$('.toggle').click(function(){
  // Switches the Icon
  $(this).children('i').toggleClass('fa-pencil');
  // Switches the forms  
  $('.form').animate({
    height: "toggle",
    'padding-top': 'toggle',
    'padding-bottom': 'toggle',
    opacity: "toggle"
  }, "slow");
});

document.addEventListener('DOMContentLoaded', (event) => {
  var login_button = document.getElementById("login-button");
  var register_button = document.getElementById("register-button");
  var username = null;

  function getAttributes(type) {
    var dict = {}
    dict["email"] = document.getElementById(type + "-email").value;
    if (type !== "reset") {
      dict["password"] = document.getElementById(type + "-password").value
    }
    if (type === "register") {
			dict["username"] = document.getElementById(type + "-username").value;
    }
    return dict;
  }

  function handleForm(type) {
    let attr = getAttributes(type);
    if (type === "login") {
      const promise = auth.signInWithEmailAndPassword(attr["email"], attr["password"]);
      promise.catch(e => console.log(e.message));
    } else if (type === "register") {
      username = attr["username"];
      const promise = auth.createUserWithEmailAndPassword(attr["email"], attr["password"]);
      promise.then(() => {
        console.log("finished?");
      });
      promise.catch(e => console.log(e.message));
    } else {
      console.log("Not supported!")
    }
  }

  function accessForum(uid, username) {
    console.log(parsed_url);
    if ((wasNotLoggedIn) && (parsed_url['state'] === 'first')) {
      window.location = 'forum.html';
      return;
    }
    if ((wasNotLoggedIn) && (parsed_url['return'] !== undefined)) {
      window.location = parsed_url['return'];
      return;
    }

    // Ask the user.
    // TODO: maybe the user wants to access another page, based on `parsed_url['return']`.
    swal({
      title: `You're currently logged in as ${username}`,
      text: "Do you want to access the forum?",
      icon: "warning",
      buttons: [
        'No, change my account',
        'Yes!'
      ]
    }).then(function(isConfirm) {
      if (isConfirm) {
        if (parsed_url['return'] !== undefined) {
          window.location = parsed_url['return'];
        } else {
          window.location = 'forum.html';
        }
        return;
      }

      // First disable the screen.
      let _ = disableScreen();

      // And sign out.
      auth.signOut()
      .then(() => {
        // Redirect to login.
        // Mark the login as a first one and maintain the `return`-state.
        let location_extension = ['state=first'];
        if (parsed_url['return'] !== undefined)
          location_extension.push('return=' + parsed_url['return']);
        window.location = 'login.html?' + location_extension.join('&');
      });
    });
  }

  function register(uid) {
    db.ref('users').child(uid).once("value", snapshot => {
      if (snapshot.exists()) {
        accessForum(uid, snapshot.val().username);
      } else {
				console.log("check username=" + username);
        // Sign up? Check for username
        if (username === null) {
          // Unreachable (if the app works correctly)
          console.log("No username found!");
        } else {
          db.ref('users').child(uid).set({
            username: username,
					}).then(() => {
            accessForum(uid, username);
          }).catch(err => {
            // TODO: inform user
            console.error(err);
          });
        }
      }
    });
  }
  
  login_button.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    handleForm("login");
  }
  
  register_button.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    handleForm("register");
  }
  
  // Fetch the auth status.
  var wasNotLoggedIn = false;
  var lock = disableScreen();
  var parsed_url = parse_url(window.location.href);

  auth.onAuthStateChanged(firebaseUser => {
    enableScreen(lock);
    if (firebaseUser) {
      console.log("Logged in!");
      register(firebaseUser.uid);
    } else {
      wasNotLoggedIn = true;
      // TODO: maybe this is from our signout.
      console.log("Not logged in!");
    }
  });
});

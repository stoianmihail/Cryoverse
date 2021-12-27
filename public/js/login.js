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
  var company = null;

  function getAttributes(type) {
    var dict = {}
    dict["email"] = document.getElementById(type + "-email").value;
    if (type !== "reset") {
      dict["password"] = document.getElementById(type + "-password").value
    }
    if (type === "register") {
			dict["company"] = document.getElementById(type + "-company").value;
    }
    return dict;
  }

  function handleForm(type) {
    let attr = getAttributes(type);
    if (type === "login") {
      const promise = auth.signInWithEmailAndPassword(attr["email"], attr["password"]);
      promise.catch(e => console.log(e.message));
    } else if (type === "register") {
      company = attr["company"];
      const promise = auth.createUserWithEmailAndPassword(attr["email"], attr["password"]);
      promise.then(() => {
        console.log("finished?");
      });
      promise.catch(e => console.log(e.message));
    } else {
      console.log("Not supported!")
    }
  }

  function accessDasboard(uid, company) {
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
      title: `You're currently logged in as ${company}`,
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

  console.log(window.location.href);

  function register(uid) {
    db.ref('users').child(uid).once("value", snapshot => {
      if (snapshot.exists()) {
        accessDasboard(uid, snapshot.val().company);
      } else {
				console.log("check company=" + company);
        // Sign up? Check for company
        if (company === null) {
          // Unreachable (if the app works correctly)
          console.log("No company found!");
        } else {
          db.ref('users').child(uid).set({
            username: company,
					}).then(() => {
            accessDasboard(uid, company);
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

var parsed_url = parse_url(window.location.href);

$('#new-discussion_button').on('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  // Redirect to new topic with the same tag.
  disableScreen();
  let future_location = 'post.html?tag=' + parsed_url['tag'];
  retrieveCurrentUser(changeWindowLocation, {'location' : future_location}, future_location, askUserForLogin=true);
});

async function executeCollapse(id) {
  const snap = await db.ref(`posts/${id}`).once('value');
  let dict = snap.val();
  let nl_time = explainTime(dict.timestamp, 'ago');

  $('#thread').html(`
    <div class="card mb-2">
      <div class="card-body">
          <div class="media forum-item">
              <a href="javascript:void(0)" class="card-link">
                  <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle" width="50" alt="User" />
                  <small class="d-block text-center text-muted"></small>
              </a>
              <div class="media-body ml-3">
                  <a href="javascript:void(0)" class="text-secondary">${dict.username}</a>
                  <small class="text-muted ml-2">${nl_time}</small>
                  <h5 class="mt-1">${dict.title}</h5>
                  <div class="mt-3 font-size-sm">
                      <p>${dict.content}</p>
                  </div>
              </div>
              <div class="text-muted small text-center">
                  <span class="d-none d-sm-inline-block"><i class="far fa-eye"></i> 19</span>
                  <span><i class="far fa-comment ml-2"></i> 3</span>
              </div>
          </div>
      </div>
  </div>`);
}

var curr = undefined;

function activateToggles() {
  $('[data-toggle="collapse"]').click(function() {
    console.log(curr);
    console.log($(this));
    if ((curr !== undefined) && ($(this).attr('id') == curr)) {
      return;
    }
  
    curr = $(this).attr('id');
  
    console.log(curr);
  
    if (curr !== 'back_button') {
      executeCollapse(curr).then(() => {
        curr = undefined;
      });
    } else {
      curr = undefined;
    }
  });
}

function renderForum() {
  db.ref('posts').once('value', snap => {
    forum = [];
    for (elem in snap.val()) {
      let dict = snap.val()[elem];
      console.log(dict);
      let shown_content = dict.content.slice(0, Math.min(dict.content.length, 128));
      let num_eyes = Math.floor(Math.random() * 1000);
      let nl_time = explainTime(dict.timestamp, 'ago');
      forum.push(`
        <div class="card mb-2">
          <div class="card-body p-2 p-sm-3">
            <div class="media forum-item">
              <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="mr-3 rounded-circle" width="50" alt="User" />
              <div class="media-body">
                <h6><a id='${elem}' href="#" data-toggle="collapse" data-target=".forum-content" class="text-body">${dict.title}</a></h6>
                <p class="text-secondary">
                  ${shown_content}
                </p>
                <p class="text-muted"><a href="javascript:void(0)">drewdan</a> replied <span class="text-secondary font-weight-bold">${nl_time}</span></p>
              </div>
              <div class="text-muted small text-center align-self-center">
                <span class="d-none d-sm-inline-block"><i class="far fa-eye"></i> ${num_eyes}</span>
                <span><i class="far fa-comment ml-2"></i> 3</span>
              </div>
            </div>
          </div>
        </div>`);
    }

    forum.push(`
      <ul class="pagination pagination-sm pagination-circle justify-content-center mb-0">
        <li class="page-item disabled">
          <span class="page-link has-icon"><i class="material-icons">chevron_left</i></span>
        </li>
        <li class="page-item"><a class="page-link" href="javascript:void(0)">1</a></li>
        <li class="page-item active"><span class="page-link">2</span></li>
        <li class="page-item"><a class="page-link" href="javascript:void(0)">3</a></li>
        <li class="page-item">
          <a class="page-link has-icon" href="javascript:void(0)"><i class="material-icons">chevron_right</i></a>
        </li>
      </ul>`);

    $('#forum').html(forum.join('\n'));

    activateToggles();
  });
}

renderForum();
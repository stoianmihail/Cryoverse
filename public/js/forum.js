var parsed_url = parse_url(window.location.href);

$('#new-discussion_button').on('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  // Redirect to new topic with the same tag.
  disableScreen();
  let future_location = 'post.html' + ('tag' in parsed_url ? '?tag=' + parsed_url['tag'] : '');
  retrieveCurrentUser(changeWindowLocation, {'location' : future_location}, future_location, () => enableScreen());
});

  
async function renderThread(id) {
  const snap = await db.ref(`posts/${id}`).once('value');
  let dict = snap.val();
  let nl_time = explainTime(dict.timestamp, 'ago');
  let tagsWithColors = [];
  if (dict.tags.length) {
    for (tag of dict.tags.split(',')) {
      tagsWithColors.push(`<mark style='background: ${tag2color(tag)}'>#${tag}</mark>`);
    }
  }

  let num_stars = Math.floor(Math.random() * 500);
  $('#thread').html(`
    <div class="card mb-2">
      <div class="card-body">
          <div class="media forum-item">
              <a href="javascript:void(0)" class="card-link">
                  <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle" width="50" alt="User" />
                  <small class="d-block text-center text-muted"></small>
              </a>
              <div class="media-body ml-3">
                  <a href="javascript:void(0)" class="text-secondary">${dict.user}</a>
                  <small class="text-muted ml-2">${nl_time}</small>
                  <h5 class="mt-1">${dict.title}</h5>
                  <div class="mt-3 font-size-sm">
                      <p>${dict.content}</p>
                  </div>
                  ${(tagsWithColors.length) ? '<p>Tags: ' + tagsWithColors.join(' ') + '<p>' : ''}
                  <p>Actions: <button class="btn-sm btn far fa-star"> Star (${num_stars})</button><button class="btn-sm btn far fa-bookmark"> Bookmark</button><button id='${id}' class="btn-sm btn fa fa-reply" onclick='reply(this);'> Reply</button></p>
              </div>
              <div class="text-muted small text-center">
                  <span class="d-none d-sm-inline-block"><i class="far fa-eye"></i> 19</span>
                  <span><i class="far fa-comment ml-2"></i> 3</span>
              </div>
          </div>
      </div>
  </div>`);

  // Sort the responses based on timestamp.
  items = Object.keys(dict.responses ? dict.responses : {}).map(function(key) {
    return [key, dict.responses[key]];
  }).sort(function(first, second) {
    return second[1].timestamp - first[1].timestamp;
  });

  for ([key, response] of items) {
    let local_time = explainTime(response.timestamp, 'ago');
    $(`#thread`).append(`
      <div class="card mb-2">
        <div class="card-body">
            <div class="media forum-item">
                <a href="javascript:void(0)" class="card-link">
                    <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle" width="50" alt="User" />
                    <small class="d-block text-center text-muted"></small>
                </a>
                <div class="media-body ml-3">
                    <a href="javascript:void(0)" class="text-secondary">${response.user}</a>
                    <small class="text-muted ml-2">${local_time}</small>
                    <div class="mt-3 font-size-sm">
                        <p>${response.content}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`)
  }
}

function registerReply(elem) {
  async function createReply(elem, args) {
    // Fetch the thread id.
    let thread_id = elem.id.split('_')[1];
    console.log('trhead_id=' + thread_id)

    // Set the user.
    args['user'] = current_user.username;
  
    // Get a key for a new invoice.
    let key = db.ref(`posts/${thread_id}`).child('responses').push().key;
  
    // And update.
    let updates = {};
    updates['/posts/' + thread_id + '/responses/' + key] = args;
    return [thread_id, db.ref().update(updates)];
  }

  disableScreen();
  createReply(elem, {
    content : elem.value,
    timestamp : getTimestamp()
  }).then((ret) => {
    // Delete the element.
    deleteElement(document.getElementById(`response_${ret[0]}`));

    // Reset thread.
    renderThread(ret[0]).then(() => {
      enableScreen();
    });
  });
}

function reply(elem) {
  // Retrieve the user.
  disableScreen();
  retrieveCurrentUser((args) => {
    let id = args.id;
    $('#thread').append(`
      <div id='response_${id}' class="card mb-2">
          <div class="card-body">
              <div class="media forum-item">
                  <a href="javascript:void(0)" class="card-link">
                      <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle" width="50" alt="User" />
                      <small class="d-block text-center text-muted"></small>
                  </a>
                  <div class="container">
                    <div class="modal-body">
                      <div class="form-group">
                          <div class="textfield-box my-2">
                              <textarea class="form-control textarea-autosize" id="content_${id}" rows="1" placeholder="Enter response.."></textarea>
                          </div><br>
                      </div>
                      <div class="custom-file form-control-sm mt-3" style="max-width: 300px;">
                          <input type="file" class="custom-file-input" id="customFile" multiple="" />
                          <label class="custom-file-label" for="customFile">Attachment</label>
                      </div>
                    </div>
                    <div class="modal-footer">
                        <button id='cancel_${id}' type="button" class="btn btn-light" data-dismiss="modal"
                          onclick='deleteElement(document.getElementById("response_${id}"));'>Cancel</button>
                        <button type="button" class="btn btn-success" id="post_button"
                          onclick='registerReply(document.getElementById("content_${id}"));'>Reply</button>
                    </div>
                  </div>
              </div>
          </div>
      </div>`);
  }, { id : elem.id }, window.location.href, () => {});
}

async function executeCollapse(id) {
  await renderThread(id);
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
    // Sort the snap based on timestamp.
    items = Object.keys(snap.val()).map(function(key) {
      return [key, snap.val()[key]];
    }).sort(function(first, second) {
      return second[1].timestamp - first[1].timestamp;
    });

    forum = [];
    for ([elem, dict] of items) {
      let shown_content = dict.content.slice(0, Math.min(dict.content.length, 128));
      let num_eyes = Math.floor(Math.random() * 1000);
      let nl_time = explainTime(dict.timestamp, 'ago');

      let tagsWithColors = [];
      if (dict.tags.length) {
        for (tag of dict.tags.split(',')) {
          tagsWithColors.push(`<mark style='background: ${tag2color(tag)}'>#${tag}</mark>`);
        }
      }

      forum.push(`
        <div class="card mb-2">
          <div class="card-body p-2 p-sm-3">
            <div class="media forum-item">
              <a href="javascript:void(0)" class="card-link">
                <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle" width="50" alt="User" />
                <small class="d-block text-center text-muted">${dict.user}</small>
              </a>
              <div class="media-body">
                <h6><a id='${elem}' href="#" data-toggle="collapse" data-target=".forum-content" class="text-body">${dict.title}</a></h6>
                <p class="text-secondary">
                  ${shown_content}
                </p>
                <p class="text-muted"><a href="javascript:void(0)">drewdan</a> replied <span class="text-secondary font-weight-bold">${nl_time}</span></p>
                ${(tagsWithColors.length) ? '<p>Tags: ' + tagsWithColors.join(' ') + '<p>' : ''}
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
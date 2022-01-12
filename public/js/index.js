var parsed_url = parse_url(window.location.href);

function renderForum() {
  function get_last_reply(responses) {
    if (!responses)
      return undefined;
    let max = -1;
    let best = undefined;
    for (id in responses) {
      if (responses[id].timestamp > max) {
        max = responses[id].timestamp;
        best = id;
      }
    }
    return responses[best];
  }

  db.ref('posts').once('value', snap => {
    Promise.all(Object.keys(snap.val() ? snap.val() : {}).map(key => fetchProfile(key, snap.val()[key])))
    .then((ret) => {
      ret.sort(function(first, second) {
        return second.snap.timestamp - first.snap.timestamp;
      });

      console.log(ret);

      forum = [];
      for (elem of ret) {
        console.log('elem=');
        console.log(elem);
        let dict = elem.snap;
        let shown_content = dict.content.slice(0, Math.min(dict.content.length, 128));
        let num_eyes = Math.floor(Math.random() * 1000);

        let tags = [];
        if (dict.tags.length) {
          for (tag of dict.tags.split(',')) {
            tags.push(`#${tag}`);
          }
        }

        let add_info = '';
        if (dict.responses) {
          console.log(dict.responses);
          let last_reply = get_last_reply(dict.responses);
          console.log(last_reply);
          add_info = `<p class="text-muted"><a href="javascript:void(0)">${last_reply.user.username}</a> replied <span class="text-secondary font-weight-bold">${explainTime(last_reply.timestamp, 'ago')}</span></p>`;
        } else {
          console.log(`whatt??????`);
          console.log(elem.snap.user);
          add_info = `<p class="text-muted"><a href="javascript:void(0)">${elem.snap.user.username}</a> posted <span class="text-secondary font-weight-bold">${explainTime(dict.timestamp, 'ago')}</span></p>`;
        }

        forum.push(`
          <div class="card mb-2">
            <div class="card-body p-2 p-sm-3">
              <div class="media forum-item">
                  <a href="javascript:void(0)" class="card-link">
                  <center>
                    <img id='profile.${elem}' src="${elem.url}" class="rounded-circle" width="50" alt="User" />
                  </center>
                  <small class="d-block text-center text-muted">${elem.snap.user.username}</small>
                </a>
                <div class="media-body" style="margin-left: 20px;">
                  <h6>${dict.title}</h6>
                  <p class="text-secondary">${shown_content}</p>
                  <div id='status.${elem.id}'>${add_info}</div>
                  ${(tags.length) ? '<p><span class="text-secondary">Tags: </span>' + tags.join(' ') + '</p>' : ''}
                </div>
                <div class="text-muted small text-center align-self-center">
                  <span class="d-none d-sm-inline-block"><i class="far fa-eye"></i> ${num_eyes}</span>
                  <span><i class="far fa-comment ml-2"></i> 3</span>
                </div>
              </div>
            </div>
          </div>`);
      }

      // Build the forum.
      $('#forum').html(forum.join('\n'));
  
      for (elem of ret) {
        db.ref('posts').child(elem.id).on('value', snap => {
          // No snap?
          if (!snap.exists()) return;

          console.log('[refresh] snap=' + snap.val());

          // Refresh the status.
          let add_info = '';
          if (snap.val().responses) {
            let last_reply = get_last_reply(snap.val().responses);
            add_info = `<p class="text-muted"><a href="javascript:void(0)">${last_reply.user.username}</a> replied <span class="text-secondary font-weight-bold">${explainTime(last_reply.timestamp, 'ago')}</span></p>`;
          } else {
            add_info = `<p class="text-muted"><a href="javascript:void(0)">${snap.val().user.username}</a> posted <span class="text-secondary font-weight-bold">${explainTime(snap.val().timestamp, 'ago')}</span></p>`;
          }

          // And reset the html.
          document.getElementById(`status.${snap.key}`).innerHTML = add_info;
        });
      }
    });
  });
}

renderForum();
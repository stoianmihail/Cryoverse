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

        let tagsWithColors = [];
        if (dict.tags.length) {
          for (tag of dict.tags.split(',')) {
            tagsWithColors.push(`<mark style='background: ${tag2color(tag)}'>#${tag}</mark>`);
          }
        }

        let add_info = '';
        if (dict.responses) {
          console.log(dict.responses);
          let last_reply = get_last_reply(dict.responses);
          console.log(last_reply);
          add_info = `<p class="text-muted">${last_reply.user.username} replied <span class="text-secondary font-weight-bold">${explainTime(last_reply.timestamp, 'ago')}</span></p>`;
        } else {
          console.log(`whatt??????`);
          console.log(elem.snap.user);
          add_info = `<p class="text-muted">${elem.snap.user.username} posted <span class="text-secondary font-weight-bold">${explainTime(dict.timestamp, 'ago')}</span></p>`;
        }

        forum.push(`
          <div class="border border-light p-2 mb-3 shadow">
            <div class="d-flex align-items-start">
              <img id='profile.${elem}' class="me-2 avatar-sm rounded-circle" src="${elem.url}" alt="Profile"/>
              <div class="w-100">
                <h6 class="m-0">${elem.snap.user.username}</h6>
                <div id='status.${elem.id}'>${add_info}</div>
              </div>
            </div>
            <h5 style="margin-left: 50px;"><a href="#">${dict.title}</a></h5>
            <div style="margin-top: 25px;">
              ${(tagsWithColors.length) ? '<p>Tags: ' + tagsWithColors.join(' ') + '<p>' : ''}
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
            add_info = `<p class="text-muted">${last_reply.user.username} replied <span class="text-secondary font-weight-bold">${explainTime(last_reply.timestamp, 'ago')}</span></p>`;
          } else {
            add_info = `<p class="text-muted">${snap.val().user.username} posted <span class="text-secondary font-weight-bold">${explainTime(snap.val().timestamp, 'ago')}</span></p>`;
          }

          // And reset the html.
          document.getElementById(`status.${snap.key}`).innerHTML = add_info;
        });
      }
    });
  });
}

renderForum();
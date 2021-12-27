const ACCOUNTING_COMPANY = 1;

// The current user.
var current_user = { 'uid' : undefined, 'company' : undefined, 'type' : undefined};

auth.onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    console.log("Logged in!");
    console.log('uid=' + firebaseUser.uid);
  } else {
    console.log("Not logged in!");
  }
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getPosition(string, subString, index) {
  return string.split(subString, index).join(subString).length;
}

function prettify(invoiceName) {
  return invoiceName.slice(getPosition(invoiceName, '_', 2) + 1, invoiceName.length);
}

async function fetchInvoice(invoiceId, withUrl) {
  const snap = await db.ref('invoices').child(invoiceId).once('value');
  
  // TODO: throw error 
  if (!snap.exists()) return undefined;

  // Should we also fetch the url?
  if (withUrl) {
    url = await storage.ref('invoices').child(snap.val().invoice).getDownloadURL();
    return {'id' : invoiceId, 'name' : prettify(snap.val().invoice), 'url' : url, 'snap' : snap.val()};
  }
  return {'id' : invoiceId, 'name' : prettify(snap.val().invoice), 'snap' : snap.val()};
}

function exportData(folderName, target_uid, target_company) {
  // Disable screen.
  disableScreen();

  db.ref('folders').child(target_uid + '/' + folderName).once('value', snap => {
    if (!snap.exists()) {
      // TODO: inform the user!
      enableScreen();
      return;
    }

    // TODO: detect errors and enable the screen in those cases.
    Promise.all(snap.val().map(invoiceId => fetchInvoice(invoiceId, false)))
    .then((ret) => {
      let data = [];
      for (let index = 0; index !== ret.length; ++index) {
        let local_data = ret[index].snap.data;
        data.push({
          "id" : (index + 1),
          "supplier": local_data.supplier,
          "order no." : local_data.number,
          "date" : local_data.date,
          "total" : (local_data.total ? local_data.total[1] : "0")
        });
      }

      // And build the excel.
      const file_type = 'xlsx';
      const ws = XLSX.utils.json_to_sheet(data, {sheet: "Data"});
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'test');
      let fileName = folderName + '.' + file_type;
      if (target_company !== current_user.company)
        fileName = target_company + '_' + fileName;
      XLSX.writeFile(wb, fileName);

      // And enable the screen.
      enableScreen();
    });
  });
}

async function buildFolder(folderName, folderContent, target_uid, target_company) {
  const ret = await Promise.all(Array.from(folderContent).map(invoiceId => fetchInvoice(invoiceId, true)));
  const field_order = ['supplier', 'number', 'date', 'total'];

  function buildDataPreview(data) {
    return Array.from(field_order).map(field => {
      if (field !== 'total') {
        return `<p><code>${capitalizeFirstLetter(field)}: </code>${data[field]}</p>`;
      } else {
        // TODO: add also currency (back-end should support it better)
        // Get only the total.
        return `<p><code>${capitalizeFirstLetter(field)}: </code>${data[field][1]}</p>`;
      }
    }).join('\n');
  }

  function buildIronStatus(status) {
    let iron_status = undefined;
    if (parseInt(status) == 1)
      iron_status = {'icon' : 'nc-icon nc-check-2', 'color' : 'green'};
    else if (parseInt(status) == 0)
      iron_status = {'icon' : 'nc-icon nc-refresh-69', 'color' : 'orange'};
    else if (parseInt(status) == -1)
      iron_status = {'icon' : 'nc-icon nc-simple-remove', 'color' : 'red'};
    return iron_status;
  }

  // TODO: put `on.value` for each file!
  function buildAccordionInvoice(dict)
  // Build the accordion for an invoice.
  {
    // Fetch data.
    let data = ``;
    if (parseInt(dict.snap.status) == 1)
      data = buildDataPreview(dict.snap.data);

    // Set the iron status.
    // TODO: fix when status === -1!
    let iron_status = buildIronStatus(dict.snap.status);

    // And create the panel for this invoice.
    let local_panel = `
      <div class="accordion-item">
        <h2 class="accordion-header" id="accordion_${folderName}_${dict.id}">
          <style is = "custom-style">
            .small { height: 20px; width: 20px; }
          </style>
          <button type="button" class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapse_${dict.id}">
          <i id="iron_${dict.id}" class="${iron_status.icon}" style="color: ${iron_status.color};"></i>&nbsp;${dict.name}</button>									  
        </h2>
        <div id="collapse_${dict.id}" class="accordion-collapse collapse" data-bs-parent="#folder_${folderName}">
          <div class="card-body">
            <p><code>Invoice: </code><a href="${dict.url}" target="_blank">Open</a></p>
            <div id="data_${dict.id}">
              ${data}
            </div>
          </div>
        </div>
      </div>`;
    return local_panel;
  }

  // Gather all accordions.
  let invoices = ``;
  let acc_ids = [];
  for (let index = 0; index !== ret.length; ++index) {
    acc_ids.push(ret[index].id);
    invoices += buildAccordionInvoice(ret[index]);
    invoices += `\n`;
  }

  // Add listeners.
  for (let index = 0; index !== acc_ids.length; ++index) {
    db.ref('invoices').child(acc_ids[index]).on('value', snap => {
      // Put data.
      if ($('#data_' + snap.key)) {
        if (parseInt(snap.val().status) === 1) {
          $('#data_' + snap.key).html(buildDataPreview(snap.val().data));
        } else {
          // TODO: what happens when `status === -1`? 
        }
      }

      // Update the iron icon.
      if ($('#iron_' + snap.key)) {
        let iron_status = buildIronStatus(snap.val().status);
        $('#iron_' + snap.key).attr('class', iron_status.icon);
        $('#iron_' + snap.key).css('color', iron_status.color);
      }
    });
  }

  // And build the folder accordion.
  let panel = `
    <div class="accordion-item">
      <h2 class="accordion-header" id="accordion_${folderName}">
        <button type="button" class="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapse_${folderName}">${folderName}</button>									
      </h2>
      <div id="collapse_${folderName}" class="accordion-collapse collapse" data-bs-parent="#folders">
        <div class="card-body">
          <button id="excel_${folderName}" onclick='exportData("${folderName}", "${target_uid}", "${target_company}");' class="btn btn-default xls" style="margin-bottom: 25px;">Export</button>
          <div class="accordion" id="folder_${folderName}">
            ${invoices}
          </div>
        </div>
      </div>
    </div>`;
  return panel;
}

// ******************************** S c r e e n  U t i l s ********************************
function disableScreen() {
  // Disable the wrapper.
  $('.wrapper').css('pointer-events', 'none');
  
  // Alternative:
  // $('.sidebar').css('pointer-events', 'none');
  // document.getElementsByTagName('body')[0].style.pointerEvents = 'none'
  
  // Enable loader.
  $('#loader').css('display', 'block');
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function release() {
  // Enable the wrapper.
  $('.wrapper').css('pointer-events', '');
}

function enableScreen() {
  $('#loader').css('display', 'none');
  release();
}

// ******************************** U R L  U t i l s ********************************
function parse_url(url) {
  if (url.indexOf('?') === -1)
    return {};
  let split = url.substring(url.indexOf('?') + 1).split('&');
  let parsed = {};
  split.forEach(element => {
    let content = element.split('=');
    parsed[content[0]] = content[1];
  });
  return parsed;
}

// ******************************** L o g i n  U t i l s ********************************
var hasIssuedSignOut = false;
$('#close-button').on('click', e => {
  e.stopPropagation();
  e.preventDefault();

  hasIssuedSignOut = true;
  auth.signOut()
  .then(() => {
    window.location = 'index.html';
  });
});


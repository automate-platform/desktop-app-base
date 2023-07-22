let base_url = 'http://127.0.0.1:1204';
let btnOath = document.querySelector('.oauth')
let username = document.querySelector('#username')
let pass = document.querySelector('#password')
var $ = require("jquery");
var DataTable = require("datatables.net")(window, $)
var buttons = require('datatables.net-buttons-dt')(window, $);
require('jszip');
require('pdfmake');
require('datatables.net-buttons-dt');
require('datatables.net-buttons/js/buttons.html5.js');
btnOath.addEventListener('click', () => {
    btnOath.disabled = true;

    // Enable the button after 3 seconds
    setTimeout(function () {
        btnOath.disabled = false;
    }, 3000);
    let url = document.querySelector('#url').value
    let username = document.querySelector('#username').value
    let pass = document.querySelector('#password').value
    if ($('#allprj').DataTable()) {
        $('#allprj').DataTable().destroy();
        document.querySelector('#allprj tbody').innerHTML = '';
        document.querySelector('#allprj').style.display = 'none';
    }
    if ($('#prj-by-id').DataTable()) {
        $('#prj-by-id').DataTable().destroy();
        document.querySelector('#prj-by-id tbody').innerHTML = '';
        document.querySelector('#prj-by-id').style.display = 'none';
    }
    if ($('#merge-active-by-id').DataTable()) {
        $('#merge-active-by-id').DataTable().destroy();
        document.querySelector('#merge-active-by-id tbody').innerHTML = '';
        document.querySelector('#merge-active-by-id').style.display = 'none';
    }
    document.querySelector('.getList').style.display = 'none'
    if (pass !== '' || username !== '' || url !== '') {
        // console.log(pass);
        var myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Node-RED-API-Version", "v2");
        myHeaders.append("Content-Type", "application/json");
        let auth = {
            url: url,
            username: username,
            password: pass
        }
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(auth),
            redirect: 'follow'

        };
        fetch(`${base_url}/oauth`, requestOptions)
            .then(response => response.json()).then(result => {
                document.querySelector('.error').innerHTML = '';
                if (!result.error) {
                    if ($('#allprj').DataTable()) {
                        $('#allprj').DataTable().destroy();
                        document.querySelector('#allprj tbody').innerHTML = '';
                        document.querySelector('#allprj').style.display = 'none';
                    }
                    if ($('#prj-by-id').DataTable()) {
                        $('#prj-by-id').DataTable().destroy();
                        document.querySelector('#prj-by-id tbody').innerHTML = '';
                        document.querySelector('#prj-by-id').style.display = 'none';
                    }
                    if ($('#merge-active-by-id').DataTable()) {
                        $('#merge-active-by-id').DataTable().destroy();
                        document.querySelector('#merge-active-by-id tbody').innerHTML = '';
                        document.querySelector('#merge-active-by-id').style.display = 'none';
                    }
                    document.querySelector('.getList').style.display = 'block'
                } else {
                    document.querySelector('.error').innerHTML = 'Authorization failed'
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    }
});
username.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        btnOath.click();
    }
});
pass.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        btnOath.click();
    }
});


function getList() {
    document.querySelector('#allprj').style.display = 'block';
    if ($('#allprj').DataTable()) {
        $('#allprj').DataTable().destroy();
    }
    if ($('#prj-by-id').DataTable()) {
        $('#prj-by-id').DataTable().destroy();
        document.querySelector('#prj-by-id tbody').innerHTML = '';
        document.querySelector('#prj-by-id').style.display = 'none';
    }
    if ($('#merge-active-by-id').DataTable()) {
        $('#merge-active-by-id').DataTable().destroy();
        document.querySelector('#merge-active-by-id tbody').innerHTML = '';
        document.querySelector('#merge-active-by-id').style.display = 'none';
    }
    fetch(`${base_url}/listtable`).then(response => response.json()).then(result => {
        console.log(result);
        $(document).ready(function () {
            $('#allprj').DataTable({
                data: result,
                columns: [
                    { data: 'id' },
                    { data: 'name' }
                ]
            });
        });
    }).catch(function (error) {
        console.error(error);
    });
}




$('#allprj tbody').on('click', 'tr', function () {
    document.querySelector('.loader').style.display = 'block'
    document.querySelector('.background').style.display = 'block'
    setTimeout(() => {
        document.querySelector('.loader').style.display = 'none'
        document.querySelector('.background').style.display = 'none'
    }, 1000)
    if ($('#prj-by-id').DataTable()) {
        $('#prj-by-id').DataTable().destroy();
        document.querySelector('#prj-by-id tbody').innerHTML = '';
        document.querySelector('#prj-by-id').style.display = 'none';
    }
    if ($('#merge-active-by-id').DataTable()) {
        $('#merge-active-by-id').DataTable().destroy();
        document.querySelector('#merge-active-by-id tbody').innerHTML = '';
        document.querySelector('#merge-active-by-id').style.display = 'none';
    }
    document.querySelector('#prj-by-id').style.display = 'block';
    let row = this;
    let prjID = row.querySelectorAll('td')[0].innerHTML;
    fetch(`${base_url}/merger/${prjID}`)
        .then(response => response.json()).then(result => {
            $('#prj-by-id').DataTable({
                data: result,
                columns: [
                    { data: 'id' },
                    { data: 'iid' },
                    { data: 'title' },
                    { data: 'merge_user.username' },
                    { data: 'author.username' },
                    { data: 'created_at' },
                    { data: 'description' },
                    { data: 'state' }
                ],
                dom: 'Bfrtip',
                buttons: [
                    'excel', 'pdf', 'csv'
                ]
            });

        });
});

$('#prj-by-id tbody').on('click', 'tr', function () {
    document.querySelector('.loader').style.display = 'block'
    document.querySelector('.background').style.display = 'block'
    setTimeout(() => {
        document.querySelector('.loader').style.display = 'none'
        document.querySelector('.background').style.display = 'none'
    }, 1000)
    if ($('#merge-active-by-id').DataTable()) {
        $('#merge-active-by-id').DataTable().destroy();
        document.querySelector('#merge-active-by-id tbody').innerHTML = '';
        document.querySelector('#merge-active-by-id').style.display = 'none';
    }
    document.querySelector('#merge-active-by-id').style.display = 'block';
    let row = this;
    let mergeIID = row.querySelectorAll('td')[1].innerHTML;
    fetch(`${base_url}/merge/act/${mergeIID}`)
        .then(response => response.json()).then(result => {
            $('#merge-active-by-id').DataTable({
                data: result,
                columns: [
                    { data: "notes[0].noteable_type" },
                    { data: "notes[0].author.username" },
                    { data: "notes[0].cmt.activity_header" },
                    { data: "notes[0].created_at" }
                ],
                dom: 'Bfrtip',
                buttons: [
                    'excel', 'pdf', 'csv'
                ]
            })
        })
})
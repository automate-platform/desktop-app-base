
let base_url = 'http://127.0.0.1:1204';
let btnOath = document.querySelector('.oauth')
let btnLogin = document.querySelector('.authen')
let username = document.querySelector('#Username')
let tokenprivate = document.querySelector('#TokenPrivate')

btnOath.addEventListener('click', () => {
    btnOath.disabled = true;
    
    if ($('#repositoryGit').DataTable()) {
        $('#repositoryGit').DataTable().destroy();
        document.querySelector('#repositoryGit tbody').innerHTML = '';
        document.querySelector('#repositoryGit').style.display = 'none';
        $('#repositoryGit tbody').empty();
    }
    if ($('#prj-by-id-G').DataTable()) {
        $('#prj-by-id-G').DataTable().destroy();
        document.querySelector('#prj-by-id-G tbody').innerHTML = '';
        document.querySelector('#prj-by-id-G').style.display = 'none';
    }
   

    document.querySelector('.getList').style.display = 'none'
   
    setTimeout(function () {
        btnOath.disabled = false;
    }, 3000);
    let Url = document.querySelector('#UrlWeb').value.trim();
    let user = document.querySelector('#Username').value.trim();
    if(Url == ''|| Url==null){
        Url = "github.com"
    }
    let TokenPrivate = document.querySelector('#TokenPrivate').value.trim();
    if (tokenprivate !== '' || user !== '' || Url !== '') {
        // console.log(pass);
        var myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Node-RED-API-Version", "v2");
        myHeaders.append("Content-Type", "application/json");
        let auth = {
            url : Url,
            user: user,
            tokenprivate: TokenPrivate
        }
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(auth),
            redirect: 'follow'

        };
        fetch(`${base_url}/oauth_002`, requestOptions)
            .then(response => response.json()).then(result => {
                document.querySelector('.error').innerHTML = '';
                  
                if (!result.error) {
                    setTimeout(function () {
                        document.querySelector('.getList').style.display = 'block';
                    }, 1000);
                } else {
                    document.querySelector('.error').innerHTML = result.error
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    }
});

function getList() {
    document.querySelector('.loader').style.display = 'block'
    document.querySelector('.background').style.display = 'block'
    setTimeout(() => {
        document.querySelector('.loader').style.display = 'none'
        document.querySelector('.background').style.display = 'none'
    }, 1000)
    document.querySelector('#repositoryGit').style.display = 'block';
    if ($('#repositoryGit').DataTable()) {
        $('#repositoryGit').DataTable().destroy();

    }
    fetch(`${base_url}/repox002`).then(response => response.json()).then(result => {
        console.log(result);
            $(document).ready(function () {
                $('#repositoryGit').DataTable({
                    data: result,
                    columns: [
                        { data: 'id' },
                        { data: 'name' },
                        { data: 'private' },
                        { data: 'owner.login' }
                    ],
                        dom: '<"Repo">frtip',
                        
                    });
                    document.querySelector('div.Repo').innerHTML = '<h1>Repository GitHub table</h1>';
            });
        }).catch(function (error) {
            console.error(error);
        });
    }
username.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        btnOath.click();
    }
});
tokenprivate.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        btnOath.click();
    }
});

   


$('#repositoryGit tbody').on('click', 'tr', function () {
        document.querySelector('.loader').style.display = 'block'
        document.querySelector('.background').style.display = 'block'
        setTimeout(() => {
            document.querySelector('.loader').style.display = 'none'
            document.querySelector('.background').style.display = 'none'
        }, 1000)
        document.querySelector('#prj-by-id-G').style.display = 'block';
        if ($('#prj-by-id-G').DataTable()) {
            $('#prj-by-id-G').DataTable().destroy();

        }
        let row = this;
        let nameRepo = row.querySelectorAll('td')[1].innerHTML;
        let login = row.querySelectorAll('td')[3].innerHTML;
        fetch(`${base_url}/pullx002?name=${nameRepo}&login=${ login }`)
            .then(response => response.json()).then(result => {
                //const data = result.length > 0 ? result : getFallbackData(); // Use fallback data if result.values is empty

                $('#prj-by-id-G').DataTable({
                  
                    data: result,
                    columns: [
                        { data: 'id' },
                        { data: 'title' },
                        { data: 'user.login' },
                        { data: 'created_at' },
                        { data: 'body' },
                        { data: 'state' }
                    ],
                    dom: '<"pull">Bfrtip',
                    buttons: [
                        'copy', 'csv', 'excel', 'pdf', 'print'
                    ]
                });
                document.querySelector('div.pull').innerHTML = '<h1>Pull request table</h1>';
            });


    });





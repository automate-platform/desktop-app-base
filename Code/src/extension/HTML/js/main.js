let data = null;
let files = [];
document.getElementById("folder").addEventListener(
    "change",
    function (event) {
        var output = document.querySelector("#list-file");
        var data = event.target.files;
        files = event.target.files;
        for (var i = 0; i < data.length; i++) {
            if (data[i].webkitRelativePath.endsWith(".xlsx")) {
                var item = document.createElement("li");
                item.className = "list-group-item";

                var inputElm = document.createElement("input");
                inputElm.className = "form-check-input me-1";
                inputElm.type = "checkbox";
                inputElm.id = "file-" + i;

                var labelElm = document.createElement("label");
                labelElm.className = "form-check-label";
                labelElm.htmlFor = "file-" + i;
                labelElm.innerHTML = data[i].webkitRelativePath;

                item.appendChild(inputElm);
                item.appendChild(labelElm);

                output.appendChild(item);
            }
        }
    },
    false
);

document.getElementById("output-path").addEventListener(
    "click",
    function (event) {
        document.getElementById("output").click();
    },
    false
);

function sendSupport() {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json, text/plain, */*");

    var formData = new FormData();
    const message = document.getElementById("support-message").value;
    const data = {
        type: "message",
        attachments: [
            {
                contentType: "application/vnd.microsoft.card.adaptive",
                content: {
                    type: "AdaptiveCard",
                    body: [{ type: "TextBlock", text: message }],
                    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                    version: "1.0",
                },
            },
        ],
    };

    formData.append("data", JSON.stringify(data));

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
    };
    fetch("{{{payload.baseUrl}}}/support", requestOptions)
        .then((response) => {
            response.text();
            document.getElementById("support-message").value = "";
        })
        .then((result) => {
            console.log(result);
            document.getElementById("support-message").value = "";
        })
        .catch((error) => console.log("error", error));
}
function onSaveConfig() {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json, text/plain, */*");

    var formData = new FormData();
    const template = document.getElementById("file-template").value;
    const outputPath = document.getElementById("output-path").value;
    const data = {
        "template": template,
        "outputPath": outputPath
    };

    formData.append("data", JSON.stringify(data));

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
    };
    fetch("{{{payload.baseUrl}}}/config", requestOptions)
        .then((response) => {
            response.text();
        })
        .then((result) => {
            console.log(result);
            alert('save config success');
        })
        .catch((error) => console.log("error", error));
}

function importFile() {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json, text/plain, */*");

    var formData = new FormData();

    for (var i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    formData.append("config", JSON.stringify(data));

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
    };
    fetch("{{{payload.baseUrl}}}/import-source", requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.log("error", error));
}

function genDDFile() {
    var spinnerDiv = document.getElementById('js-spinner');
    var textAlert = document.getElementById('js-db-alert');
    spinnerDiv.classList.remove("d-none");
    textAlert.innerHTML = '';


    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json, text/plain, */*");

    var requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };
    fetch("http://127.0.0.1:1204/gendd", requestOptions)
        .then((response) => {
            spinnerDiv.classList.add("d-none");
            textAlert.innerHTML = 'generating BD success';
        })
        .then((result) => console.log(result))
        .catch((error) => console.log("error", error));
}

function handleTemplate() {
    document.getElementById("file-template-hidden").click();
}

document.getElementById("file-template-hidden").addEventListener(
    "change",
    function (event) {
        var data = event.target.files;
        document.getElementById("file-template").value = data[0].name;
    },
    false
);

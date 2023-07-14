const path = require('path')
let path_settings = path.join(__dirname, '../../pap_settings.js')
let settings = require(path_settings)

let templateListNotInstall = document.querySelector('.app-not-installed .monaco-list-rows').innerHTML;
let templateListInstalled = document.querySelector('.app-installed .monaco-list-rows').innerHTML;
let templateDetail = document.querySelector('.editor-container').innerHTML;
let tabHeader = document.querySelector('.tabs-container').innerHTML;


let base_url = 'http://' + settings.uiHost + ':' + settings.uiPort;
let admin_root = settings.httpAdminRoot;

let recommendApp = [];
let installedApp = [];
let currentApp = {};

window.onload = function () {
    sessionStorage.clear();
    document.querySelector('.tabs-container').innerHTML = '';
    fetch(base_url + '/app')
        .then(response => response.json()).then(data => {
            fetch(base_url + '/installed').then(response => response.json()).then(installed => {
                let data_not_installed = data.filter(item1 => !installed.some(item2 => item1._id === item2._id));
                document.querySelector('.app-not-installed .monaco-list-rows').innerHTML = '';
                data_not_installed.forEach(element => {
                    element.isInstall = false;
                    const rendered = Mustache.render(templateListNotInstall, element);
                    document.querySelector('.app-not-installed .monaco-list-rows').innerHTML += rendered;
                });
            }).catch(function (error) {
                console.error(error);
            });
        })
        .catch(function (error) {
            console.error(error);
        });

    fetch(base_url + '/installed').then(response => response.json()).then(installed => {
        document.querySelector('.app-installed .monaco-list-rows').innerHTML = '';
        installed.forEach(element => {
            element.isInstall = true;
            const rendered = Mustache.render(templateListInstalled, element);
            document.querySelector('.app-installed .monaco-list-rows').innerHTML += rendered;
        });
    }).catch(function (error) {
        console.error(error);
    });

}


function openDetail(_id) {
    let tem = document.querySelector('.monaco-scrollable-element').innerHTML
    if (tem.trim() === "") {
        var newDiv = document.createElement("div");
        newDiv.className = "tabs-container";
        var container = document.querySelector('.monaco-scrollable-element');
        container.appendChild(newDiv);
    }
    document.querySelector('.split-view-view').style.display = 'block';
    fetch(base_url + '/app/' + _id)
        .then(response => response.json()).then(data => {
            fetch(base_url + '/installed').then(response => response.json()).then(installed => {
                data.isInstall = installed.some(item => item._id === data._id);
                data.readme = marked(data.readme);
                document.querySelector('.editor-container').innerHTML = '';
                const renderedData = Mustache.render(templateDetail, data);
                const renderedTab = Mustache.render(tabHeader, data);
                const allTabs = document.querySelectorAll('.tab-actions-right');
                // allTabs.forEach((tab) => {
                //     if (!tab.id === (_id + ' ').trim()) {
                //         document.querySelector('.editor-container').innerHTML = renderedData;
                //         document.querySelector('.tabs-container').innerHTML += renderedTab;
                //         var tabs = document.querySelectorAll('.tab-actions-right')
                //         tabs.forEach((tab) => tab.classList.remove('active'));
                //         tabs[tabs.length - 1].classList.add('active')
                //     }
                // });
                document.querySelector('.editor-container').innerHTML = renderedData;
                document.querySelector('.tabs-container').innerHTML += renderedTab;
                var tabs = document.querySelectorAll('.tab-actions-right')
                tabs.forEach((tab) => tab.classList.remove('active'));
                tabs[tabs.length - 1].classList.add('active')

                var clickedElementId = _id;
                var storedIds = sessionStorage.getItem('clickedIds');
                var clickedIds = [];
                if (storedIds) {
                    clickedIds = JSON.parse(storedIds);
                }
                clickedIds.push(clickedElementId);
                sessionStorage.setItem('clickedIds', JSON.stringify(clickedIds));
                // console.log(clickedIds);
            }).catch(function (error) {
                console.error(error);
            });
        })
        .catch(function (error) {
            console.error(error);
        });
}


function openDetailTab(_id) {
    document.querySelector('.split-view-view').style.display = 'block';
    fetch(base_url + '/app/' + _id)
        .then(response => response.json()).then(data => {
            document.querySelector('.editor-container').innerHTML = '';
            data.readme = marked(data.readme);
            const renderedData = Mustache.render(templateDetail, data);
            document.querySelector('.editor-container').innerHTML = renderedData;

        })
        .catch(function (error) {
            console.error(error);
        });
    let tabClose = document.querySelectorAll(".tab-actions-right");
    tabClose.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabClose.forEach((tabActive) => tabActive.classList.remove('active'));
            tab.classList.add('active')
        });
    });
}


// function closeTab() {
//     let closeBtns = document.querySelectorAll(".tab-actions");
//     let tabClose = document.querySelectorAll(".tab-actions-right");
//     const count = tabClose.length
//     closeBtns.forEach((tab, index) => {
//         tab.addEventListener('click', () => {
//             tabClose[index].remove();
//             count--;
//         });
//     });
//     if (count <= 1) {
//         document.querySelector('.editor-instance').remove()
//         document.querySelector('.tabs-container').remove()
//     }
//     tabClose.forEach((tabActive) => tabActive.classList.remove('active'));
//     tabClose[tabClose.length-2].classList.add('active')
// }
function closeTab(div) {
    tabActive = JSON.parse(sessionStorage.getItem('clickedIds'));
    console.log(tabActive)
    let index = tabActive.indexOf(div.id);
    if (tabActive.length < 2) {
        index = 1
    }
    div.remove();
    openDetailTab(tabActive[index - 1]);

    let tabClose = document.querySelectorAll(".tab-actions-right");
    tabClose.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabClose.forEach((tabActive) => tabActive.classList.remove('active'));
            tab.classList.add('active')
        });
    });
    // document.getElementById(tabActive[index - 1]).click();
    if (index > -1) {
        tabActive.splice(index, 1);
    }
    sessionStorage.setItem('clickedIds', JSON.stringify(tabActive))
    if (tabActive.length === 0) {
        document.querySelector('.editor-instance').remove()
        document.querySelector('.tabs-container').remove()
    }
}

// function showSpinner(isShow) {
//     if (isShow) {
//         document.querySelector('.spinner-custom.success').style.display = 'block';
//         document.querySelector('.background').style.display = 'block';
//         // setTimeout(() => {
//         //     document.querySelector('.spinner-custom.success').style.display = 'none';
//         //     document.querySelector('.background').style.display = 'none';
//         // }, 5000)
//     } else {
//         document.querySelector('.spinner-custom.error').style.display = 'block';
//         document.querySelector('.background').style.display = 'block';
//         setTimeout(() => {
//             document.querySelector('.spinner-custom.error').style.display = 'none';
//             document.querySelector('.background').style.display = 'none';
//         }, 5000)
//     }
// }

function showSpinner(isShow) {
    if (isShow) {
        setTimeout(() => {
            document.querySelector('.spinner-custom.success #wrapper.success .status.success .percentage').style.webkitAnimation = 'percentage-slow 3s forwards, percentage-fast 0.4s forwards;'
        },1000);
    }
}

showSpinner(true);

function installExtension(_id) {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Node-RED-API-Version", "v2");
    myHeaders.append("Content-Type", "application/json");

    fetch(base_url + '/app/' + _id)
        .then(response => response.json()).then(dataRes => {
            currentApp = dataRes;
            console.log(currentApp);
            const app_name_zip = currentApp.zip_url.split('.')[0]
            const app_name = currentApp.description
            const data = JSON.parse(currentApp.flow);
            const param = data[0];
            param.nodes = [];
            param.configs = data.filter(x => x.id != param.id);

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify(param),
                redirect: 'follow'
            };

            fetch(base_url + admin_root + "/flow", requestOptions)
                .then(response => response.text())
                .then(result => {
                    result = JSON.parse(result)
                    if (result.id) {
                        setTimeout(() => {
                            getResource(currentApp._id, result.id, app_name_zip, app_name);
                        }, 200);
                        showSpinner(true);
                    } else {
                        showSpinner(false);
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    showSpinner(false);
                });
        })
        .catch(function (error) {
            console.error(error);
        });
}



function getResource(appId, flowId, filename, appname) {
    var header = new Headers();
    header.append("Accept", "application/json");
    header.append("Node-RED-API-Version", "v2");
    header.append("Content-Type", "application/json");
    const app = {
        app_id: appId,
        flow_id: flowId,
        file_name: filename,
        app_name: appname
    }
    var requestOptions = {
        method: "POST",
        headers: header,
        body: JSON.stringify(app),
        redirect: "follow",
    };

    fetch(`${base_url}/app/install`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            showSpinner(true);
            console.log(result);
        })
        .catch((error) => { showSpinner(false); console.log("error", error) });
}


function deleteExtension(_id) {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Node-RED-API-Version", "v2");
    myHeaders.append("Content-Type", "application/json");

    fetch(base_url + '/installed/flowid')
        .then(response => response.json()).then(dataRes => {
            let foundObjectId = dataRes.find(item => item.app_id === _id).flow_id;
            let app_dir = dataRes.find(item => item.app_id === _id).app_dir
            var requestOptions = {
                method: 'DELETE',
                headers: myHeaders,
                redirect: 'follow'
            };

            fetch(base_url + admin_root + '/flow/' + foundObjectId, requestOptions)
                .then(response => {
                    if (response.status === 204) {
                        deleteResource(_id, app_dir)
                    } else {
                        showSpinner(false);
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    showSpinner(false);
                });
        })
        .catch(function (error) {
            console.error(error);
        });
}

function deleteResource(app_id, app_dir) {
    var header = new Headers();
    header.append("Accept", "application/json");
    header.append("Node-RED-API-Version", "v2");
    header.append("Content-Type", "application/json");
    const app = {
        app_id: app_id,
        app_dir: app_dir
    }
    var requestOptions = {
        method: "POST",
        headers: header,
        body: JSON.stringify(app),
        redirect: "follow",
    };
    fetch(base_url + "/app/delete", requestOptions)
        .then((response) => response.text())
        .then((result) => {
            showSpinner(true);
            console.log(result);
        })
        .catch((error) => { showSpinner(false); console.log("error", error) });
}

$(document).ready(function () {
    $('#myForm').on('input', function (event) {
        event.preventDefault();
        const desc = document.querySelector('#searchForm').value
        $.ajax({
            url: base_url + '/app/search/' + desc,
            success: function (response) {
                if (response) {
                    let data = response;
                    fetch(base_url + '/installed').then(response => response.json()).then(installed => {
                        document.querySelector('.app-not-installed .monaco-list-rows').innerHTML = '';
                        data.forEach(element => {
                            element.isInstall = installed.some(item => item._id === element._id);
                            const rendered = Mustache.render(templateListNotInstall, element);
                            document.querySelector('.app-not-installed .monaco-list-rows').innerHTML += rendered;
                        });
                    }).catch(function (error) {
                        console.error(error);
                    });
                } else {
                    fetch(base_url + '/app')
                        .then(response => response.json()).then(data => {
                            fetch(base_url + '/installed').then(response => response.json()).then(installed => {
                                let data_not_installed = data.filter(item1 => !installed.some(item2 => item1._id === item2._id));
                                document.querySelector('.app-not-installed .monaco-list-rows').innerHTML = '';
                                data_not_installed.forEach(element => {
                                    element.isInstall = false;
                                    const rendered = Mustache.render(templateListNotInstall, element);
                                    document.querySelector('.app-not-installed .monaco-list-rows').innerHTML += rendered;
                                });
                            }).catch(function (error) {
                                console.error(error);
                            });
                        })
                        .catch(function (error) {
                            console.error(error);
                        });
                }
            },
            error: function () {
                console.log('Error submitting the form.');
            }
        });
    });
});
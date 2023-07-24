const path = require('path')
let path_settings = path.join(__dirname, '../../pap_settings.js')
let settings = require(path_settings)
let templateListNotInstall = document.querySelector('.app-not-installed .monaco-list-rows').innerHTML;
let templateListExtension = document.querySelector('.extension .monaco-list-rows').innerHTML;
let templateListInstalled = document.querySelector('.app-installed .monaco-list-rows').innerHTML;
let templateDetail = document.querySelector('.editor-container').innerHTML;
let tabHeader = document.querySelector('.tabs-container').innerHTML;


let base_url = 'http://' + settings.uiHost + ':' + settings.uiPort;
let admin_root = settings.httpAdminRoot;

const divs = document.querySelectorAll('.step-item');
const captions = document.querySelectorAll('.caption');
const step_body = document.querySelectorAll('.step-body');
const table = document.querySelector('.stepbar-progress');
const body_fill = document.querySelectorAll('.body-fill');
var states = [];
var states_icon = [];
var states_txt = [];
var step = [];

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

    fetch(base_url + '/extension')
        .then(response => response.json()).then(data => {
            fetch(base_url + '/installed').then(response => response.json()).then(installed => {
                let data_not_installed = data.filter(item1 => !installed.some(item2 => item1._id === item2._id));
                document.querySelector('.extension .monaco-list-rows').innerHTML = '';
                data_not_installed.forEach(element => {
                    element.isInstall = false;
                    const rendered = Mustache.render(templateListExtension, element);
                    document.querySelector('.extension  .monaco-list-rows').innerHTML += rendered;
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
            if (element.type === "app") {
                element.isApp = true;
            } else {
                element.isApp = false;
            }
            element.isInstall = true;
            const rendered = Mustache.render(templateListInstalled, element);
            document.querySelector('.app-installed .monaco-list-rows').innerHTML += rendered;
        });
    }).catch(function (error) {
        console.error(error);
    });

}


function loaderBar(div, idx, complete, body_fill_idx, install) {
    document.querySelector('.background').style.display = 'block';
    document.querySelector('.loader-status-bar').style.display = 'block';
    setTimeout(() => {
        document.querySelector('.background').style.display = 'none';
        document.querySelector('.loader-status-bar').style.display = 'none';
    }, 13000)
    setTimeout(() => {
        ++body_fill_idx;
        if (install) {
            step = ["Request Server", "Download App", "Install App"];
        } else {
            step = ["Request Server", "Uninstall App", "Delete Log"];
        }
        if (complete) {
            states_icon = ["<i class='bx bx-rotate-right bx-spin' ></i>", "<i class='bx bx-loader-circle bx-spin' ></i>", "<i class='bx bx-check-double bx-flashing' ></i>"];
            states = ["active", "pending", "pass"];
            states_txt = ["Active", "Pending", "Passed"];
        } else {
            states_icon = ["<i class='bx bx-rotate-right bx-spin' ></i>", "<i class='bx bx-loader-circle bx-spin' ></i>", "<i class='bx bx-error-circle bx-tada' ></i>"];
            states = ["active", "pending", "fail"];
            states_txt = ["Active", "Pending", "Failed"];
        }
        captions[idx].style.left = `${div.offsetLeft - 60}px`;
        captions[idx].style.top = `${div.offsetTop - 10}px`;
        table.dataset.currentStep = idx + 1;
        states.forEach((states, index) => {
            setTimeout(() => {
                captions[idx].innerHTML = `${step[idx]} ${states_txt[index]}`
                step_body[idx].innerHTML = states_icon[index];
                table.dataset.stepStatus = states;
            }, index * 1500);
        });
        if (body_fill_idx < 2) {
            body_fill[body_fill_idx].style.display = `block`;
            for (let percent = 0; percent < 101; percent++) {
                setTimeout(() => {
                    body_fill[body_fill_idx].style.width = `${percent}%`;
                }, percent * (100 / 3));
            }
            body_fill[body_fill_idx].style.backgroundColor = document.querySelectorAll('.step-item[data-step="1"]');
            setTimeout(() => {
                body_fill[body_fill_idx].style.display = ``;
            }, 100 * (119 / 3));
        }
    }, idx * 4000)
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
    fetch(base_url + '/market/' + _id)
        .then(response => response.json()).then(data => {
            fetch(base_url + '/installed').then(response => response.json()).then(installed => {
                data.isInstall = installed.some(item => item._id === data._id);
                if (data.type === "app") {
                    data.isApp = true;
                } else {
                    data.isApp = false;
                }
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
    fetch(base_url + '/market/' + _id)
        .then(response => response.json()).then(data => {
            fetch(base_url + '/installed').then(response => response.json()).then(installed => {
                data.isInstall = installed.some(item => item._id === data._id);
                if (data.type === "app") {
                    data.isApp = true;
                } else {
                    data.isApp = false;
                }
                data.readme = marked(data.readme);
                document.querySelector('.editor-container').innerHTML = '';
                const renderedData = Mustache.render(templateDetail, data);
                document.querySelector('.editor-container').innerHTML = renderedData;
            }).catch(function (error) {
                console.error(error);
            });
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


function installApp(_id) {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Node-RED-API-Version", "v2");
    myHeaders.append("Content-Type", "application/json");

    fetch(base_url + '/market/' + _id)
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
                        loaderBar(divs[1], 1, true, 0, true)
                        setTimeout(() => {
                            getResource(currentApp._id, result.id, app_name_zip, app_name);
                        }, 200);
                    } else {
                        loaderBar(divs[1], 1, false, 0, true)
                    }
                })
                .catch(function (error) {
                    console.error(error);
                });

            loaderBar(divs[0], 0, true, -1, true);
        })
        .catch(function (error) {
            console.error(error);
            loaderBar(divs[0], 0, false, -1, true);
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
            loaderBar(divs[2], 2, true, 1, true);
            console.log(result);
        })
        .catch((error) => { loaderBar(divs[2], 2, false, 1, true); console.log("error", error) });
}


function deleteApp(_id) {
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
                        deleteResource(_id, app_dir);
                        loaderBar(divs[1], 1, true, 0, false);
                    } else {
                        loaderBar(divs[1], 1, false, 0, false);
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    loaderBar(divs[1], 1, false, 0, false);
                });
            loaderBar(divs[0], 0, true, -1, false);
        })
        .catch(function (error) {
            loaderBar(divs[0], 0, false, -1, false);
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
            loaderBar(divs[2], 2, true, 1, false);
            console.log(result);
        })
        .catch((error) => { loaderBar(divs[2], 2, false, 1, false); console.log("error", error) });
}

function installExtention(_id) {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Node-RED-API-Version", "v2");
    myHeaders.append("Content-Type", "application/json");

    fetch(base_url + '/market/' + _id)
        .then(response => response.json()).then(dataRes => {
            console.log(dataRes);
            const extension = {
                extension_id: dataRes._id,
                extension_name: dataRes.description,
                extension_zip: dataRes.zip_url.split('.')[0]
            }
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify(extension),
                redirect: 'follow'
            };

            fetch(base_url + "/extension/install", requestOptions)
                .then(response => {
                    console.log(response);
                    loaderBar(divs[1], 1, true, 0, true);
                    if (response.status === 200) {
                        loaderBar(divs[2], 2, true, 1, true);
                    } else {
                        loaderBar(divs[2], 2, false, 1, true);
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    loaderBar(divs[1], 1, false, 0, true);
                });

            loaderBar(divs[0], 0, true, -1, true);
        })
        .catch(function (error) {
            console.error(error);
            loaderBar(divs[0], 0, false, -1, true);
        });
}

function deleteExtention(_id) {
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Node-RED-API-Version", "v2");
    myHeaders.append("Content-Type", "application/json");

    fetch(base_url + '/installed/extension')
        .then(response => response.json()).then(dataRes => {
            const extension = {
                extension_id: dataRes.find(item => item.extension_id === _id).extension_id,
                extension_dir: dataRes.find(item => item.extension_id === _id).extension_dir
            }
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify(extension),
                redirect: 'follow'
            };

            fetch(base_url + '/extension/delete', requestOptions)
                .then(response => {
                    loaderBar(divs[1], 1, true, 0, false);
                    if (response.status === 200) {
                        loaderBar(divs[2], 2, true, 1, false);
                    } else {
                        loaderBar(divs[2], 2, false, 1, false);
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    loaderBar(divs[1], 1, false, 0, false);
                });
            loaderBar(divs[0], 0, true, -1, false);
        })
        .catch(function (error) {
            loaderBar(divs[0], 0, false, -1, false);
            console.error(error);
        });
}

$(document).ready(function () {
    $('#myForm').on('input', function (event) {
        event.preventDefault();
        const desc = document.querySelector('#searchForm').value
        $.ajax({
            url: base_url + '/market/search/' + desc,
            success: function (response) {
                if (response) {
                    let data = response;
                    fetch(base_url + '/installed').then(response => response.json()).then(installed => {
                        document.querySelector('.app-not-installed .monaco-list-rows').innerHTML = '';
                        document.querySelector('.extension .monaco-list-rows').innerHTML = '';
                        data.forEach(element => {
                            element.isInstall = installed.some(item => item._id === element._id);
                            if (element.type === "extension") {
                                const rendered = Mustache.render(templateListExtension, element);
                                document.querySelector('.extension .monaco-list-rows').innerHTML += rendered;
                            } else {
                                const rendered = Mustache.render(templateListNotInstall, element);
                                document.querySelector('.app-not-installed .monaco-list-rows').innerHTML += rendered;
                            }
                        });
                    }).catch(function (error) {
                        console.error(error);
                    });
                }
                else {
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

                    fetch(base_url + '/extension')
                        .then(response => response.json()).then(data => {
                            fetch(base_url + '/installed').then(response => response.json()).then(installed => {
                                let data_not_installed = data.filter(item1 => !installed.some(item2 => item1._id === item2._id));
                                document.querySelector('.extension .monaco-list-rows').innerHTML = '';
                                data_not_installed.forEach(element => {
                                    element.isInstall = false;
                                    const rendered = Mustache.render(templateListExtension, element);
                                    document.querySelector('.extension  .monaco-list-rows').innerHTML += rendered;
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
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
                    element.lastVersion = element.versions[element.versions.length - 1]['version'];
                    const rendered = Mustache.render(templateListNotInstall, element);
                    document.querySelector('.app-not-installed .monaco-list-rows').innerHTML += rendered;
                    $('.loader-first').fadeOut(700);
                    $('.loader-first-background').fadeOut(1000);
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
                    element.lastVersion = element.versions[element.versions.length - 1]['version'];
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


class SegmentedProgress {
    constructor(svgQS, statusQS, part, err, ins) {
        this.svgEl = document.querySelector(svgQS);
        this.statusEl = document.querySelector(statusQS);
        this.pct = 0;
        this.part = part;
        this.parts = 5;
        this.timeout = null;
        this.err = err;
        this.ins = ins;

        this.init();

        let resetBtn = document.getElementById("reset");
        if (resetBtn)
            resetBtn.addEventListener("click", this.reset.bind(this));
    }
    init() {
        this.updateStatus("Waiting…");
        this.timeout = setTimeout(this.nextPart.bind(this), 750);
    }
    reset() {
        this.pct = 0;
        this.part = 0;
        // undo all colored strokes
        for (let p = 1; p <= this.parts; ++p) {
            this.fillBar(p, this.pct);
            this.fillCircle(p, true);
        }

        clearTimeout(this.timeout);
        this.init();
    }
    run() {
        if (this.part < this.parts) {
            // increment
            if (this.pct < 100) {
                this.inc(10);
                let svgCS = window.getComputedStyle(this.svgEl),
                    incTrans = (svgCS.getPropertyValue("--incTrans") * 1e3) || 0;
                this.timeout = setTimeout(this.run.bind(this), incTrans);

            } else {
                this.nextPart();
            }
        }
    }
    inc(amt) {
        this.pct += amt;

        if (this.pct >= 100)
            this.pct = 100;

        this.fillBar(this.part, this.pct);
    }
    fillBar(part, pct) {
        if (this.svgEl) {
            let bar = this.svgEl.querySelector(`[data-bar='${part}']`);
            if (bar) {
                let offset = 40 * (1 - this.pct / 100);
                bar.style.strokeDashoffset = offset;
            }
        }
    }
    fillCircle(part, unfill = false, err = this.err) {
        let dot = this.svgEl.querySelector(`[data-dot='${part}']`),
            hub = this.svgEl.querySelector(`[data-hub='${part}']`),
            hubFill = this.svgEl.querySelector(`[data-hub-fill='${part}']`);

        if (unfill === true) {
            if (dot)
                dot.classList.remove("sp__dot--done");
            dot.classList.add("err");
            if (hub)
                hub.classList.remove("sp__hub--done");
            hub.classList.add("err");
            if (hubFill)
                hubFill.classList.remove("sp__hub-fill--done");
            hubFill.classList.add("err");
        } else {
            if (dot && err === true) {
                dot.classList.add("sp__dot--done");
                dot.classList.add("err");
            }
            if (dot && err !== true) {
                dot.classList.add("sp__dot--done");
            }
            if (hub && err === true) {
                hub.classList.add("sp__hub--done");
                hub.classList.add("err");
            }
            if (hub && err !== true) {
                hub.classList.add("sp__hub--done");
            }
            if (hubFill && err === true) {
                hubFill.classList.add("sp__hub-fill--done");
                hubFill.classList.add("err");
            }
            if (hubFill && err !== true) {
                hubFill.classList.add("sp__hub-fill--done");
            }

        }
    }
    nextPart() {
        this.pct = 0;
        // next part’s circle
        this.fillCircle(this.part);
        // display the message
        let msg = "";
        if (this.part === this.parts - 1) {
            msg = "Complete!";
        }
        else {
            if (this.err === true) {
                msg = `Error …`;
            } else {
                if (this.ins) {
                    if (this.part > 2) {
                        msg = `Install …`;
                    } else {
                        msg = `\u0044ownloading …`;
                    }
                } else {
                    msg = `Uninstall …`;
                }
            }
        }
        this.updateStatus(msg);
        // delay for next bar
        let hubTotalTrans = 600;
        this.timeout = setTimeout(this.run.bind(this), hubTotalTrans);
    }
    updateStatus(msg) {
        if (this.statusEl)
            this.statusEl.textContent = msg;
    }
}

function openDetail(_id) {
    if (_id !== sessionStorage.getItem('clickedIds')) {
        $('.logo-split-view').hide();
        $('.loader-three-back').show();
        $('.loader-three-back').fadeIn(50);
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
                    $('.loader-three-back').fadeOut(200);
                    data.isInstall = installed.some(item => item._id === data._id);
                    if (data.type === "app") {
                        data.isApp = true;
                    } else {
                        data.isApp = false;
                    }
                    data.lastVersion = data.versions[data.versions.length - 1]['version'];
                    data.readme = marked(data.readme);
                    document.querySelector('.editor-container').innerHTML = '';
                    const renderedData = Mustache.render(templateDetail, data);
                    const renderedTab = Mustache.render(tabHeader, data);
                    document.querySelector('.editor-container').innerHTML = renderedData;
                    document.querySelector('.tabs-container').innerHTML = renderedTab;
                    var tabs = document.querySelector('.tab-actions-right')
                    tabs.classList.add('active')
                    sessionStorage.setItem('clickedIds', data._id);
                }).catch(function (error) {
                    console.error(error);
                });;
            })
            .catch(function (error) {
                console.error(error);
            });
    }
}

function closeTab(div) {
    $('.logo-split-view').show();
    div.remove();
    document.querySelector('.editor-instance').remove()
    document.querySelector('.tabs-container').remove()
}


function installApp(_id, version) {
    document.querySelector('.loader-status-bar').style.display = 'block';
    document.querySelector('.background').style.display = 'block';
    const spb = new SegmentedProgress(".sp", ".status", 0, false, true);

    fetch(base_url + '/market/' + _id)
        .then(response => response.json()).then(dataRes => {
            spb.part = 1
            spb.err = false
            currentApp = dataRes;
            console.log(currentApp);
            const app_name_zip = currentApp.zip_url.split('.')[0];
            const app_name = currentApp.description;
            const data = JSON.parse(currentApp.flow);
            const param = data.filter(x => x.type === "tab")[0];
            param.nodes = data.filter(x => x.id != param.id);

            var authenHeaders = new Headers();
            authenHeaders.append("Authorization", "Bearer");
            authenHeaders.append("Content-Type", "application/json");

            var authenOptions = {
                method: 'POST',
                headers: authenHeaders,
                body: JSON.stringify({
                    client_id: "node-red-admin",
                    grant_type: "password",
                    scope: "*",
                    username: settings.username,
                    password: settings.password
                })
            };

            fetch(base_url + admin_root + "/auth/token", authenOptions).then(res => res.json()).then(result => {
                setTimeout(() => {
                    spb.part = 2
                    spb.err = false
                }, 1000)

                var header = new Headers();
                header.append("Authorization", `Bearer ${result["access_token"]}`);
                header.append("Content-Type", "application/json");

                var requestOptions = {
                    method: 'POST',
                    headers: header,
                    body: JSON.stringify(param),
                    redirect: 'follow'
                };
                fetch(base_url + admin_root + "/flow", requestOptions)
                    .then(response => response.text())
                    .then(result => {
                        result = JSON.parse(result)
                        if (result.id) {
                            setTimeout(() => {
                                spb.part = 3
                                spb.err = false
                                setTimeout(() => {
                                    getResource(currentApp._id, result.id, app_name_zip, app_name, version, spb);
                                }, 200)
                            }, 3000)
                        } else {
                            setTimeout(() => {
                                spb.part = 3
                                spb.err = false
                                setTimeout(() => {
                                    document.querySelector('.loader-status-bar').style.display = 'none';
                                    document.querySelector('.background').style.display = 'none';
                                }, 3000);
                            }, 3000)

                        }
                    })
                    .catch(function (error) {
                        console.error(error);
                    });
            }).catch(function (error) {
                console.error(error);
                setTimeout(() => {
                    spb.part = 2
                    spb.err = false
                    setTimeout(() => {
                        document.querySelector('.loader-status-bar').style.display = 'none';
                        document.querySelector('.background').style.display = 'none';
                    }, 3000);
                }, 1500)
            });
        })
        .catch(function (error) {
            setTimeout(() => {
                spb.part = 1
                spb.err = false
                setTimeout(() => {
                    document.querySelector('.loader-status-bar').style.display = 'none';
                    document.querySelector('.background').style.display = 'none';
                }, 3000);
            }, 500)
            console.error(error);
        });
}

function getResource(appId, flowId, filename, appname, version, spb) {
    var header = new Headers();
    header.append("Accept", "application/json");
    header.append("Node-RED-API-Version", "v2");
    header.append("Content-Type", "application/json");
    const app = {
        app_id: appId,
        flow_id: flowId,
        file_name: filename,
        app_name: appname,
        app_version: version
    }
    var requestOptions = {
        method: "POST",
        headers: header,
        body: JSON.stringify(app),
        redirect: "follow",
    };

    fetch(`${base_url}/app/install`, requestOptions)
        .then((response) => {
            if (response.ok) {
                setTimeout(() => {
                    spb.part = 4;
                    spb.err = false;
                    setTimeout(() => {
                        document.querySelector('.loader-status-bar').style.display = 'none';
                        document.querySelector('.background').style.display = 'none';
                    }, 4000);
                }, 3000)
            } else {
                setTimeout(() => {
                    spb.part = 4;
                    spb.err = true;
                    setTimeout(() => {
                        document.querySelector('.loader-status-bar').style.display = 'none';
                        document.querySelector('.background').style.display = 'none';
                    }, 4000)
                }, 3000);

            }
        })
        .catch((error) => {
            setTimeout(() => {
                spb.part = 4;
                spb.err = true;
                setTimeout(() => {
                    document.querySelector('.loader-status-bar').style.display = 'none';
                    document.querySelector('.background').style.display = 'none';
                }, 4000);
            }, 3000)

            console.log("error", error);
        });
}

function deleteApp(_id) {
    document.querySelector('.loader-status-bar').style.display = 'block';
    document.querySelector('.background').style.display = 'block';
    const spb = new SegmentedProgress(".sp", ".status", 0, false, false);

    fetch(base_url + '/installed/flowid')
        .then(response => response.json()).then(dataRes => {
            spb.part = 1
            spb.err = false
            let foundObjectId = dataRes.find(item => item.app_id === _id).flow_id;
            let app_dir = dataRes.find(item => item.app_id === _id).app_dir

            var authenHeaders = new Headers();
            authenHeaders.append("Authorization", "Bearer");
            authenHeaders.append("Content-Type", "application/json");

            var authenOptions = {
                method: 'POST',
                headers: authenHeaders,
                body: JSON.stringify({
                    client_id: "node-red-admin",
                    grant_type: "password",
                    scope: "*",
                    username: settings.username,
                    password: settings.password
                })
            };

            fetch(base_url + admin_root + "/auth/token", authenOptions).then(res => res.json()).then(result => {
                setTimeout(() => {
                    spb.part = 2
                    spb.err = false
                }, 1000)

                var header = new Headers();
                header.append("Authorization", `Bearer ${result["access_token"]}`);
                header.append("Content-Type", "application/json");

                var requestOptions = {
                    method: 'DELETE',
                    headers: header,
                    redirect: 'follow'
                };
                fetch(base_url + admin_root + '/flow/' + foundObjectId, requestOptions)
                    .then(response => {
                        if (response.status === 204) {
                            setTimeout(() => {
                                spb.part = 3
                                spb.err = false
                                setTimeout(() => {
                                    deleteResource(_id, app_dir, spb);
                                }, 200)
                            }, 3000)
                        } else {
                            setTimeout(() => {
                                spb.part = 3
                                spb.err = true
                                setTimeout(() => {
                                    document.querySelector('.loader-status-bar').style.display = 'none';
                                    document.querySelector('.background').style.display = 'none';
                                }, 3000);
                            }, 3000);
                        }
                    })
                    .catch(function (error) {
                        console.error(error);
                        setTimeout(() => {
                            spb.part = 3
                            spb.err = true
                            setTimeout(() => {
                                document.querySelector('.loader-status-bar').style.display = 'none';
                                document.querySelector('.background').style.display = 'none';
                            }, 3000);
                        }, 3000);
                    })
            }).catch(function (error) {
                setTimeout(() => {
                    spb.part = 2
                    spb.err = true
                    setTimeout(() => {
                        document.querySelector('.loader-status-bar').style.display = 'none';
                        document.querySelector('.background').style.display = 'none';
                    }, 3000);
                }, 1000)
                console.error(error);
            });
        }).catch(function (error) {
            spb.part = 1
            spb.err = true;
            console.error(error);
        });
}

function deleteResource(app_id, app_dir, spb) {
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
        .then((response) => {
            if (response.ok) {
                setTimeout(() => {
                    spb.part = 4;
                    spb.err = false;
                    setTimeout(() => {
                        document.querySelector('.loader-status-bar').style.display = 'none';
                        document.querySelector('.background').style.display = 'none';
                    }, 4000);
                }, 3000)
            } else {
                setTimeout(() => {
                    spb.part = 4;
                    spb.err = true;
                    setTimeout(() => {
                        document.querySelector('.loader-status-bar').style.display = 'none';
                        document.querySelector('.background').style.display = 'none';
                    }, 4000);
                }, 3000)
            }
        })
        .catch((error) => {
            setTimeout(() => {
                spb.part = 4;
                spb.err = true;
                setTimeout(() => {
                    document.querySelector('.loader-status-bar').style.display = 'none';
                    document.querySelector('.background').style.display = 'none';
                }, 4000);
            }, 3000)
        });
}

function installExtention(_id, version) {
    document.querySelector('.loader-status-bar').style.display = 'block';
    document.querySelector('.background').style.display = 'block';
    const spb = new SegmentedProgress(".sp", ".status", 0, false, true);
    spb.part = 1;
    spb.err = false;

    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Node-RED-API-Version", "v2");
    myHeaders.append("Content-Type", "application/json");

    fetch(base_url + '/market/' + _id)
        .then(response => response.json()).then(dataRes => {
            setTimeout(() => {
                spb.part = 2
                spb.err = false
            }, 1000)
            console.log(dataRes);
            const extension = {
                extension_id: dataRes._id,
                extension_version: version,
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
                    if (response.status === 200) {
                        setTimeout(() => {
                            spb.part = 3
                            spb.err = false
                            setTimeout(() => {
                                spb.part = 4;
                                spb.err = false;
                                setTimeout(() => {
                                    document.querySelector('.loader-status-bar').style.display = 'none';
                                    document.querySelector('.background').style.display = 'none';
                                }, 4000);
                            }, 3000)
                        }, 3000)
                    } else {
                        setTimeout(() => {
                            spb.part = 3
                            spb.err = true
                            setTimeout(() => {
                                document.querySelector('.loader-status-bar').style.display = 'none';
                                document.querySelector('.background').style.display = 'none';
                            }, 4000);
                        }, 3000)
                    }
                })
                .catch(function (error) {
                    setTimeout(() => {
                        spb.part = 3
                        spb.err = true
                        setTimeout(() => {
                            document.querySelector('.loader-status-bar').style.display = 'none';
                            document.querySelector('.background').style.display = 'none';
                        }, 4000);
                    }, 3000)
                });

        })
        .catch(function (error) {
            console.error(error);
            setTimeout(() => {
                spb.part = 2
                spb.err = true
                setTimeout(() => {
                    document.querySelector('.loader-status-bar').style.display = 'none';
                    document.querySelector('.background').style.display = 'none';
                }, 4000);
            }, 1000)
        });
}

function deleteExtention(_id) {
    document.querySelector('.loader-status-bar').style.display = 'block';
    document.querySelector('.background').style.display = 'block';
    const spb = new SegmentedProgress(".sp", ".status", 0, false, false);
    spb.part = 1;
    spb.err = false;

    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Node-RED-API-Version", "v2");
    myHeaders.append("Content-Type", "application/json");

    fetch(base_url + '/installed/extension')
        .then(response => response.json()).then(dataRes => {
            setTimeout(() => {
                spb.part = 2
                spb.err = false
            }, 1000)

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
                    if (response.status === 200) {
                        setTimeout(() => {
                            spb.part = 3
                            spb.err = false
                            setTimeout(() => {
                                spb.part = 4;
                                spb.err = false;
                                setTimeout(() => {
                                    document.querySelector('.loader-status-bar').style.display = 'none';
                                    document.querySelector('.background').style.display = 'none';
                                }, 4000);
                            }, 3000)
                        }, 3000)
                    } else {
                        setTimeout(() => {
                            spb.part = 3
                            spb.err = true
                            setTimeout(() => {
                                document.querySelector('.loader-status-bar').style.display = 'none';
                                document.querySelector('.background').style.display = 'none';
                            }, 4000);
                        }, 3000)
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    setTimeout(() => {
                        spb.part = 3
                        spb.err = true
                        setTimeout(() => {
                            document.querySelector('.loader-status-bar').style.display = 'none';
                            document.querySelector('.background').style.display = 'none';
                        }, 4000);
                    }, 3000)
                });
        })
        .catch(function (error) {
            setTimeout(() => {
                spb.part = 2
                spb.err = true
                setTimeout(() => {
                    document.querySelector('.loader-status-bar').style.display = 'none';
                    document.querySelector('.background').style.display = 'none';
                }, 4000);
            }, 1000)
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
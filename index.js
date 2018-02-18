//====================================================================//
// index.js
//====================================================================//

var options = {
    headers: { 'Accept': 'application/json', 'X-Sifter-Token': '', 'Content-Encoding': 'gzip' }
};


var requestPromise = require('request-promise');

var fetch = require('node-fetch');
var previousDateTime = new Date().getTime();

function rateLimitExcutor(execFunc, level = 0) {

    console.log("RateLimit:" + level + ":" + execFunc);

    while (execFunc !== null) {

        let diff = new Date().getTime() - previousDateTime;

        while (diff < 60000 / 50) {
            // Look up your date time comparitor
            diff = new Date().getTime() - previousDateTime;
        }

        previousDateTime = new Date().getTime();

        //console.log("ExecFuc");

        // Returns a promise.
        let exec = execFunc();

        console.log("RateLimit:" + level + ":" + exec);

        if (exec === undefined) {
            // Terminate.
            console.log("terminate");
            execFunc = null;
        }
        else if (exec !== null) {
            console.log("recusive");
            rateLimitExcutor(exec, level + 1);
        }
    }
}


function createTasks(elements, procedure, i = 0) {
    return function () {

        if (i === elements.length) {
            // we have reached the end;
            // typically terminate.
            return undefined;
        }

        let currentElement = elements[i];
        i++;

        return procedure(currentElement);
    }
}

function loadFile(Url, timeout, callback){

    var args = arguments.slice(3);
    var xhr = new XMLHttpRequest();
    xhr.ontimeout = function () {
        console.error("The request for " + url + " timed out.");
    };
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback.apply(xhr, args);
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.open("GET", url, true);
    xhr.timeout = timeout;
    xhr.send(null);
}

function getProjects() {
    fetch('https://ixus.sifterapp.com/api/projects', options)
        .then(function (response) {
            return response.json();
        }).catch((error) => {
            console.error("Error" + error);
            return undefined;
        })
        .then(json => {

            console.log(json.projects);

            rateLimitExcutor(

                createTasks(json.projects,

                function (projectElement) {
                        console.log(projectElement);

/*                    let request = { url:projectElement.api_issues_url , headers: options.headers };
                    let response = await requestPromise.get(request);
                    */

                    let reponse = fetch(projectElement.api_issues_url, options);

                    let json = repsonse.json();

                    if (json.issues == '') {
                        console.log("Issues null");
                    } else {
                        console.log("Issues Create Task:" + json.issues.length);
                        task = createTasks(json.issues, getIssueForElement);
                    }

                    return task;
                }));
        });
}



function rateLimitExcutor4(execFunc, level = 0) {

    console.log("RateLimit:" + level + ":" + execFunc);

    setTimeout(() =>
    {
        let exec = execFunc();

        console.log("RateLimit:" + level + ":" + exec);

        if (exec === undefined) {
            // Terminate.
            console.log("terminate");
            execFunc = null;
        }
        else if (exec !== null) {
            console.log("recusive");
            rateLimitExcutor(exec, level + 1);
        }

        if(level == 3)
        {
            for(let i = 0; i < 50; i++)
            {
                 execFunc();
            }
        }
        else{
            rateLimitExcutor4(exec, level + 1);
        }

        rateLimitExcutor4(exec, level);

    }, 60000);
}

/*
function rateLimitExcutor3(fetch, level = 0) {

    setTimeout(()=>
    {
        fetch
    }, 1000);

    execPromise.then(taskFunc =>
    {
        while(taskFunc != null)
        {
            previousDateTime = new Date().getTime();

            let task = taskFunc();

            //console.log("RateLimit2:" + level + ":" + task);

            if (task === undefined) {
                // Terminate.
                console.log("terminate");
                taskFunc = null;
            }
            else if (task !== null) {
                console.log("recusive");
                let pause = true;

                 rateLimitExcutor2(task, pause, level + 1);

                 while(pause)
                 {
                 };
            }
        }
    }).catch(error =>
        console.log(error)
    ).then(() => {console.log("done");pause = false});
}*/

function rateLimitExcutor2(execPromise, pause = false, level = 0) {



    execPromise.then(taskFunc =>
    {
        while(taskFunc != null)
        {
           // console.log("RateLimit:" + level + ":" + taskFunc);

            let diff = new Date().getTime() - previousDateTime;

            while (diff < 60000 / 500) {
                // Look up your date time comparitor
                diff = new Date().getTime() - previousDateTime;
            }

            previousDateTime = new Date().getTime();

            let task = taskFunc();

            //console.log("RateLimit2:" + level + ":" + task);

            if (task === undefined) {
                // Terminate.
                console.log("terminate");
                taskFunc = null;
            }
            else if (task !== null) {
                console.log("recusive");
                let pause = true;

                 rateLimitExcutor2(task, pause, level + 1);

                 while(pause)
                 {
                     delay();
                 };
            }
        }
    }).catch(error =>
        console.log(error)
    ).then(() => {console.log("done");pause = false});
}

function getProjects2() {

    rateLimitExcutor2(
        fetch('https://ixus.sifterapp.com/api/projects', options)
        .then(function (response) {
            return response.json();
        }).catch((error) => {
            console.error("Error" + error);
            return undefined;
        })
        .then(json => {

             return createTasks(json.projects, function (projectElement) {
                 console.log(projectElement);


                  return fetch(projectElement.api_issues_url, options)
                            .then(function (response) {
                                return response.json();
                            }).catch((error) => {
                                console.error("Error" + error);
                            }).then(function (json) {

                                if (json.issues == '') {
                                    console.log("Issues null");
                                } else {
                                    console.log("Issues Create Task:" + json.issues.length);
                                    return createTasks(json.issues, getIssueForElement);
                                }
                            });

             })
    }));
}

function getIssueForElementDelayed(issuesElement) {

    return function () {
        return getIssueForElement(issuesElement);
    }
}


function getIssueForElement(issuesElement) {

    return fetch(issuesElement.api_url, options)
        .then(handleErrors)
        .catch((error) => {
            console.error("Error" + error);
        return undefined;})
        .then(function (response) {
                return response.json();
            }).then(function (json) {
                console.log(json);
                /*
                console.log('{"summary": "' + json.issue.subject + '",');

                var str = json.issue.description;

                var cleanstr = str.replace(/\n/g, "NEWLINE")
                    .replace(/\r/g, "REWLINE")
                    .replace(/\t/g, "TEWLINE")
                    .replace(/"/g, "")
                    .replace(/\\/g, " ")
                    .replace(/NEWLINE/g, "\\\\n")
                    .replace(/REWLINE/g, "\\\\r")
                    .replace(/TEWLINE/g, "\\\\t");



                console.log('"description":"' + cleanstr + '",');
                console.log('"status":"' + json.issue.status + '",');
                console.log('"priority":"' + json.issue.priority + '",');
                console.log('"created": "' + json.issue.created_at + '",');
                console.log('"updated": "' + json.issue.updated_at + '",');
                console.log('"reporter": "' + json.issue.opener_name + '",');
                console.log('"assignee": "' + json.issue.assignee_name + '",');
                // var str = json.issue.number;
                // var numberstr = str.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
                //console.log('"externalid": "', numberstr, '",');
                console.log('"comments": [');
                var i
                for (i = 0, len = json.issue.comment_count; i < len; i++) {

                    var bodystr = json.issue.comments[i].body;
                    var bodycleanstr = bodystr.replace(/\n/g, "NEWLINE")
                        .replace(/\r/g, "REWLINE")
                        .replace(/\t/g, "TEWLINE")
                        .replace(/"/g, "")
                        .replace(/\\/g, " ")
                        .replace(/NEWLINE/g, "\\\\n")
                        .replace(/REWLINE/g, "\\\\r")
                        .replace(/TEWLINE/g, "\\\\t");


                    console.log('{"body":"' + bodycleanstr + '",');
                    console.log('"created":"' + json.issue.comments[i].created_at + '",');
                    console.log('"author":"' + json.issue.comments[i].commenter + '"}');
                    if (i === (len - 1)) { } else { console.log(","); }
                }
                console.log(']},');
                */
                // terminate
                return null;
            });
        }

function handleErrors(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        }


function rateLimitExecutorDelayedPromise(delayedFetchPromise, level = 0, previousTaskIterators = []) {

    // Assume that it is a delayed promise to be evaluted.
    let diff = (60000 / 50) - (new Date().getTime() - previousDateTime);

    setTimeout(function()
    {
        previousDateTime = new Date().getTime();

        // start fetching data.
        let fetchPromise = delayedFetchPromise();

        fetchPromise.then(taskIterator =>
        {
            rateLimitTaskExecutor(taskIterator, level, previousTaskIterators);
        });

    }, diff);
}

function rateLimitTaskExecutor(taskIterator, level = 0, previousTaskIterators = [])
{
    // Return task iterator, which retuns delayedFetchPromise or executed a task that returns imediately.
    let task = null;

    if(taskIterator != null)
      task = taskIterator();

    if (task === undefined || taskIterator == null)
    {
        if(previousTaskIterators.length === 0)
        {
            console.log("Terminated");
        }
        else
        {
            let previousTaskIterator = previousTaskIterators.pop();
            // Terminate the current level, and resume from the parent.
            rateLimitTaskExecutor(previousTaskIterator, level - 1, previousTaskIterators);
        }
    }
    else if (task !== null)
    {
        let taskIterators = previousTaskIterators;
        taskIterators.push(taskIterator);

        rateLimitExecutorDelayedPromise(task, level + 1, taskIterators);
    }
}

function getProjectsDelayedPromise()
{
     fetch('https://ixus.sifterapp.com/api/projects', options)
        .then(function (response) {
            return response.json();
        }).catch((error) => {
            console.error("Error" + error);
            return undefined;
        })
        .then(json => {

            rateLimitTaskExecutor(

                createTasks(json.projects,

                function (projectElement) {

                    console.log("-------------------------------------------");
                    console.log(projectElement);
                    console.log("-------------------------------------------");
                    // Delay Execution.
                    return function()
                    {
                        return fetch(projectElement.api_issues_url, options)
                        .then(function (res) {
                            return res.json();
                        }).catch((error) => {
                            console.error("Error" + error);
                        }).then(function (json) {

                            if (json.issues == '') {
                                return null;
                            } else {
                                return createTasks(json.issues, getIssueForElementDelayed);
                            }
                        });
                    };
                }));
        });
}

getProjectsDelayedPromise();

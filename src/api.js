let userEmail = "";
let studentId = -1;
let myPersonId = -1;

const CancelToken = axios.CancelToken;
let source = CancelToken.source();

function get(url, callback) {
    axios.request({
        url: "https://learning-modules.mit.edu" + url,
        method: "get",
        cancelToken: source.token,
    }).then((r) => {
        callback(r.data);
    }).catch((e) => {
        if (e.message == 'Canceled!') return;
        sendLogin();
    });
}

function ready(callback) {
    get("/service/membership/user", (res) => {
        console.log('USER', res);
        if (res.response.docs.length == 0) { sendLogin(); return; }
        if (res.response.docs[0] == undefined) { sendLogin(); return; }
        
        userEmail = res.response.docs[0].email;
        myPersonId = res.response.docs[0].id;
        callback();
    })
}

function setIsOld(old) {
    localStorage.setItem("old", old);
}

function sendLogin() {
    get("/service/membership/user", (res) => {
        if (res.response.docs[0] == undefined || res.response.docs.length == 0) {
            let redirectUrl = `https://learning-modules.mit.edu/class/index.html?uuid=${getCurrentCourse()}#dashboard`;
            window.location.replace(`https://learning-modules.mit.edu/Shibboleth.sso/Login?target=${encodeURI(redirectUrl)}`);
        }
    });
}

function getMaterials(course, callback) {
    get("/service/membership/group?uuid=" + course, (res) => { 
        var id = res.response.docs[0].id;
        get("/service/materials/groups/" + id + "/files", (r) => {
            callback(r);
        });
    });
}

function getAssignments(course, callback) {
    get("/service/gradebook/gradebook?uuid=STELLAR:" + course, (res) => {
        if (res.status == -1) sendLogin();
            
        var gradebookId = res.data.gradebookId;
        get("/service/gradebook/role/" + gradebookId + "?includePermissions=true", (res) => {
            var personId = res.data.person.personId;
            studentId = personId;
            get("/service/gradebook/student/" + gradebookId + "/" + personId + "/1?includeGradeInfo=true&includeAssignmentMaxPointsAndWeight=true&includePhoto=true&includeGradeHistory=false&includeCompositeAssignments=true&includeAssignmentGradingScheme=true&convertGradesToParentGradingScheme=true", (res) => {
                callback(res.data);
            })
        });
    });
}

function getClasses(callback) {
    get("/service/membership/groups", (res) => {
        if (!res.response) sendLogin();
        callback(res.response.docs);
    });
}

function getAssignmentDownloads(assingId, callback, solution) {
    get("/service/materials/assignments/" + assingId, (res) => {
        callback(res.assignment);
        solution(res.solution);
    });
}

function getSubmissions(assignId, callback) {
    get("/service/materials/assignments/" + assignId + "/submissions?accountEmail=" + userEmail, (res) => {
        callback(res);
    })
}

function getComments(assignId, callback) {
    get("/service/materials/assignments/" + assignId + "/comments?accountEmail=" + userEmail, (res) => {
        callback(res);
    })
}

function createNewSubmission(assignId, title, callback) {
    axios.post("https://learning-modules.mit.edu/service/gradebook/submission", {
        studentId: studentId,
        assignmentId: assignId,
        name: title,
        primary: true,
    }).then((res) => {
        callback(res.data);
    });
}

function uploadFile(file, title, assignId, subId, callback) {
    let formData = new FormData();
    formData.append("file", file);
    formData.append("json", JSON.stringify({title: title, type: "document"}));
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this);
       }
    };
    xhr.open("POST", "https://learning-modules.mit.edu/service/materials/assignments/" + assignId + "/submissions/" + subId);
    xhr.send(formData);
}

// Mother of nested requests.
function getSections(course, memberCallback, userCallback, callback) {
    get("/service/membership/group?uuid=" + course, (res) => {
        var groupId = res.response.docs[0].id;
        get("/service/membership/group/" + groupId + "/sectionmember", (res) => {
            memberCallback(res.response.docs);
            get("/service/membership/group/" + groupId + "/groupsbyuser", (res) => {
                userCallback(res.response.docs);
                get("/service/membership/group/" + groupId + "/groups", (res) => {
                    callback(res.response.docs);
                });
            });
        });
    });
}

function changeSection(sectionId, callback) {
    axios.post("https://learning-modules.mit.edu/service/membership/group/" + sectionId + "/member?syncIndex=true",
        [{
            personId: myPersonId,
            role: "Learner",  // TODO Can we hardcode this?
        }]
    ).then((res) => {
        callback(res);
    });
}

function cancelAllAjax() {
    source.cancel("Canceled!");
    source = CancelToken.source();
}

let userEmail = "";

function get(url, callback) {
    axios.request({
        url: "https://learning-modules.mit.edu" + url,
        method: "get",
    }).then((r) => {
        callback(r.data);
    });
}

function ready(callback) {
    get("/service/membership/user", (res) => {
        console.log('USER', res);
        if (res.response.docs.length == 0) sendLogin();
        userEmail = res.response.docs[0].email;
        callback();
    })
}

function setIsOld(old) {
    localStorage.setItem("old", old);
    chrome.runtime.sendMessage({method: "setIsOld", old: old}, function(response) {
        console.log(response.data);
    });
}

function sendLogin() {
    window.location.replace("https://learning-modules.mit.edu/Shibboleth.sso/Login?target=https%3A%2F%2Flearning-modules.mit.edu%2Fclass%2Findex.html%3Fuuid%3D%2Fcourse%2F18%2Ffa18%2F18.06%23dashboard")
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

function getAssignmentDownloads(assingId, callback) {
    get("/service/materials/assignments/" + assingId, (res) => {
        callback(res.assignment);
    });
}

function getSubmissions(assignId, callback) {
    get("/service/materials/assignments/" + assignId + "/submissions?accountEmail=" + userEmail, (res) => {
        callback(res);
    })
}

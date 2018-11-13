var app;

setIsOld(false);

if (window.location.hash) {
    const cc = window.location.hash.substring(1);
    setCurrentCourse(cc);
    window.location.replace(window.location.href.split("#")[0]);
}

function getCurrentCourse() {
    if (window.location.hash) {
        return window.location.hash.substring(1);
    } else {
        return localStorage.getItem("currentCourse");
    }
}

function setCurrentCourse(course) {
    localStorage.setItem("currentCourse", course);
}

ready(() => {
    app = new Vue({
        el: '#app',
        data: {
            state: 'materials',
            currentCourse: '',
            classes: [],
            materials: [],
            assignments: [],
            downloads: [],
            submissions: [],
            sections: [],
            loading: false,
            cumulative: "N/A",
        },
        watch: {
            state: function(a, b) {
                localStorage.setItem("state", a);
            }
        },
        computed: {
            sortedMaterials: function() {
                return this.materials.sort((a, b) => {
                    return (a.timestamp - b.timestamp);
                });
            },
        },
        methods: {
            getDownloads: function(id) {
                const filtered = this.downloads.filter(d => d.id == id);
                if (filtered.length == 0) return [];
                if (filtered[0].downloads == undefined) return [];
                return filtered[0].downloads;
            },
            getSubmissions: function(id) {
                const filtered = this.submissions.filter(s => s.id == id);
                if (filtered.length == 0) return [];
                if (filtered[0].submissions == undefined) return [];
                return filtered[0].submissions;
            },
            dateFormat: function(ts) {
                const date = new Date(ts);
                return date.toDateString().replace(/\w+[.!?]?$/, '') + date.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
            },
            materialLink: function(material) {
                if (material.type == 'document')
                    return "https://learning-modules.mit.edu" + material.downloadUrl;
                
                if (material.type == 'url')
                    return material.url;
            },
            submissionLink: function(submission) {
                return "https://learning-modules.mit.edu/service/materials/assignments/" + submission.assignId + "/submissions/" + submission.subId + "/link";
            },
            loadCourseData: function(course) {
                this.loading = true;
                this.materials = [];
                this.assignments = [];

                getMaterials(course, (res) => {
                    var topics = {};

                    for (let topic of res.topics) {
                        topics[topic.id] = {title: topic.title, materials: [], createdDate: topic.createdDate};
                    }
                    
                    for (let material of res.materials) {
                        topics[material.topicId].materials.push(material);
                    }

                    for (const [topicId, t] of Object.entries(topics)) {
                        t.materials.sort((a, b) => {
                            return Date.parse(a.createdDate) - Date.parse(b.createdDate);
                        });

                        this.materials.push({title: t.title,
                                             materials: t.materials,
                                             timestamp: Date.parse(t.createdDate)});
                    }

                    this.loading = false;
                });
                getAssignments(course, (res) => {
                    this.downloads = [];
                    this.submissions = [];

                    if (res.overallGradeInformation.cumulativePoints != undefined) {
                        this.cumulative = res.overallGradeInformation.cumulativePoints.toFixed(2);
                    } else {
                        this.cumulative = "N/A";
                    }

                    for (let assignment of res.studentAssignmentInfo) {
                        if (assignment.composite) continue;
                        this.assignments.push(assignment);
                    }
                    this.assignments.sort((a, b) => {
                        return a.postingDate - b.postingDate;
                    });

                    for (let assignment of this.assignments) {
                        getAssignmentDownloads(assignment.assignmentId, (res) => {
                            this.downloads.push({id: assignment.assignmentId, downloads: res});
                        });
                        getSubmissions(assignment.assignmentId, (res) => {
                            const currSubs = [];
                            for (let key in res) {
                                const submission = res[key];
                                submission.subId = key;
                                submission.assignId = assignment.assignmentId;
                                currSubs.push(submission);
                            }
                            this.submissions.push({id: assignment.assignmentId, submissions: currSubs});
                        });
                    }
                });

                let memberLookup = [];
                let userLookup = [];

                getSections(course, (r) => {
                    memberLookup = r;
                }, (u) => {
                    userLookup = u;
                }, (res) => {
                    this.sections = [];
                    for (let section of res) {
                        let person = memberLookup.filter(m => (m.uuid == section.uuid && (m.role == "Instructor" || m.role == "TA") && m.inherited == false))[0];
                        if (person == undefined) {
                            person = memberLookup.filter(m => (m.uuid == section.uuid && (m.role == "Instructor")))[0];
                        }
                        section.person = person;
                        section.userPicked = (userLookup.filter(u => u.uuid == section.uuid).length > 0);
                        this.sections.push(section);
                    }
                });
            },
            loadUserData: function(callback) {
                this.loading = true;
                this.classes = [];

                getClasses((res) => {
                    for (let c of res) {
                        this.classes.push(c);
                    }
                    callback();
                    this.loading = false;
                });
            },
            reloadCourse: function() {
                setCurrentCourse(this.currentCourse);
                this.loadCourseData(this.currentCourse);
            },
            switchOld: function() {
                setIsOld(true);
                window.location.replace("https://learning-modules.mit.edu/class/index.html?uuid=" + this.currentCourse);
            },
            uloadClick: function(id) {
                document.getElementById(''+id).click();
            },
            uload: function(id) {
                const file = document.getElementById(''+id).files[0];
                console.log("Got file", file);
                createNewSubmission(id, file.name, (res) => {
                    console.log("Created submission, return data", res)
                    var submissionId = res.data.submission.submissionId;
                    uploadFile(file, file.name, id, submissionId, () => {
                        console.log("File upload done?");
                        this.reloadCourse();
                    });
                });
            },
            pickSection: function(section) {
                changeSection(section.id, (res) => {
                    try {
                        var error = res.data.response.docs[0].error;
                        if (error != undefined && error != "") {
                            alert(error);
                        }
                    } catch (error) {
                        
                    }
                    this.reloadCourse();
                });
            },
            evalLink: function(person) {
                const scode = ""; //this.classes.filter(c => c.uuid == this.currentCourse)[0].name;
                const name = person.lastName + ", " + person.firstName;
                return "https://eduapps.mit.edu/ose-rpt/subjectEvaluationSearch.htm?termId=&departmentId=&subjectCode=" + scode + "&instructorName=" + name + "&search=Search";
            },
            numMats: function() {
                let count = 0;
                for (topic of this.materials) count += topic.materials.length;
                return count;
            },
            stellarLink: function() {
                return "https://stellar.mit.edu/S" + this.currentCourse + "/materials.html";
            }
        },
        mounted: function() {
            this.loadUserData(() => {
                const cc = getCurrentCourse();
                if (cc == undefined || !this.classes.some(c => c.uuid == cc))
                    this.currentCourse = this.classes[0].uuid;
                else
                    this.currentCourse = cc;

                const lastState = localStorage.getItem("state");
                if (lastState != undefined) this.state = lastState;

                setCurrentCourse(this.currentCourse);

                this.loadCourseData(this.currentCourse);
            })
        },
    })
});

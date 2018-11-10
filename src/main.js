var app;

setIsOld(false);

ready(() => {
    app = new Vue({
        el: '#app',
        data: {
            state: 'materials',
            currentCourse: '',
            classes: [],
            materials: [],
            assignments: [],
            loading: false,
        },
        computed: {
            sortedMaterials: function() {
                return this.materials.sort((a, b) => {
                    return (a.timestamp - b.timestamp);
                });
            },
        },
        methods: {
            materialLink: function(material) {
                if (material.type == 'document')
                    return "https://learning-modules.mit.edu" + material.downloadUrl;
                
                if (material.type == 'url')
                    return material.url;
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
                        this.materials.push({title: t.title,
                                             materials: t.materials,
                                             timestamp: Date.parse(t.createdDate)});
                    }

                    this.loading = false;
                });
                // getAssignments(course, (res) => {
                //     for (let assignment of res.studentAssignmentInfo) {
                //         this.assignments.push(assignment);
                //     }
                // });
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
                this.loadCourseData(this.currentCourse);
            },
            switchOld: function() {
                setIsOld(true);
                window.location.replace("https://learning-modules.mit.edu/class/index.html?uuid=" + this.currentCourse);
            }
        },
        mounted: function() {
            this.loadUserData(() => {
                this.currentCourse = this.classes[0].uuid;
                this.loadCourseData(this.currentCourse);
            })
        },
    })
});

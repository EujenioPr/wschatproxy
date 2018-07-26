class Repository {
    constructor() {

    }

    findOne(doc, cb) {
        let model = this.model;
        let query = model.findOne(doc);
        query.exec(cb);
    }

}

module.exports = Repository;
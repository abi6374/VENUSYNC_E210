
export class MockUser {
    static users = [];

    constructor(data) {
        this._doc = { ...data };
        if (!this._doc._id) {
            this._doc._id = Date.now().toString();
        }

        // Copy properties to the instance itself so they are accessible directly
        Object.assign(this, this._doc);
    }

    static findOne(query) {
        return Promise.resolve(this.users.find(u => {
            for (let key in query) {
                if (u[key] !== query[key]) return false;
            }
            return true;
        }));
    }

    save() {
        // Update the static store
        // Check if exists
        const index = MockUser.users.findIndex(u => u._id === this._doc._id);
        if (index >= 0) {
            MockUser.users[index] = { ...this };
        } else {
            MockUser.users.push({ ...this });
        }
        return Promise.resolve(this);
    }
}

export class MockProject {
    static projects = [];

    constructor(data) {
        this._doc = {
            ...data,
            createdAt: new Date(),
            members: data.members || []
        };
        if (!this._doc._id) {
            this._doc._id = Date.now().toString();
        }

        Object.assign(this, this._doc);
    }

    static find() {
        return {
            sort: () => Promise.resolve([...MockProject.projects].reverse())
        };
    }

    static findById(id) {
        // The findById result normally returns a Mongoose document
        // We'll return a raw object here which should be 'enough' for read operations
        const p = MockProject.projects.find(p => p._id === id);
        return Promise.resolve(p ? new MockProject(p) : null);
    }

    save() {
        const index = MockProject.projects.findIndex(p => p._id === this._doc._id);
        if (index >= 0) {
            MockProject.projects[index] = { ...this };
        } else {
            MockProject.projects.push({ ...this });
        }
        return Promise.resolve(this);
    }
}

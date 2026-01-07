import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const loadData = () => {
    if (!fs.existsSync(DB_FILE)) {
        return { users: [], projects: [] };
    }
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading mock DB:", e);
        return { users: [], projects: [] };
    }
};

const saveData = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error saving mock DB:", e);
    }
};

export class MockUser {
    static get users() {
        return loadData().users;
    }

    constructor(data) {
        this._doc = { ...data };
        if (!this._doc._id) {
            this._doc._id = Date.now().toString();
        }
        Object.assign(this, this._doc);
    }

    static findOne(query) {
        const users = this.users;
        return Promise.resolve(users.find(u => {
            for (let key in query) {
                if (u[key] !== query[key]) return false;
            }
            return true;
        }));
    }

    save() {
        const data = loadData();
        const index = data.users.findIndex(u => u._id === this._doc._id);
        if (index >= 0) {
            data.users[index] = { ...this };
        } else {
            data.users.push({ ...this });
        }
        saveData(data);
        return Promise.resolve(this);
    }
}

export class MockProject {
    static get projects() {
        return loadData().projects;
    }

    constructor(data) {
        this._doc = {
            ...data,
            createdAt: data.createdAt || new Date(),
            members: data.members || []
        };
        if (!this._doc._id) {
            this._doc._id = Date.now().toString();
        }
        Object.assign(this, this._doc);
    }

    static find() {
        return {
            sort: () => Promise.resolve([...this.projects].reverse())
        };
    }

    static findById(id) {
        const p = this.projects.find(p => p._id === id);
        return Promise.resolve(p ? new MockProject(p) : null);
    }

    static findByIdAndUpdate(id, update, options) {
        const data = loadData();
        const index = data.projects.findIndex(p => p._id === id);
        if (index >= 0) {
            data.projects[index] = { ...data.projects[index], ...update };
            saveData(data);
            return Promise.resolve(new MockProject(data.projects[index]));
        }
        return Promise.resolve(null);
    }

    save() {
        const data = loadData();
        const index = data.projects.findIndex(p => p._id === this._doc._id);
        if (index >= 0) {
            data.projects[index] = { ...this };
        } else {
            data.projects.push({ ...this });
        }
        saveData(data);
        return Promise.resolve(this);
    }
}

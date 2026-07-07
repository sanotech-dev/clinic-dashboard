import { getTodayPersian } from './dateHelper.js';
export function createPatient(name, age, phone) {
    return {
        name,
        age,
        phone,
        date: getTodayPersian(),
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printMemoryUsage = void 0;
const printMemoryUsage = (msg) => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const currentUsage = Math.round(used * 100) / 100;
    console.log(msg ? `-- ${msg}: ${currentUsage} MB` : `-- The script uses approximately ${currentUsage} MB`);
    return currentUsage;
};
exports.printMemoryUsage = printMemoryUsage;

export const printMemoryUsage = (msg?: string) => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const currentUsage = Math.round(used * 100) / 100;

    console.log(msg ? `-- ${msg}: ${currentUsage} MB` : `-- The script uses approximately ${currentUsage} MB`);

    return currentUsage;
}

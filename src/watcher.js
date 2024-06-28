"use strict";
const chokidar = require("chokidar");

/**
 * Start chokidar file watchers
 * @param {string} sourcePath
 * @param {string[]} sourcePackageFiles
 * @param {function(): Promise<void>} notifyCallback
 * @returns {chokidar.FSWatcher}
 */
function startWatcher(sourcePath, sourcePackageFiles, notifyCallback) {
    const ignored = [
        "**/.*", // Ignore all dot files or folders
        "**/node_modules", // Ignore all node_modules folders
    ];

    for (const spf of sourcePackageFiles) {
        ignored.push(`**/${spf}`);
    }

    const c = chokidar.watch(`${sourcePath}`, { ignored });

    let ready = false;
    let watchingCount = 0;
    let syncTimeoutId = -1;

    /**
     * @returns {void}
     */
    function timerCallback() {
        syncTimeoutId = setTimeout(async () => {
            await notifyCallback();
        }, 150);
    }

    c.on("add", path => {
        if (!ready) {
            watchingCount++;
            return;
        }

        clearTimeout(syncTimeoutId);
        syncTimeoutId = setTimeout(timerCallback, 150);
        console.log(`${path} was added`);
    });
    c.on("change", path => {
        if (!ready) {
            watchingCount++;
            return;
        }

        clearTimeout(syncTimeoutId);
        syncTimeoutId = setTimeout(timerCallback, 150);
        console.log(`${path} has changed`);
    });
    c.on("error", err => {
        console.error(err);
    });
    console.log("Performing initial watcher preparations");
    c.on("ready", async () => {
        console.log(`Currently watching ${watchingCount} files for changes`);
        ready = true;
        await notifyCallback();
    });
    return c;
}

module.exports = { startWatcher };

"use strict";
const chokidar = require("chokidar");

/**
 * Start chokidar file watchers
 * @param {string} sourcePath
 * @param {Function} notifyCallback
 * @returns {chokidar.FSWatcher}
 */
function startWatcher(sourcePath, notifyCallback) {
    const c = chokidar.watch(`${sourcePath}`, { ignoreInitial: true });

    let syncTimeoutId = -1;

    c.on("add", path => {
        clearTimeout(syncTimeoutId);
        syncTimeoutId = setTimeout(() => notifyCallback(), 150);
        console.log(`${path} was added`);
    });
    c.on("change", path => {
        clearTimeout(syncTimeoutId);
        syncTimeoutId = setTimeout(() => notifyCallback(), 150);
        console.log(`${path} has changed`);
    });
    console.log("Performing initial sync");
    notifyCallback();
    return c;
}

module.exports = { startWatcher };

"use strict";

const cp = require("node:child_process");
const timers = require("node:timers/promises");

/**
 * @param {string} sourcePath
 * @param {string?} hookCmd
 * @returns {Promise<void>}
 */
async function hook(sourcePath, hookCmd) {
    if (!hookCmd) {
        return;
    }
    const now = Date.now();

    console.log(`Calling hook "${hookCmd}"`);
    cp.execSync(hookCmd, { cwd: sourcePath });
    console.log(`Hook finished in ${Date.now() - now}ms`);
    await timers.setImmediate();
}


module.exports = { hook };

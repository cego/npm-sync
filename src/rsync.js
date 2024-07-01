"use strict";
const cp = require("node:child_process");
const fs = require("node:fs");

/**
 * Start rsync subprocess
 * @param {string[]} sourcePackageFiles
 * @param {string} sourcePath
 * @param {string} sourcePackageName
 * @param {string} targetPath
 * @returns {void}
 */
function rsync(sourcePackageFiles, sourcePath, sourcePackageName, targetPath) {
    const now = Date.now();
    const fromFileContent = ["/package.json"];

    for (const f of sourcePackageFiles) {
        fromFileContent.push(`/${f}`);
    }
    fs.writeFileSync(`/tmp/npm-sync-from-file-${process.pid}`, `${fromFileContent.join("\n")}\n`);
    fs.mkdirSync(`${targetPath}/node_modules/${sourcePackageName}`, { recursive: true });
    const res = cp.spawnSync("rsync", [
        "-avLK",
        "--recursive",
        `--files-from=/tmp/npm-sync-from-file-${process.pid}`,
        sourcePath,
        `${targetPath}/node_modules/${sourcePackageName}`,
    ]);

    fs.unlinkSync(`/tmp/npm-sync-from-file-${process.pid}`);
    if (res.stderr.toString() !== "") {
        console.log(`${res.stderr}`);
    }
    console.log(`Rsync performed in ${Date.now() - now}ms`);
}

module.exports = { rsync };

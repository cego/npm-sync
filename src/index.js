#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const { resolve } = require("node:path");
const cp = require("node:child_process");
const chokidar = require("chokidar");

const source = resolve(process.argv[2]);
const target = resolve(process.argv[3]);

if (!fs.existsSync(`${source}/package.json`)) {
    console.error(`${source} doesn't contain package.json is this really an npm package folder`);
    process.exit(1);
}

if (!fs.existsSync(`${target}/package.json`)) {
    console.error(`${target} doesn't contain package.json is this really an npm application folder`);
    process.exit(1);
}

const sourcePackageJsonData = JSON.parse(fs.readFileSync(`${source}/package.json`, "utf-8"));
const sourceName = sourcePackageJsonData.name;
const sourceFiles = sourcePackageJsonData.files;
const c = chokidar.watch(`${source}/**/*`);

/**
 * Start rsync subprocess
 * @returns {void}
 */
function goSync() {
    const fromFileContent = [];

    for (const f of sourceFiles) {
        fromFileContent.push(`/${f}`);
    }
    fs.writeFileSync(`/tmp/npm-sync-from-file-${process.pid}`, `${fromFileContent.join("\n")}\n`);
    fs.mkdirSync(`${target}/node_modules/${sourceName}`, { recursive: true });
    const res = cp.spawnSync("rsync", [
        "-avLK",
        "--recursive",
        `--files-from=/tmp/npm-sync-from-file-${process.pid}`,
        source,
        `${target}/node_modules/${sourceName}`,
    ]);

    fs.unlinkSync(`/tmp/npm-sync-from-file-${process.pid}`);
    if (res.stderr.toString() !== "") {
        console.log(`${res.stderr}`);
    }
}

let syncTimeoutId = -1;

c.on("add", path => {
    clearTimeout(syncTimeoutId);
    syncTimeoutId = setTimeout(goSync, 500);
    console.log("file added", path);
});
c.on("change", path => {
    clearTimeout(syncTimeoutId);
    syncTimeoutId = setTimeout(goSync, 500);
    console.log("file changed", path);
});

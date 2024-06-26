#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const { resolve } = require("node:path");
const { rsync } = require("./rsync");
const { startWatcher } = require("./watcher");

const sourcePath = resolve(process.argv[2]);
const targetPath = resolve(process.argv[3]);

if (!fs.existsSync(`${sourcePath}/package.json`)) {
    console.error(`${sourcePath} doesn't contain package.json is this really an npm package folder`);
    process.exit(1);
}

if (!fs.existsSync(`${targetPath}/package.json`)) {
    console.error(`${targetPath} doesn't contain package.json is this really an npm application folder`);
    process.exit(1);
}

const sourcePackageJsonData = JSON.parse(fs.readFileSync(`${sourcePath}/package.json`, "utf-8"));
const sourcePackageName = sourcePackageJsonData.name;
const sourcePackageFiles = sourcePackageJsonData.files;

startWatcher(sourcePath, () => {
    rsync(sourcePackageFiles, sourcePath, sourcePackageName, targetPath);
});

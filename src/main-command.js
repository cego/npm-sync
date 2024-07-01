"use strict";
const fs = require("node:fs");
const { resolve } = require("node:path");
const { startWatcher } = require("./watcher");
const { rsync } = require("./rsync");
const { hook } = require("./hook");

/**
 * @param {ArgumentsCamelCase<{sourcePath: string, targetPath: string, hookCmd?: string}>} args
 * @returns {void}
 */
async function handler(args) {
    const sourcePath = resolve(args.sourcePath);
    const targetPath = resolve(args.targetPath);

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

    startWatcher(sourcePath, sourcePackageFiles, async () => {
        await hook(sourcePath, args.hookCmd);
        rsync(sourcePackageFiles, sourcePath, sourcePackageName, targetPath);
    });
}

/**
 * @param {yargs.Argv} yargs
 * @returns {yargs.Argv}
 */
function builder(yargs) {
    yargs.positional("sourcePath", {
        type: "string",
        description: "Watch file changes from this path",
    });
    yargs.positional("targetPath", {
        type: "string",
        description: "Rsync file changes to this path",
    });
    yargs.option("hookCmd", {
        type: "string",
        description: "Hook command to be called in sourcePath, when watcher detects file changes",
        demandOption: false,
        alias: "h",
    });
    yargs.hide("help");
    yargs.hide("version");
    return yargs;
}

module.exports = {
    handler,
    builder,
    command: "$0 <sourcePath> <targetPath>",
    describe: "Runs the entire pipeline or job's",
};

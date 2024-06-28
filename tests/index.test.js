"use strict";

const fs = require("node:fs");
const timers = require("node:timers/promises");
const waitForExpect = require("wait-for-expect");
const { rsync } = require("../src/rsync");
const { startWatcher } = require("../src/watcher");
const { hook } = require("../src/hook");

let log;
const sourcePath = "/tmp/npm-sync-test-source";
const targetPath = "/tmp/npm-sync-test-target";

beforeEach(() => {
    log = jest.spyOn(console, "log").mockImplementation(() => {});

    fs.rmSync(sourcePath, { recursive: true, force: true });
    fs.mkdirSync(sourcePath, { recursive: true });
    fs.rmSync(targetPath, { recursive: true, force: true });
    fs.mkdirSync(targetPath, { recursive: true });
});
afterEach(() => {
    log.mockReset();
});

test("it rsync's", () => {

    // Setup
    fs.copyFileSync("package.json", `${sourcePath}/package.json`);
    fs.writeFileSync(`${sourcePath}/somescript.js`, "\n");

    // Execute
    // TODO: Globstar doesn't work with current implementation
    // rsync(["**/*.js"], sourcePath, "@tester/somepackage", targetPath)
    rsync([""], sourcePath, "@tester/somepackage", targetPath);

    // Assert
    expect(fs.existsSync(`${targetPath}/node_modules/@tester/somepackage/package.json`)).toBe(true);
    expect(fs.existsSync(`${targetPath}/node_modules/@tester/somepackage/somescript.js`)).toBe(true);
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/Rsync performed in \d+ms/u));
});

test("it executes hook that succeeds", async () => {

    // Execute
    await hook(`${sourcePath}`, "echo \"tralala\" > text.txt");

    // Assert
    expect(fs.existsSync(`${sourcePath}/text.txt`)).toBe(true);
});

test("it executes hook that fails", async () => {

    // Execute
    /**
     * @returns {void}
     */
    async function t() {
        await hook(`${sourcePath}`, "echinvalid");
    }

    // Assert
    await expect(t).rejects.toThrow("Command failed: echinvalid");
});

test("it watches files and invokes notifyCallback", async () => {

    // Setup
    fs.writeFileSync(`${sourcePath}/somescript.js`, "");
    const sourcePackageFiles = ["dist"];

    // Execute
    const notifyCallback = jest.fn();
    const readyCallback = jest.fn();

    const w = startWatcher(sourcePath, sourcePackageFiles, notifyCallback);

    w.on("ready", readyCallback);

    // Assert
    await waitForExpect(() => {
        expect(readyCallback).toHaveBeenCalledTimes(1);
    });

    // Change file
    fs.appendFileSync(`${sourcePath}/somescript.js`, "Tralala");
    fs.writeFileSync(`${sourcePath}/freshfile.txt`, "Tralala");

    // Assert
    await waitForExpect(() => {
        expect(notifyCallback).toHaveBeenCalledTimes(2);
    }, 30000);

    // Cleanup
    await w.close();
}, 30000);

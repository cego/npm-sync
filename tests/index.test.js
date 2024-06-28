"use strict";

const fs = require("node:fs");
const { rsync } = require("../src/rsync");
const { startWatcher } = require("../src/watcher");
const waitForExpect = require("wait-for-expect");
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


test("hook (success)", async () => {

    // Execute
    await hook(`${sourcePath}`, "echo \"tralala\" > text.txt");

    // Assert
    expect(fs.existsSync(`${sourcePath}/text.txt`)).toBe(true);
});

test("hook (failure)", async () => {

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
    const sourcePackageFiles = ["files"];

    // Execute
    const notifyCallback = jest.fn();
    const w = startWatcher(sourcePath, sourcePackageFiles, notifyCallback);

    fs.appendFileSync(`${sourcePath}/somescript.js`, "Tralala");

    // Assert
    await waitForExpect(() => {
        expect(notifyCallback).toHaveBeenNthCalledWith(1);
    });

    // Cleanup
    await w.close();
});

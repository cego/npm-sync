"use strict";

const fs = require("node:fs");
const { rsync } = require("../src/rsync");

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
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/Sync performed in \d+ms/u));
});

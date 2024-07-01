#!/usr/bin/env node
"use strict";
const yargs = require("yargs/yargs");
const mainCommand = require("./main-command");

const i = yargs(process.argv.slice(2));

i
    .parserConfiguration({ "greedy-arrays": false })
    .showHelpOnFail(false)
    .wrap(i.terminalWidth())
    .command(mainCommand)
    .example("$0 count -f foo.js", "count the lines in the given file")
    .strictOptions()
    .env("NPMSYNC")
    .option("list", {
        type: "boolean",
        description: "List job information, when:never excluded",
        requiresArg: false,
    })
    .parse();

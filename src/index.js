#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const { convert } = require("./converter");

const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8").toString());

program
  .version(pkg.version)
  .description(
    "make your file imports a better look\n nice-import src/route/index.tsx \nOR:\nni src/route/index.tsx",
  )
  .arguments("<entryFile>")
  .action((entryFile) => {
    const startTime = new Date().getTime();
    const realEntryFile = entryFile.replace(/:\w+$/g, "");
    const fullPath = path.resolve(process.cwd(), realEntryFile);
    const originContent = fs.readFileSync(fullPath, "utf8").toString();
    const newContent = convert(realEntryFile);
    const endTime = new Date().getTime();
    const diff = endTime - startTime;
    if(originContent.trim() === newContent.trim()){
      console.log(`${entryFile} ${diff}ms (unchanged)`);
      return;
    }
    fs.writeFileSync(realEntryFile, newContent);
    console.log(`${entryFile} ${diff}ms (changed)`);
  })
  .parse(process.argv);

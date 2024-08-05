#!/usr/bin/env node

const fs = require("fs");
const childProcess = require("child_process");

function insertContentToTextAtIndex(content, insertIndex, insertContent) {
  const preSubString = content.slice(0, insertIndex);
  const appendixString = content.slice(insertIndex);
  return preSubString + insertContent + "\n\n" + appendixString.trim() + "\n";
}

const isLocalDevelopmentMode = () => {
  return new Promise((resolve) => {
    childProcess.exec("git remote -v",{
      cwd: __dirname,
    }, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const convert = function (filePath) {
  // read the content of file
  let content = fs.readFileSync(filePath, "utf8").toString();

  // match all the import lines
  const importRegex =
    /^import\s+(type\s+)?(?:(?:\*\s+as\s+\w+|\w+(?:\s*,\s*{[^}]*})?|{[^}]*})\s+from\s+['"][^'"]+['"]|['"][^'"]+['"]);?/gm;
  const imports = content.match(importRegex) || [];

  // separate the imports into different groups
  const groupImports = (imports) => {
    const groups = {
      external: [],
      scoped: [],
      internal: [],
      unrecognized: [],
      styles: [],
      images: [],
    };

    //  the regex of different types of imports
    const styleRegex = /[.](css|less|scss)/;
    const scopedRegex = /(from)?\s+['"]@.*/;
    const externalRegex = /(from)?\s['"][\w-/]+['"]/;
    const internalRegex = /(from)?\s+['"](@\/|[.]{1,2}\/)/;
    const images = /[.](png|jpg|jpeg|gif)/i;

    imports.forEach((imp) => {
      if (styleRegex.test(imp)) {
        groups.styles.push(imp);
        return;
      }

      if (externalRegex.test(imp)) {
        groups.external.push(imp);
        return;
      }

      if (internalRegex.test(imp)) {
        if (images.test(imp)) {
          groups.images.push(imp);
        } else {
          groups.internal.push(imp);
        }
        return;
      }

      if (scopedRegex.test(imp)) {
        groups.scoped.push(imp);
        return;
      }

      //  if all the above conditions are not met, then it is an unrecognized import
      groups.unrecognized.push(imp);
    });

    return groups;
  };

  // rearrange the imports like a triangle by put the longest line at the bottom
  const sortAndFormatImports = (importGroup) => {
    const newList = importGroup.map((currentImport) => {
      const lines = currentImport.split("\n");
      const multiLine = lines.length >= 3;
      let currentContent = currentImport;
      if (multiLine) {
        const firstLine = lines[0];
        const lastLine = lines[lines.length - 1];
        const middleList = lines.slice(1, lines.length - 1);
        middleList.sort((a, b) => a.length - b.length);
        currentContent = [firstLine, ...middleList, lastLine].join("\n");
      }
      return currentContent;
    });

    newList.sort((a, b) => {
      const aLengths = a.split("\n").map((line) => line.length);
      const bLengths = b.split("\n").map((line) => line.length);
      return Math.max.apply(null, aLengths) - Math.max.apply(null, bLengths);
    });
    return newList.join("\n");
  };

  // 整理分组
  const groups = groupImports(imports);
  const sortedGroups = [
    sortAndFormatImports(groups.external),
    sortAndFormatImports(groups.scoped),
    sortAndFormatImports(groups.internal),
    sortAndFormatImports(groups.images),
    sortAndFormatImports(groups.unrecognized),
    sortAndFormatImports(groups.styles),
  ]
    .filter((group) => group.trim().length > 0)
    .join("\n\n");

  if (imports.length > 0) {
    const match = importRegex.exec(content);
    const index = match.index;
    const newContent = content.replace(importRegex, "").trim();
    return insertContentToTextAtIndex(newContent, index, sortedGroups);
  }
  // replace the origin import lines with the sorted groups
  const newContent = content.replace(importRegex, "").trim();
  return `${sortedGroups}\n\n${newContent}\n`;
};

exports.convert = convert;
isLocalDevelopmentMode().then((isDev) => {
  if (isDev) {
    console.log(
      convert(
        "",
      ),
    );
  }
});

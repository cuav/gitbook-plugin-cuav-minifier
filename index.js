"use strict";

const fs = require("fs");
const path = require("path");
const htmlMinify = require("html-minifier").minify;
const UglifyJS = require("uglify-js");
const CleanCSS = require("clean-css");

const cleanCSS = new CleanCSS({ level: { 1: { specialComments: 0 } } });

function minify(dirPath, book) {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      throw err;
    }

    files
      .map(fileName => path.join(dirPath, fileName))
      .forEach(filePath => {
        if (fs.statSync(filePath).isDirectory()) {
          minify(filePath, book);
        } else if (fs.statSync(filePath).isFile()) {
          if (filePath.match(/\.html$/) !== null) {
            book.log.debug.ln('html-minifier "' + filePath + '"');
            const html = fs.readFileSync(filePath, "utf8");
            const minified = htmlMinify(html, { minifyCSS: true, minifyJS: true });
            fs.writeFileSync(filePath, minified);
          } else if (filePath.match(/(?<!\.min)\.js$/) !== null) {
            book.log.debug.ln('js-minifier "' + filePath + '"');
            const js = fs.readFileSync(filePath, "utf8");
            const minified = UglifyJS.minify(js);
            fs.writeFileSync(filePath, minified.code);
          } else if (filePath.match(/(?<!\.min)\.css$/) !== null) {
            book.log.debug.ln('css-minifier "' + filePath + '"');
            const css = fs.readFileSync(filePath, "utf8");
            const minified = cleanCSS.minify(css);
            fs.writeFileSync(filePath, minified.styles);
          }
        }
      });
  });
}

module.exports = {
  hooks: {
    finish: function() {
      minify(this.output.root(), this);
    }
  }
};

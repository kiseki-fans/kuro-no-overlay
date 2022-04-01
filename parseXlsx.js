const xlsx = require("xlsx");
const fs = require("fs");
const https = require("follow-redirects").https;
const concat = require("concat-stream");
const path = require("path");
const getAppDataPath = require("./getAppDataPath");

function download(url, cb) {
  const concatStream = concat(cb);
  https.get(url, function (response) {
    response.pipe(concatStream);
  });
}

const sheetsToIgnore = ["Misc", "Minigames"];

module.exports = function downloadAndParseTranslations(cb) {
  download(
    "https://docs.google.com/spreadsheets/d/1qnCazs0_I1mUusiSMhySvCLsqPrSnDBr9EFB8N6bY-w/export?format=xlsx",
    function xlsxToJson(buffer) {
      const file = xlsx.read(buffer, { type: "buffer" });
      const translations = {
        ...Object.fromEntries(
          file.SheetNames.filter(
            (name) =>
              !sheetsToIgnore.some((nameToIgnore) => name === nameToIgnore)
          ).map((name) => [
            name,
            xlsx.utils
              .sheet_to_json(file.Sheets[name], {
                header: ["name", "en", "jp"],
                blankrows: true,
              })
              .slice(name === "Prologue" ? 17 : 1),
          ])
        ),
      };
      cb(translations);
      saveAppData("translation.json", { date: new Date(), ...translations });
    }
  );
};

function saveAppData(name, content) {
  const appDataDirPath = getAppDataPath();

  if (!fs.existsSync(appDataDirPath)) {
    fs.mkdirSync(appDataDirPath);
  }

  const appDataFilePath = path.join(appDataDirPath, name);
  content = JSON.stringify(content, null, 2);

  fs.writeFile(appDataFilePath, content, (err) => {
    if (err) {
      console.log("There was a problem saving data!");
    } else {
      console.log("Data saved correctly!");
    }
  });
}

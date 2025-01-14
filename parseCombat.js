const xlsx = require("xlsx");
const fs = require("fs");
const https = require("follow-redirects").https;
const concat = require("concat-stream");

function download(url, cb) {
  const concatStream = concat(cb);
  https.get(url, function (response) {
    response.pipe(concatStream);
  });
}

function downloadAndParseCombat() {
  download(
    "https://docs.google.com/spreadsheets/d/1nFGxNg4LYHMkSxSipoCERPhVDwFEHljsQ_O3vPiBYos/export?format=xlsx",
    function xlsxToJson(buffer) {
      const file = xlsx.read(buffer, { type: "buffer" });
      saveCrafts(file);
      saveArtsPlusQuartz(file);
      saveHollowCores(file);
      saveShardSkills(file);
      saveArtsDrivers(file);
      saveItems(file);
      saveAccessories(file);
    }
  );
}

function saveCrafts(file) {
  const crafts = xlsx.utils
    .sheet_to_json(file.Sheets.Crafts, {
      header: ["name", "cpCost", "pbu", "aoe", "effects"],
    })
    .reduce((acc, line) => {
      if (Object.keys(line).length === 1) {
        if (line.name.includes("REVERIE")) {
          return acc;
        }
        return { ...acc, [line.name]: [] };
      }
      if (line.name === "Craft Name") {
        return acc;
      }

      const currentCharacter = Object.keys(acc)[Object.keys(acc).length - 1];
      const type = line.name.match(/C|S/g)[0];
      const name = line.name.replace(/\[(C|S)\]/g, "");
      return {
        ...acc,
        [currentCharacter]: [...acc[currentCharacter], { type, ...line, name }],
      };
    }, {});
  fs.writeFileSync("resources/crafts.json", JSON.stringify(crafts, null, 2));
}

function saveArtsPlusQuartz(file) {
  const quartz = xlsx.utils
    .sheet_to_json(file.Sheets["Arts+Quartz"], {
      header: ["japanese", "english", "stats", "notes"],
    })
    .slice(1)
    .reduce((acc, line) => {
      if (Object.keys(line).length === 1) {
        // if (line.japanese.includes("quartz")) {
        //   return acc;
        // }
        return { ...acc, [line.japanese]: [] };
      }
      const currentElement = Object.keys(acc)[Object.keys(acc).length - 1];
      return {
        ...acc,
        [currentElement]: [...acc[currentElement], line],
      };
    }, {});
  fs.writeFileSync(
    "resources/artsPlusQuartz.json",
    JSON.stringify(quartz, null, 2)
  );
}

function saveHollowCores(file) {
  const masterQuartz = xlsx.utils
    .sheet_to_json(file.Sheets["Hollow Cores"], {
      header: ["hollowCore", "unnamedColumn2"],
    })
    .slice(1)
    .reduce((acc, line) => {
      return [...acc, line];
    }, []);
  fs.writeFileSync(
    "resources/hollowCores.json",
    JSON.stringify(masterQuartz, null, 2)
  );
}

function saveShardSkills(file) {
  const rows = xlsx.utils
    .sheet_to_json(file.Sheets["Shard Skills"], {
      header: ["japanese", "english", "requiredElements", "effects"],
    })
    .slice(1)
    .reduce((acc, line) => {
      if (Object.keys(line).length === 1) {
        const trimmedLineJapanese = line.japanese.trim();
        return { ...acc, [trimmedLineJapanese]: [] };
      }
      const currentElement =
        Object.keys(acc)[Object.keys(acc).length - 1].trim();
      return {
        ...acc,
        [currentElement]: [...acc[currentElement], line],
      };
    }, {});
  fs.writeFileSync("resources/shardSkills.json", JSON.stringify(rows, null, 2));
}

function saveArtsDrivers(file) {
  const rows = xlsx.utils
    .sheet_to_json(file.Sheets["Arts Drivers"], {
      header: ["japanese", "english", "arts", "plugInSlots"],
    })
    .slice(1)
    .reduce((acc, line) => {
      return [...acc, line];
    }, []);
  fs.writeFileSync("resources/artsDrivers.json", JSON.stringify(rows, null, 2));
}

function saveItems(file) {
  const items = xlsx.utils
    .sheet_to_json(file.Sheets.Items, {
      header: ["japanese", "english", "effects"],
    })
    .slice(1)
    .reduce((acc, line) => {
      if (Object.keys(line).length === 1) {
        return { ...acc, [line.japanese]: [] };
      }
      const currentCategory = Object.keys(acc)[Object.keys(acc).length - 1];
      return {
        ...acc,
        [currentCategory]: [...acc[currentCategory], line],
      };
    }, {});
  fs.writeFileSync("resources/items.json", JSON.stringify(items, null, 2));
}

function saveAccessories(file) {
  const accessories = xlsx.utils
    .sheet_to_json(file.Sheets.Accessories, {
      header: ["japanese", "english", "effects"],
    })
    .slice(1)
    .reduce((acc, line) => {
      if (Object.keys(line).length === 1) {
        return { ...acc, [line.japanese]: [] };
      }
      const currentCategory = Object.keys(acc)[Object.keys(acc).length - 1];
      return {
        ...acc,
        [currentCategory]: [...acc[currentCategory], line],
      };
    }, {});
  fs.writeFileSync(
    "resources/accessories.json",
    JSON.stringify(accessories, null, 2)
  );
}

module.exports = downloadAndParseCombat;

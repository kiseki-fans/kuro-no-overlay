const path = require("path");

module.exports = function getAppDataPath() {
  switch (process.platform) {
    case "darwin": {
      return path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "kuro-no-overlay"
      );
    }
    case "win32": {
      return path.join(process.env.APPDATA, "kuro-no-overlay");
    }
    case "linux": {
      return path.join(process.env.HOME, ".kuro-no-overlay");
    }
    default: {
      console.log("Unsupported platform!");
      process.exit(1);
    }
  }
};

const axios = require("axios");
require("dotenv").config({ path: __dirname + "/.env" });

async function codeRunner(language, code, input) {
  const urls = {
    JavaScript: "https://glot.io/api/run/javascript/latest",
    Python: "https://glot.io/api/run/python/latest",
    "C/C++": "https://glot.io/api/run/cpp/latest",
  };
  const fileNames = {
    JavaScript: "main.js",
    Python: "main.py",
    "C/C++": "main.cpp",
  };
  const data = {
    stdin: input,
    files: [{ name: fileNames[language], content: code }],
  };
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: urls[language],
      headers: {
        "Content-type": " application/json",
        Authorization: process.env.API_KEY,
      },
      data: data,
    };
    const result = await axios.request(config);
    return result.data;
}

module.exports = codeRunner;
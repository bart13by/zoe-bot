const fs = require("fs");


exports.store = (data, filename) => {
  fs.writeFile(filename, JSON.stringify(data), (err) => {
    if (err) throw err;
    console.log(`Data saved to ${filename}`);
  })
}

exports.read = (filename) => {
  const data = fs.readFileSync(filename, 'utf8');
  return JSON.parse(data);
}
  


const fs = require('fs');
const items = require('../../mix.json');
console.log(`a`)
items.forEach((item) => {
    console.log(fs.existsSync('./organize/resize/500/' + item.country))
    if (!fs.existsSync('./organize/resize/500/' + item.country)) {
        fs.mkdirSync('./organize/resize/500/' + item.country);
    }

    if (!fs.existsSync('./organize/resize/500/' + item.country + '/' + item.city)) {
        fs.mkdirSync('./organizee/resize/500/' + item.country + '/' + item.city);
    }
});

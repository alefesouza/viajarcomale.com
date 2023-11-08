const { translate } = require('bing-translate-api');
const items = require('./items.json');
const fs = require('fs');

items.slice(0, 40).forEach(async (item) => {
  item.description_pt = item.description;
  const description = await translate(item.description, 'pt', 'en');
  item.description = description.translation;

  fs.writeFileSync('helpers/items.json', JSON.stringify(items))
});

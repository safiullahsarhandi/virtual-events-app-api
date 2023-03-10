const ejs = require('ejs');
const path = require('path');
exports.view = (filePath,data = {})=> {
    return ejs.renderFile(path.resolve(__dirname,`../views/${filePath}`),data);
};


exports.getVariation = (attributes,defaultPrice = 0)=> {
    let variation = (attributes.length > 0) 
    ?
      attributes[0].value.price
    : defaultPrice;
    return (parseInt(variation) || defaultPrice);
};


exports.shuffle = (array)=> {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


exports.public_url = (url)=> {
  return `${process.env.PUBLIC_URL}/${url}`
};
import axios from 'axios';
import * as cheerio from 'cheerio';

const { data } = await axios.get('https://www.radiokorea.com/bulletin/bbs/board.php?bo_table=c_realestate', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const $ = cheerio.load(data);
const categories = [];
$('#bo_cate ul li a').each((i, el) => {
  categories.push({text: $(el).text().trim(), href: $(el).attr('href')});
});
console.log('Categories:', categories);

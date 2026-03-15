import axios from 'axios';
import * as cheerio from 'cheerio';

const { data } = await axios.get('https://www.radiokorea.com/bulletin/bbs/board.php?bo_table=c_realty_rent', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const $ = cheerio.load(data);
console.log('Title:', $('title').text());

import axios from 'axios';
import * as cheerio from 'cheerio';

const { data } = await axios.get('https://www.radiokorea.com/bulletin/bbs/board.php?bo_table=c_realestate', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const $ = cheerio.load(data);
console.log('Categories UI:');
$('#bo_cate_ul li a').each((i, el) => {
  console.log($(el).text().trim(), '->', $(el).attr('href'));
});

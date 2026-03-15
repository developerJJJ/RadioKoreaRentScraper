import axios from 'axios';
import * as cheerio from 'cheerio';

const { data } = await axios.get('https://www.radiokorea.com/bulletin/bbs/board.php?bo_table=c_realestate', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const $ = cheerio.load(data);
console.log('Selectors containing "렌트":');
$('a:contains("렌트")').each((i, el) => {
  console.log($(el).text().trim(), $(el).attr('href'));
});

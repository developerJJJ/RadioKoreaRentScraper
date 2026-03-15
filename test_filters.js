import axios from 'axios';
import * as cheerio from 'cheerio';

const { data } = await axios.get('https://www.radiokorea.com/bulletin/bbs/board.php?bo_table=c_realestate', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const $ = cheerio.load(data);
console.log('Filters:');
$('.btn_b01, .sfl, select, nav, ul.tab').each((i, el) => {
  console.log('Found:', $(el).prop('tagName'), $(el).attr('class'), $(el).attr('id'));
  if ($(el).prop('tagName') === 'SELECT') {
    $(el).find('option').each((j, opt) => console.log(' Option:', $(opt).text().trim(), $(opt).attr('value')));
  } else if($(el).prop('tagName') === 'UL') {
    $(el).find('li a').each((j, a) => console.log(' Link:', $(a).text().trim(), $(a).attr('href')));
  }
});

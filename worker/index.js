const request = require('request');
const cheerio = require('cheerio');
const _ = require('lodash');
const url = require('url');
const redis = require('redis');
const schedule = require('node-schedule');

const TOPJOBS_URL = "http://topjobs.lk";
const TOPJOBS_SCRAPE_URL = url.resolve(TOPJOBS_URL, "/applicant/vacancybyfunctionalarea.jsp?FA=SDQ");
const NUMBER_OF_RECORDS = 39;


let scrapePage = (html) => {
    // There are only 39 records on a single page.
    const NUMBER_OF_RECORDS = 39;
    let tableRows = [];
    let $ = cheerio.load(html);
    for (var index = 0; index <= NUMBER_OF_RECORDS; index++) {
        let currentRow = $(`#tr${index}`);
        tableRows.push(currentRow);
    }
    let formattedJobs = [];
    tableRows.forEach(function (line) {
        let position, company, description, link, openingDate, closingDate;
        company = line.find('td:nth-child(3)').find('h1').text().trim();
        position = line.find('td:nth-child(3)').find('h2').text().trim();
        description = line.find('td:nth-child(4)').text().trim();
        openingDate = new Date(line.find('td:nth-child(5)').text().trim());
        closingDate = new Date(line.find('td:nth-child(6)').text().trim());
        let rawLink = line.find('td:nth-child(3)').find('h2').find('a').attr('href').match(/\/(.*).jsp'/g)[0];
        link = url.resolve(TOPJOBS_URL, rawLink);
        formattedJobs.push({
            position,
            company,
            description,
            openingDate,
            closingDate,
            link
        });
    });
    return formattedJobs;

};


// TODO:  Finish this on a later date.
let getImage = (html) => {
    let $ = cheerio.load(html);
    let baseEncodedImage = $('img.vacancy-img').attr('src');
    return baseEncodedImage;
};

let doTheThing = () => {
    console.log('Getting hold of html');
    request.get(TOPJOBS_SCRAPE_URL, (error, response, html) => {
        if (error) console.log(error);
        console.log('Scraping topjobs.lk');
        let formattedJobs = scrapePage(html);
        console.log('scraping completed', JSON.stringify(formattedJobs, null, 2));
        client.set('topjobs-scraper:response', JSON.stringify(formattedJobs));
        client.publish('topjobs-scraper:finished', JSON.stringify(formattedJobs));
    });
};



let client = redis.createClient(6379, process.env.REDIS_URL || 'localhost');

client.on('connect', () => {
    console.log('Connected to redis.');
    doTheThing();
    var job = schedule.scheduleJob({
        hour: 00,
        minute: 00,
        dayOfWeek: 0
    }, function () {
        console.log('Scraping topjobs.lk');
        doTheThing();
    });
});
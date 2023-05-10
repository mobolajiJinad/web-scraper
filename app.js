const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const readline = require("readline");

const visited = new Set();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const scrapeHTML = async (url) => {
  try {
    const response = await axios.get(url);
    console.log("Response obtained");

    const html = response.data;
    return html;
  } catch (err) {
    console.error(`Error fetching source file: ${err}`);
  }
};

const getLinks = (currentUrl, html) => {
  const $ = cheerio.load(html);
  const links = [];

  $("a").each((index, element) => {
    let href = $(element).attr("href");

    if (href && href.startsWith("/") && !visited.has(href)) {
      href = `${currentUrl}${href}`;
      links.push(href);
      visited.add(href);
    }
  });

  return links;
};

const writeToFile = async (filePath, data) => {
  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error(`Error writing to file: ${err}`);
    } else {
      console.log("Data written successfully.");
    }
  });
};

const scrapeAllLinks = async (url) => {
  let linksToScrape = [url];

  while (linksToScrape.length > 0) {
    const currentUrl = linksToScrape.shift();
    console.log(`Scraping ${currentUrl}`);

    const html = await scrapeHTML(currentUrl);
    await writeToFile(
      `./response/${currentUrl.replace(/[^a-zA-Z0-9]/g, "-")}.txt`,
      html
    );

    const links = getLinks(currentUrl, html);
    linksToScrape = [...linksToScrape, ...links];
  }

  console.log("Done");
};

rl.question("Enter URL of website to scrape: ", (URL) => {
  scrapeAllLinks(URL);

  rl.close();
});

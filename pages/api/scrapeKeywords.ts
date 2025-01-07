import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { load } from 'cheerio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const response = await axios.get(`https://www.google.com/search?q=${query}`);
    const html = response.data;
    const $ = load(html);

    // Extract relevant data from the HTML
    const keywords: string[] = []; // Define the type explicitly
    $('a h3').each((i, element) => {
      const keyword = $(element).text();
      keywords.push(keyword);
    });

    res.status(200).json(keywords);
  } catch (error) {
    console.error('Error scraping data:', (error as Error).message);
    res.status(500).json({ error: 'Failed to scrape data' });
  }
}

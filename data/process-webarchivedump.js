const fs = require('fs');
const url = require('url');

// Function to extract date from URL
function extractDateFromUrl(urlString) {
  const match = urlString.match(/(\d{1,2})-([a-z]+)-(\d{4})/i);
  if (match) {
    const [, day, month, year] = match;
    const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;
    return `${year}-${monthNumber.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
}

// Function to strip parameters from URL
function stripUrlParams(urlString) {
  const parsedUrl = new URL(urlString);
  return `${parsedUrl.origin}${parsedUrl.pathname}`;
}

// Read the input file
fs.readFile('webarchive-urls.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    const inputArray = JSON.parse(data);
    
    // Set to keep track of unique URLs
    const uniqueUrls = new Set();
    
    // Process the array
    const processedArray = inputArray.reduce((acc, item) => {
      const fullUrl = item[2];
      const strippedUrl = stripUrlParams(fullUrl);
      
      if (!uniqueUrls.has(strippedUrl)) {
        uniqueUrls.add(strippedUrl);
        const date = extractDateFromUrl(fullUrl);
        if (date) {
          acc.push({ url: fullUrl, date });
        }
      }
      return acc;
    }, []);

    // Sort by date
    processedArray.sort((a, b) => a.date.localeCompare(b.date));

    // Write the result to a file
    fs.writeFile('webarchive-output.json', JSON.stringify(processedArray, null, 2), err => {
      if (err) {
        console.error('Error writing file:', err);
      } else {
        console.log('Processing complete. Check webarchive-output.json for results.');
        console.log(`Processed ${inputArray.length} items, found ${processedArray.length} unique URLs.`);
      }
    });
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
  }
});
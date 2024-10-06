// ###############################################
// ### Service Worker Registration ###
// ###############################################

// Check if the browser supports service workers
if ('serviceWorker' in navigator) {
    // Add an event listener that triggers when the window loads
    window.addEventListener('load', () => {
        // Attempt to register the service worker located at '/sw.js'
        navigator.serviceWorker
            .register('/sw.js')
            .then(req => {
                // Log a success message upon successful registration
                console.log('Service Worker: Registered successfully');
            })
            .catch((err) => {
                // Log an error message if registration fails
                console.log('Service Worker: Registration Error', err);
            });
    });
}

// ###############################################
// ### Input Sanitization Function ###
// ###############################################

/**
 * Sanitizes user input by removing non-letter and non-space characters.
 * @param {string} inputValue - The raw input string from the user.
 * @returns {string} - The sanitized input or an error message.
 */
function sanitizeInput(inputValue) {
    // Check if the sanitized input contains only letters and spaces using a regular expression
    const isTextual = /^[a-zA-Z\s]*$/.test(inputValue.trim());

    // Remove any non-letter and non-space characters from the input
    const sanitizedInput = inputValue.replace(/[^a-zA-Z\s]/g, '').trim();

    // Return the sanitized input if valid; otherwise, return an error message
    return isTextual ? sanitizedInput : 'Please provide a valid word';
}

// ###############################################
// ### Convert Array to Ordered List ###
// ###############################################

/**
 * Converts an array of strings into an ordered HTML list.
 * @param {Array<string>} array - The array of strings to convert.
 * @returns {HTMLElement} - The resulting ordered list element.
 */
function arrayToOrderedList(array) {
    // Create an ordered list (<ol>) element
    const ol = document.createElement('ol');

    // Add Bootstrap classes to style the ordered list
    ol.classList.add('list-group', 'list-group-numbered');

    // Iterate through each item in the array
    array.forEach(item => {
        // Create a list item (<li>) element for each rhyme
        const li = document.createElement('li');

        // Add Bootstrap class to style the list item
        li.classList.add('list-group-item');

        // Set the text content of the list item to the current rhyme
        li.textContent = item;

        // Append the list item to the ordered list
        ol.appendChild(li);
    });

    // Return the completed ordered list
    return ol;
}

// ###############################################
// ### Function to Estimate Syllable Count ###
// ###############################################
function countSyllables(word) {
    // Convert the word to lowercase to ensure consistency
    word = word.toLowerCase();

    // Handle very short words which typically have 1 syllable
    if (word.length <= 3) return 1;

    // Remove silent 'e' and other common endings that don't add syllables
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');

    // Remove leading 'y' as it can act as a vowel in some cases
    word = word.replace(/^y/, '');

    // Match vowel groups (a, e, i, o, u, y) to estimate syllables
    const syllableMatches = word.match(/[aeiouy]{1,2}/g);

    // Return the number of vowel groups as the syllable count
    return syllableMatches ? syllableMatches.length : 1;
}

// ###############################################
// ### Find Rhymes by Last Three Letters ###
// ###############################################

/**
 * Finds rhyming words by comparing the last three letters of the input word.
 * @param {string} wordToRhyme - The word for which to find rhymes.
 * @param {Array<Object>} rhymesArray - The array of rhyme objects to search through.
 * @returns {Array<string>} - An array of rhyming words or an empty array if no match is found.
 */
function findRhymesByLastThreeLetters(wordToRhyme, rhymesArray) {
    // Extract the last three letters of the input word and convert to lowercase
    const lastThreeLetters = wordToRhyme.slice(-3).toLowerCase();

    // Iterate through each rhyme object in the array
    for (const rhymeObject of rhymesArray) {
        // Extract the last three letters of the current rhyme word and convert to lowercase
        const rhymeWordLastThreeLetters = rhymeObject.word.slice(-3).toLowerCase();

        // Compare the last three letters of both words
        if (rhymeWordLastThreeLetters === lastThreeLetters) {
            // If a match is found, return the associated rhymes
            return rhymeObject.rhymes;
        }
    }

    // Return an empty array if no matching rhymes are found
    return [];
}

// ###############################################
// ### Append API Rhymes to JSON Array ###
// ###############################################

/**
 * Appends a new rhyme entry to the existing rhymes array.
 * @param {string} wordToRhyme - The word for which rhymes are being appended.
 * @param {Array<string>} rhymes - The array of rhyming words to append.
 * @param {Array<Object>} arr - The existing array of rhyme objects.
 * @returns {Array<Object>} - The updated array with the new rhyme entry.
 */
function appendApiRhymesToJsonArr(wordToRhyme, rhymes, arr) {
    // Create a new rhyme object with the input word and its rhymes
    const newEntry = {
        word: wordToRhyme,
        rhymes: rhymes
    };

    // Add the new rhyme object to the existing array
    arr.push(newEntry);

    // Return the updated array
    return arr;
}

// ###############################################
// ### DOMContentLoaded Event Listener ###
// ###############################################

document.addEventListener("DOMContentLoaded", () => {
    // ###############################################
    // ### Add Global Event Listener Function ###
    // ###############################################

    /**
     * Adds a global event listener that delegates events to specific selectors.
     * @param {string} type - The type of event to listen for (e.g., 'click', 'submit').
     * @param {string} selector - The CSS selector to match the event target.
     * @param {Function} callback - The function to execute when the event is triggered.
     * @param {Object} [options] - Optional parameters for event listening.
     */
    function addGlobalEventListener(type, selector, callback, options) {
        // Add an event listener to the entire document
        document.addEventListener(
            type,
            e => {
                // If the event target matches the selector, execute the callback
                if (e.target.matches(selector)) callback(e);
            },
            options
        );
    }

    // ###############################################
    // ### Add Footer Function ###
    // ###############################################

    /**
     * Adds a dynamic footer with the current year and author information.
     */
    function addFooter(){
        // Select the footer element by its ID
        const copyrightElement = document.getElementById("copyright");

        // Get the current year
        const currentYear = new Date().getFullYear();

        // Insert the copyright notice with the current year
        copyrightElement.innerHTML = `&copy; ${currentYear} Yulia Tarima. All rights reserved`;
    }

    // Call the addFooter function to populate the footer
    addFooter();

    // ###############################################
    // ### Populate Element by ID Function ###
    // ###############################################

    /**
     * Populates a DOM element with specified content.
     * @param {string} targetElementId - The ID of the target DOM element.
     * @param {string} contentToInsert - The HTML content to insert into the element.
     */
    function populateById(targetElementId, contentToInsert) {
        // Select the target element by its ID and set its inner HTML
        document.getElementById(targetElementId).innerHTML = contentToInsert;
    }

    // ###############################################
    // ### Fetch Rhyming Words from API Function ###
    // ###############################################

    /**
     * Fetches rhyming words from the Datamuse API.
     * @param {string} wordToRhyme - The word for which to fetch rhymes.
     * @returns {Promise<Array<string>>} - A promise that resolves to an array of rhyming words.
     */
    async function fetchRhymingWordsArrayAPI(wordToRhyme) {
        try {
            // Log that the application is online and fetching from API
            if (navigator.onLine) {
                console.log(`Fetching rhyming words for "${wordToRhyme}" from API (Online).`);
            } else {
                console.log(`Cannot fetch from API because the application is offline.`);
                // Return a fallback message
                return ['no matching words found'];
            }

            // Fetch rhyming words from the Datamuse API with a maximum of 50 results
            const response = await fetch(`https://api.datamuse.com/words?rel_rhy=${wordToRhyme}&max=50`);

            // Parse the JSON response
            const data = await response.json();

            // Determine the number of syllables in the word to rhyme
            const syllableCount = countSyllables(wordToRhyme);
            console.log(`"${wordToRhyme}" has ${syllableCount} syllable(s).`);

            // Filter the fetched data to include only words with the same syllable count
            const filteredData = data.filter(item => countSyllables(item.word) === syllableCount);

            // Check if any rhyming words match the syllable count
            if (filteredData.length === 0) {
                // Log that no matching syllable rhymes were found in the API data
                console.log(`No rhymes found with ${syllableCount} syllable(s) for "${wordToRhyme}" from API.`);
                // Return a fallback message
                return ['no matching words found'];
            }

            const rhymesResultArr = data
                // Filter the data to include only words with the same syllable count as 'wordToRhyme'
                .filter(item => countSyllables(item.word) === syllableCount)
                // Sort the filtered data by score in descending order
                .sort((a, b) => b.score - a.score)
                // Slice the top 10 most relevant rhymes
                .slice(0, 10)
                // Map the filtered and sorted data to extract only the 'word' property
                .map(item => item.word);

            // Log the source and the top rhyming words fetched from the API
            console.log(`Fetched top rhymes from API for "${wordToRhyme}":`, rhymesResultArr);

            // Return the top rhyming words
            return rhymesResultArr;

        } catch (error) {
            // Log any errors that occur during the fetch process
            console.error('Error fetching rhyming words from API:', error);

            // Return a fallback message if an error occurs
            return ['no matching words found'];
        }
    }

    // ###############################################
    // ### Fetch Rhyming Words from JSON Function ###
    // ###############################################

    /**
     * Fetches rhyming words from a local JSON file.
     * @param {string} filePath - The path to the JSON file containing rhyming words.
     * @returns {Promise<Array<Object>>} - A promise that resolves to an array of rhyme objects.
     */
    async function fetchRhymingWordsArrayJson(filePath) {
        try {
            // Log that the application is fetching from JSON
            console.log(`Fetching rhyming words for JSON from "${filePath}".`);

            // Fetch the JSON file containing rhyming words
            const response = await fetch(filePath);

            // Parse and return the JSON data
            return await response.json();
        } catch (error) {
            // Log any errors that occur during the fetch process
            console.error('Error fetching rhyming words from JSON:', error);

            // Return an empty array if an error occurs
            return [];
        }
    }

    // ###############################################
    // ### Fetch and Insert HTML Function ###
    // ###############################################

    /**
     * Fetches an HTML snippet and inserts it into the DOM.
     * @param {Object} params - The parameters for fetching and inserting HTML.
     * @param {string} params.sourceURL - The URL of the HTML snippet to fetch.
     * @param {string} params.targetElementId - The ID of the target DOM element to insert the HTML.
     * @param {string} params.wordToRhyme - The word that was used to find rhymes.
     * @param {HTMLElement} params.rhymesResultHTML - The HTML element containing rhyming words.
     */
    async function fetchAndInsertHTML({sourceURL, targetElementId, wordToRhyme, rhymesResultHTML}) {
        try {
            // Fetch the HTML snippet from the specified source URL
            const response = await fetch(sourceURL);
            const htmlContent = await response.text();

            // Insert the fetched HTML into the target DOM element
            document.getElementById(targetElementId).innerHTML = htmlContent;

            // Populate the card title with the word to rhyme
            populateById('cardTitle', wordToRhyme);

            // Append the rhyming words ordered list to the card text
            document.getElementById('cardText').appendChild(rhymesResultHTML);

            // Log that the HTML has been successfully inserted
            console.log(`Inserted HTML from "${sourceURL}" into element with ID "${targetElementId}".`);

        } catch (error) {
            // Log any errors that occur during the fetch and insert process
            console.error('Error fetching and inserting HTML:', error);
        }
    }

    // ###############################################
    // ### Form Submission Event Listener ###
    // ###############################################

    // Add a global event listener for the form submission
    addGlobalEventListener(
        "submit",               // Event type to listen for
        "#inputWordForm",      // CSS selector for the form
        async (e) => {          // Callback function to handle the event
            // Prevent the default form submission behavior
            e.preventDefault();

            // Get the value from the input field and sanitize it
            const inputWord = e.target.querySelector('#inputWord').value;
            const wordToRhyme = sanitizeInput(inputWord);

            /*
            Try to find and display a match from the local JSON
            If no matches & online - display rhyming words from API *TODO: &append them to JSON
            If no matches & offline - display error
             */
            try {
                // Initialize an array to hold the rhyming results
                const rhymesResultArr = [];

                // Fetch the rhymes array from the local JSON file
                const jsonRhymesArray = await fetchRhymingWordsArrayJson('./rhymes.json');

                // Find rhymes in the JSON array by matching the last three letters
                const rhymesMatchFromJson = findRhymesByLastThreeLetters(wordToRhyme, jsonRhymesArray);

                // Check if any rhymes were found in the JSON array
                if (rhymesMatchFromJson.length === 0) {
                    // If no rhymes found in JSON, check if APP is online to fetch from API
                    if (navigator.onLine) {
                        // Log that no rhymes were found in JSON and fetching from API
                        console.log(`No rhymes found in JSON for "${wordToRhyme}". Fetching from API.`);

                        // Fetch rhyming words from the API
                        const rhymesFromAPI = await fetchRhymingWordsArrayAPI(wordToRhyme);

                        // Add each fetched rhyme to the rhymes result array
                        rhymesFromAPI.forEach(rhyme => rhymesResultArr.push(rhyme));

                        /*TODO
                        append fetched values to json file
                        */
                    } else {
                        // Log that the application is offline and cannot fetch from API
                        console.log(`No rhymes found in JSON for "${wordToRhyme}" and application is offline.`);

                        // Add a fallback message to the rhymes result array
                        rhymesResultArr.push('Application is offline. \nNo rhymes available in JSON file.');
                    }
                // Else show matched rhymes from JSON
                } else {
                    // If rhymes are found in JSON, add them to the rhymes result array
                    console.log(`Found rhymes for "${wordToRhyme}" in JSON.`);
                    rhymesMatchFromJson.forEach(rhyme => rhymesResultArr.push(rhyme));
                }

                // Convert the rhymes result array into an ordered HTML list
                const rhymesResultHTML = arrayToOrderedList(rhymesResultArr);

                // Fetch and insert the HTML snippet with the rhyming results
                await fetchAndInsertHTML({
                    sourceURL: 'card.html',            // URL of the HTML snippet to fetch
                    targetElementId: 'rhymingResults', // ID of the target DOM element
                    wordToRhyme,                        // The word to rhyme
                    rhymesResultHTML,                   // The ordered list of rhymes
                });
            } catch (error) {
                // Log any errors that occur during the form submission handling
                console.error('Error handling form submission:', error);
            }
        },
        // { once: true } // Optional parameter to specify event listener options
    );

});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then(req => {
                console.log('Service Worker: Registered')
            })
            .catch((err) => {
                console.log('Service Worker: Registration Error', err);
            });
    })
}

function sanitizeInput(inputValue) {
    // Check if sanitized input contains only letters and spaces
    const isTextual = /^[a-zA-Z\s]*$/.test(inputValue.trim());
    // Use regex to remove any non-textual characters (anything that's not a letter or space)
    const sanitizedInput = inputValue.replace(/[^a-zA-Z\s]/g, '').trim();
    return isTextual ? sanitizedInput : 'Please provide a valid word';
}

function arrayToOrderedList(array) {
    // Create an ordered list
    const ol = document.createElement('ol');
    // Add class to <ol>
    ol.classList.add('list-group', 'list-group-numbered');

    // Append each value as a list item
    array.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = item;
        ol.appendChild(li);
    });

    return ol;
}

function findRhymesByLastTwoLetters(wordToRhyme, rhymesArray) {
    // Extract the last two letters of the wordToRhyme
    const lastTwoLetters = wordToRhyme.slice(-2).toLowerCase();

    // Iterate through the rhymesArray to find a match
    for (const rhymeObject of rhymesArray) {
        const rhymeWordLastTwoLetters = rhymeObject.word.slice(-2).toLowerCase();

        // Compare the last two letters
        if (rhymeWordLastTwoLetters === lastTwoLetters) {
            return rhymeObject.rhymes;
        }
    }

    // Return an empty array if no match is found
    return [];
}

function appendApiRhymesToJsonArr(wordToRhyme, rhymes, arr) {
    const newEntry = {
        word: wordToRhyme,
        rhymes: rhymes
    };
    arr.push(newEntry);
    return arr;
}

document.addEventListener("DOMContentLoaded", () => {
    function addGlobalEventListener(type, selector, callback, options) {
        document.addEventListener(
            type,
            e => {
                if (e.target.matches(selector)) callback(e);
            },
            options
        );
    }

    function populateById(targetElementId, contentToInsert) {
        document.getElementById(targetElementId).innerHTML = contentToInsert;
    }

    async function fetchRhymingWordsArrayAPI(wordToRhyme) {
        try {
            const response = await fetch(`https://api.datamuse.com/words?rel_rhy=${wordToRhyme}&max=50`);
            const data = await response.json();

            // Extract 10 most relevant words from the data array
            return data
                .sort((a, b) => b.score - a.score)
                .slice(0, 10)
                .map(item => item.word);

        } catch (error) {
            console.error('Error:', error);
            return ['no matching words found'];
        }
    }

    async function fetchRhymingWordsArrayJson(filePath) {
        const response = await fetch(filePath);
        return await response.json();
    }

    async function fetchAndInsertHTML({sourceURL, targetElementId, wordToRhyme, rhymesResultHTML}) {
        try {
            const response = await fetch(sourceURL);
            const htmlContent = await response.text();

            // Insert html into target element
            document.getElementById(targetElementId).innerHTML = htmlContent;
            // Populate html
            populateById('cardTitle', wordToRhyme);
            // populateById('cardText', rhymesResultArr);
            document.getElementById('cardText').appendChild(rhymesResultHTML);

        } catch (error) {
            console.error('Error fetching the HTML:', error);
        }
    }

    addGlobalEventListener(
        "submit",
        "#inputWordForm",
        async (e) => {
            // Do not submit the traditional way
            e.preventDefault();

            // Get the value from the input field and sanitize it
            const inputWord = e.target.querySelector('#inputWord').value;
            const wordToRhyme = sanitizeInput(inputWord);

            try {
                const rhymesResultArr = [];
                const jsonRhymesArray = await fetchRhymingWordsArrayJson('./rhymes.json');
                console.log('initial jsonRhymesArray', jsonRhymesArray);

                const rhymesMatchFromJson = findRhymesByLastTwoLetters(wordToRhyme, jsonRhymesArray)
                if (rhymesMatchFromJson.length === 0) {
                    console.log('!rhymesMatchFromJson', rhymesMatchFromJson, rhymesMatchFromJson.length);
                    const rhymesFromAPI = await fetchRhymingWordsArrayAPI(wordToRhyme);
                    console.log('newJson', appendApiRhymesToJsonArr(wordToRhyme, rhymesFromAPI, jsonRhymesArray));
                    // rhymesResultArr.push(rhymesFromAPI);
                    rhymesFromAPI.forEach(rhyme => rhymesResultArr.push(rhyme));
                } else {
                    console.log('rhymesMatchFromJson', rhymesMatchFromJson);
                    // rhymesResultArr.push(rhymesMatchFromJson);
                    rhymesMatchFromJson.forEach(rhyme => rhymesResultArr.push(rhyme));
                }
                // console.log('rhymesResultArr', rhymesResultArr, 'typeof ', typeof (rhymesResultArr));

                const rhymesResultHTML = arrayToOrderedList(rhymesResultArr);
                console.log('rhymesResultsHTML', rhymesResultHTML);

                await fetchAndInsertHTML({
                    sourceURL: 'card.html',
                    targetElementId: 'rhymingResults',
                    wordToRhyme,
                    rhymesResultHTML,
                });
            } catch (error) {
                console.error('Error:', error);
            }
        },
        // { once: true }
    )

})
;




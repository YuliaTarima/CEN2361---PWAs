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

    async function fetchRhymingWordsArray(wordToRhyme) {
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

    async function getFileData(filePath) {
        // const fileData = await import(filePath);
        // // If using dynamic import, the content is accessed via `.default`
        // console.log(fileData.default);
        // JSON.parse(fileData);
        // return fileData.default;
        const response = await fetch(filePath);
        return await response.json();
    }

async function appendToOrderedWordsFile(wordToRhyme, rhymes) {
    // // Read the existing JSON data
    // const orderedWordsArray = await getFileData('./sortedWords.json');
    // console.log('orderedWordsArray', orderedWordsArray);

    // import fileData from './sortedWords.json';

    // Create a new entry
    const newEntry = {
        word: wordToRhyme,
        rhymes: rhymes
    };

    // Append the new entry to the array
    // orderedWordsArray.push(newEntry);
    //const jsonString = JSON.stringify(orderedWordsJson);

}

async function fetchAndInsertHTML({sourceURL, targetElementId, wordToRhyme, rhymingWordsOrderedList}) {
    try {
        const response = await fetch(sourceURL);
        const htmlContent = await response.text();

        // Insert html into target element
        document.getElementById(targetElementId).innerHTML = htmlContent;
        // Populate html
        populateById('cardTitle', wordToRhyme);
        document.getElementById('cardText').appendChild(rhymingWordsOrderedList);

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
            const jsonArray = await getFileData('./sortedWords.json');
            console.log('jsonArray', jsonArray);

            /*TODO:
            check if wordToRhyme rhymes with anything in json Array
            if rhymes output json
            else fetch from API
            then append API results to rhymes.json
            * */
            const rhymes = await fetchRhymingWordsArray(wordToRhyme);
            // await appendToOrderedWordsFile(wordToRhyme, rhymes);

            const rhymingWordsOrderedList = arrayToOrderedList(rhymes);

            await fetchAndInsertHTML({
                sourceURL: 'card.html',
                targetElementId: 'rhymingResults',
                wordToRhyme,
                rhymingWordsOrderedList
            });
        } catch (error) {
            console.error('Error:', error);
        }
    },
    // { once: true }
)

})
;




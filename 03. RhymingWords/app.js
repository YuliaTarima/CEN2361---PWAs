// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js')
//         .then(function (registration) {
//             console.log('Service Worker registered with scope:', registration.scope);
//     }).catch(function (error) {
//         console.log('Service Worker registration failed:', error);
//     });
// }


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

    // function appendById(targetElementId, contentToInsert) {
    //     document.getElementById(targetElementId).appendChild(contentToInsert);
    // }

    // async fetches
    async function fetchRhymingWordsArray(wordToRhyme) {
        return await fetch(`https://api.datamuse.com/words?rel_rhy=${wordToRhyme}&max=10`)
            .then(response => response.json())
            .then(data => {
                // Extract the words from the data array
                return data.map(item => item.word);
            })
            .catch(error => {
                console.error('Error:', error);
                return [];
            });
    }

    async function fetchAndInsertHTML(
        {   sourceURL,
            targetElementId,
            wordToRhyme,
            rhymingWordsOrderedList
        }) {
        // Use the Fetch API to get the HTML content from the specified sourceURL
        return await fetch(sourceURL)
            .then(response => response.text())  // Parse the response as text
            .then(data => {
                // Insert the fetched HTML content into the specified target element
                document.getElementById(targetElementId).innerHTML = data;
                populateById('cardTitle', wordToRhyme);
                // populateById('cardText', rhymingWordsOrderedList);
                document.getElementById('cardText').appendChild(rhymingWordsOrderedList);
            })
            .catch(error => console.error('Error fetching the HTML:', error));
    }

    addGlobalEventListener(
        "submit",
        "#inputWordForm",
        (e) => {
            // Prevent the form from submitting the traditional way
            e.preventDefault();

            // Get the value from the input field and sanitize it
            const inputWord = e.target.querySelector('#inputWord').value;
            const wordToRhyme = sanitizeInput(inputWord);
            // const rhymesArr = [];

            const rhymingWordsOrderedList = fetchRhymingWordsArray(wordToRhyme)
                .then(rhymes => {
                    console.log('rhymes', rhymes);
                    console.log('arrayToOrderedList(rhymes)', arrayToOrderedList(rhymes))
                    return arrayToOrderedList(rhymes)
                }).then(rhymingWordsOrderedList => {
                    fetchAndInsertHTML({
                        sourceURL: 'card.html',
                        targetElementId: 'rhymingResults',
                        wordToRhyme,
                        rhymingWordsOrderedList
                    }).then(r => console.log('fetchAdndInsetHTML'))
                })
                .catch(error => console.error('Error:', error));

            // fetchAndInsertHTML({
            //     sourceURL: 'card.html',
            //     targetElementId: 'rhymingResults',
            //     wordToRhyme,
            //     rhymingWordsOrderedList
            // }).then(r => console.debug('rhymingWordsOrderedList', rhymingWordsOrderedList))


        },
        // { once: true }
    )


});




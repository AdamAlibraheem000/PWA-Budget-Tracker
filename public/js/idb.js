// variable to hold db connection
let db;

// establish connection to IndexedDB database 'budgetDB'; set to version one
const request = indexedDB.open('budgetDB', 1);

request.onupgradeneeded = function(event){
    const db = event.target.result;
    db.createObjectStore('new_budget', {autoIncrement: true});
}

request.onsuccess = function(event){
    db = event.target.result;
    if(navigator.onLine){
        // uploadBudget();
    }
}

request.onerror = function(event){
    console.log(event.target.errorCode);
}

// Executed when new data is submited with no internet connection
function saveRecord(record){
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    budgetObjectStore.add(record);
}

function uploadBudget(){
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function(){
        if(getAll.result.length > 0){
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse);
                }
                // open another transaction
                const transaction =db.transaction(['new_budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_budget');
                budgetObjectStore.clear();

                alert("All saved budget data has been submitted")
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
}

// listen for app to come back online
window.addEventListener('online', uploadBudget);
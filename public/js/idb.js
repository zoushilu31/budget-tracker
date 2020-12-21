let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store (table) called 'new_transaction' set it to have an auto increment primary key of sorts
    db.createObjectStore('new_transaction', { autoIncrement: true });
}

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    transactionObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
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
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');

                const transactionObjectStore = transaction.objectStore('new_transaction');
                transactionObjectStore.clear();

                alert('All saved transactions have been uploaded!');
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}

window.addEventListener('online', uploadTransaction);
let db;

// budget database
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    // create object store called "pendingStore" and set auto-increment to true
    db = event.target.result;

    const pendingStore = db.createObjectStore("pending", {
        autoIncrement: true
    });

};

request.onsuccess = function (event) {
    db = event.target.result;

    // if we're back online
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(request.errorCode);
};

// save transactions to DB if offline
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    console.log("Offline - Saving Transaction in IndexedDB");
    console.log(record);
    pendingStore.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");

    const getAll = pendingStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const pendingStore = transaction.objectStore("pending");
                    console.log("Online - Post Transactions and Clear IndexedDB");
                    pendingStore.clear();

                });
        }
    };
}

// listen for when we come back online, and when we do, run the checkDatabase function
window.addEventListener('online', checkDatabase);
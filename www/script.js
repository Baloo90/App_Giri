// Controllo delle TAB
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// Array per memorizzare i dati
let dataEntries = JSON.parse(localStorage.getItem("dataEntries")) || [];

// Associazioni Materiale-Colore
const materialColors = {
    "Plastica": "rgb(255, 255, 0)", // Giallo
    "Vetro": "rgb(144, 238, 144)", // Verde prato chiaro
    "Carta": "rgb(173, 216, 230)", // Azzurro
    "Organico": "rgb(150, 75, 0)",  // Marrone terra di Siena
    "Secco": "rgb(211, 211, 211)"  // Grigio chiaro
};

// Funzione per determinare il colore del testo in base al colore di sfondo
function getTextColor(backgroundColor) {
    const rgb = backgroundColor
        .replace(/[^\d,]/g, '')
        .split(',')
        .map(Number);

    const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Funzione per formattare la data
function formatDate(inputDate) {
    const date = new Date(inputDate);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

// Funzione per aggiungere una riga alla tabella
function addRow(dataEntry, isCurrentDay = false) {
    const dataTable = document.getElementById("data-table").getElementsByTagName("tbody")[0];
    const row = dataTable.insertRow();

    const dayCell = row.insertCell(0);
    const dataCell = row.insertCell(1);
    const giroCell = row.insertCell(2);
    const materialeCell = row.insertCell(3);
    const furgoneCell = row.insertCell(4);
    const caposquadraCell = row.insertCell(5);
    const noteCell = row.insertCell(6);
    const actionsCell = row.insertCell(7);

    const date = new Date(dataEntry.data);
    dayCell.textContent = date.getDate();
    dataCell.textContent = formatDate(dataEntry.data);
    giroCell.textContent = dataEntry.giro;
    materialeCell.textContent = dataEntry.materiale;
    furgoneCell.textContent = dataEntry.furgone;
    caposquadraCell.textContent = dataEntry.caposquadra;
    noteCell.textContent = dataEntry.note;

    // Assegna il colore in base al materiale
    if (materialColors[dataEntry.materiale]) {
        materialeCell.style.backgroundColor = materialColors[dataEntry.materiale];
        materialeCell.style.color = getTextColor(materialColors[dataEntry.materiale]); // Colore del testo
    }

    if (isCurrentDay) {
        row.classList.add("current-day");
    }

    actionsCell.innerHTML = `
        <button class="edit-button">Modifica</button>
        <button class="delete-button">Elimina</button>
    `;

    actionsCell.querySelector(".edit-button").addEventListener("click", () => editRow(row, dataEntry));
    actionsCell.querySelector(".delete-button").addEventListener("click", () => deleteRow(row, dataEntry));
}

// Funzione per salvare i dati dal form
function saveData(event) {
    event.preventDefault();

    const form = document.getElementById("data-form");
    const dataEntry = {
        data: form.data.value,
        giro: form.giro.value,
        materiale: form.materiale.value,
        furgone: form.furgone.value,
        caposquadra: form.caposquadra.value,
        note: form.note.value,
    };

    const existingEntryIndex = dataEntries.findIndex(
        entry => formatDate(entry.data) === formatDate(dataEntry.data)
    );

    if (existingEntryIndex > -1) {
        dataEntries[existingEntryIndex] = dataEntry;

        const tableRows = document.getElementById("data-table").getElementsByTagName("tbody")[0].rows;
        const rowToUpdate = tableRows[existingEntryIndex];
        updateRow(rowToUpdate, dataEntry);
    } else {
        dataEntries.push(dataEntry);
        const today = new Date();
        addRow(
            dataEntry,
            today.getDate() === new Date(dataEntry.data).getDate() &&
            today.getMonth() === new Date(dataEntry.data).getMonth() &&
            today.getFullYear() === new Date(dataEntry.data).getFullYear()
        );
    }

    localStorage.setItem("dataEntries", JSON.stringify(dataEntries));
    form.reset();
}
// Funzione per aggiornare una riga esistente nella tabella
function updateRow(row, dataEntry) {
    const cells = row.cells;
    cells[1].textContent = formatDate(dataEntry.data);
    cells[2].textContent = dataEntry.giro;
    cells[3].textContent = dataEntry.materiale;
    cells[4].textContent = dataEntry.furgone;
    cells[5].textContent = dataEntry.caposquadra;
    cells[6].textContent = dataEntry.note;

    // Aggiorna il colore in base al materiale
    if (materialColors[dataEntry.materiale]) {
        cells[3].style.backgroundColor = materialColors[dataEntry.materiale];
        cells[3].style.color = getTextColor(materialColors[dataEntry.materiale]); // Colore del testo
    } else {
        cells[3].style.backgroundColor = ""; // Ripristina colore di default
        cells[3].style.color = ""; // Ripristina colore di default
    }
}

// Funzione per modificare una riga
function editRow(row, dataEntry) {
    const form = document.getElementById("data-form");

    form.data.value = dataEntry.data;
    form.giro.value = dataEntry.giro;
    form.materiale.value = dataEntry.materiale;
    form.furgone.value = dataEntry.furgone;
    form.caposquadra.value = dataEntry.caposquadra;
    form.note.value = dataEntry.note;

    form.removeEventListener("submit", saveData);

    form.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            const previousDate = dataEntry.data;

            dataEntry.data = form.data.value;
            dataEntry.giro = form.giro.value;
            dataEntry.materiale = form.materiale.value;
            dataEntry.furgone = form.furgone.value;
            dataEntry.caposquadra = form.caposquadra.value;
            dataEntry.note = form.note.value;

            localStorage.setItem("dataEntries", JSON.stringify(dataEntries));

            if (formatDate(previousDate) !== formatDate(dataEntry.data)) {
                clearRow(row);
                loadMonthData(new Date(previousDate).getMonth(), new Date(previousDate).getFullYear());
                addRowToSpecificMonth(dataEntry);
            } else {
                updateRow(row, dataEntry);
            }

            form.reset();
        },
        { once: true }
    );
}

// Funzione per esportare i dati in un file CSV
function exportToCSV() {
    if (dataEntries.length === 0) {
        alert("Nessun dato disponibile per l'esportazione.");
        return;
    }

    // Creazione dei dati CSV
    let csvContent = "Giorno,Data,Giro,Materiale,Furgone,Caposquadra,Note\n"; // Intestazioni
    dataEntries.forEach(entry => {
        const day = new Date(entry.data).getDate();
        const formattedDate = formatDate(entry.data);
        const row = [
            day,
            formattedDate,
            entry.giro,
            entry.materiale,
            entry.furgone,
            entry.caposquadra,
            entry.note
        ].map(value => `"${value}"`).join(",");
        csvContent += row + "\n";
    });

    // Salvataggio del file su Android
    if (window.resolveLocalFileSystemURL) {
        // Scrivi il file nella directory locale dell'app
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dirEntry) {
            dirEntry.getFile("registro_giri.csv", { create: true }, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function () {
                        alert("File esportato con successo: " + fileEntry.nativeURL);
                    };
                    fileWriter.onerror = function (e) {
                        alert("Errore durante l'esportazione: " + e.toString());
                    };
                    const blob = new Blob([csvContent], { type: "text/csv" });
                    fileWriter.write(blob);
                });
            });
        });
    } else {
        alert("La funzione di esportazione non è supportata su questo dispositivo.");
    }
}

// Aggiungi l'evento al pulsante "Esporta dati"
document.getElementById("export-button").addEventListener("click", exportToCSV);

// Funzione per svuotare una riga
function clearRow(row) {
    const cells = row.cells;
    for (let i = 1; i < cells.length - 1; i++) {
        cells[i].textContent = "";
        cells[i].style.backgroundColor = ""; // Rimuove il colore di sfondo
    }
}

// Funzione per caricare i dati di un mese
function loadMonthData(selectedMonth, selectedYear) {
    const dataTable = document.getElementById("data-table").getElementsByTagName("tbody")[0];
    dataTable.innerHTML = "";

    const today = new Date();
    const isCurrentMonth = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;

    for (let day = 1; day <= 31; day++) {
        const currentDate = new Date(selectedYear, selectedMonth, day);
        if (currentDate.getMonth() !== selectedMonth) break;

        const dataEntry = dataEntries.find(
            (entry) => formatDate(entry.data) === formatDate(currentDate.toISOString())
        );

        addRow(
            dataEntry || {
                data: currentDate.toISOString(),
                giro: "",
                materiale: "",
                furgone: "",
                caposquadra: "",
                note: "",
            },
            isCurrentMonth && today.getDate() === day
        );
    }
}

// Funzione per aggiungere una riga a un mese specifico
function addRowToSpecificMonth(dataEntry) {
    const selectedMonth = new Date(dataEntry.data).getMonth();
    const selectedYear = new Date(dataEntry.data).getFullYear();
    const dayOfMonth = new Date(dataEntry.data).getDate();

    const dataTable = document.getElementById("data-table").getElementsByTagName("tbody")[0];
    const rows = dataTable.rows;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const dayCell = row.cells[0];
        if (parseInt(dayCell.textContent) === dayOfMonth) {
            updateRow(row, dataEntry);
            return;
        }
    }

    // Se il giorno non esiste, aggiungi una nuova riga
    addRow(dataEntry, new Date().getDate() === dayOfMonth);
}

// Funzione per eliminare una riga
function deleteRow(row, dataEntry) {
    const index = dataEntries.indexOf(dataEntry);
    if (index > -1) {
        dataEntries.splice(index, 1);
    }
    clearRow(row); // Svuota la riga invece di rimuoverla completamente
    localStorage.setItem("dataEntries", JSON.stringify(dataEntries));
}

// Event listener per il selettore di mese e anno
document.getElementById("load-month").addEventListener("click", () => {
    const selectedMonth = parseInt(document.getElementById("month-selector").value, 10);
    const selectedYear = parseInt(document.getElementById("year-selector").value, 10);
    loadMonthData(selectedMonth, selectedYear);
});

// Caricamento iniziale dei dati del mese corrente
window.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    document.getElementById("month-selector").value = today.getMonth();
    document.getElementById("year-selector").value = today.getFullYear();
    loadMonthData(today.getMonth(), today.getFullYear());
});

// Assegna l'evento per salvare i dati
document.getElementById("data-form").addEventListener("submit", saveData);

// Controllo delle TAB
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        tabButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        tabContents.forEach(content => content.classList.remove("active"));
        document.getElementById(button.dataset.tab).classList.add("active");
    });
});
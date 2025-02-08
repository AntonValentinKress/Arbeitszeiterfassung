document.addEventListener('DOMContentLoaded', function() {
  const workdaysContainer = document.getElementById('workdays-container');
  const addWorkdayBtn = document.getElementById('add-workday');
  const generatePdfBtn = document.getElementById('generate-pdf');

  // Beim Klick auf "Neuen Arbeitstag hinzufügen"
  addWorkdayBtn.addEventListener('click', function() {
    addWorkday();
  });

  // Beim Klick auf "PDF erstellen & Teilen"
  generatePdfBtn.addEventListener('click', function() {
    generatePDF();
  });

  // Funktion: Erstelle ein PDF aus den eingetragenen Daten und teile es
  async function generatePDF() {
    // Hole den Nutzernamen
    const userName = document.getElementById('user-name').value || 'Unbekannt';

    // Erstelle ein PDF mit jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10; // vertikale Position

    // Titel und Nutzername
    doc.setFontSize(16);
    doc.text('Arbeitszeiterfassung', 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Name: ${userName}`, 10, y);
    y += 10;

    // Sammle alle Arbeitstage
    const workdayDivs = document.querySelectorAll('.workday');

    if (workdayDivs.length === 0) {
      doc.text('Keine Daten vorhanden.', 10, y);
    }

    workdayDivs.forEach((workday) => {
      // Hole Datum und Pausenzeit
      const dateVal = workday.querySelector('.workday-date').value || 'Kein Datum';
      const pausenVal = workday.querySelector('.workday-pausen').value || '0';
      const fahrtzeitVal = workday.querySelector('.workday-fahrtzeit').value || '0';

      // Wochentage als Liste
      const weekdayList = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
      const date = new Date(dateVal);
      let weekdayVal = weekdayList[date.getDay()];

      // Datum formatieren
      let day = date.getDate().toString().padStart(2, '0');
      let month = (date.getMonth() + 1).toString().padStart(2, '0');
      let year = date.getFullYear().toString().padStart(2, '0');
      let formattedDate = `${day}.${month}.${year}`;

      // Überschrift pro Arbeitstag
      doc.setFontSize(12);
      doc.text(`${weekdayVal} (${formattedDate}): Pausen: ${pausenVal} Min | Fahrtzeit: ${fahrtzeitVal} Min` , 10, y);
      y += 6;

      // Sammle alle Baustellen dieses Arbeitstages
      const baustellen = workday.querySelectorAll('.baustelle');
      const tableRows = [];

      baustellen.forEach((baustelle, bIndex) => {
        const baustelleName = baustelle.querySelector('.baustelle-name').value || 'Keine Angabe';
        const arbeitszeit = baustelle.querySelector('.baustelle-arbeitszeit').value || '0';
        tableRows.push([baustelleName, arbeitszeit + ' h']);
      });

      // Wenn keine Baustelle vorhanden ist, einen Hinweis einfügen
      if (tableRows.length === 0) {
        tableRows.push(['Keine Baustelle', '']);
      }

      // Verwende AutoTable für tabellarische Darstellung
      doc.autoTable({
        startY: y,
        head: [['Baustelle', 'Arbeitszeit']],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [39, 174, 96] }
      });
      y = doc.lastAutoTable.finalY + 10; // Abstand für den nächsten Arbeitstag
    });

    // Erstelle einen Blob aus dem PDF
    const pdfBlob = doc.output('blob');

    // Überprüfe, ob die Web Share API unterstützt wird und das Teilen von Dateien möglich ist
    if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], 'arbeitszeiterfassung.pdf', { type: 'application/pdf' })] })) {
      try {
        await navigator.share({
          files: [new File([pdfBlob], 'arbeitszeiterfassung.pdf', { type: 'application/pdf' })],
          title: 'Arbeitszeiterfassung',
          text: 'Hier ist meine Arbeitszeiterfassung als PDF.'
        });
      } catch (error) {
        console.error('Teilen fehlgeschlagen:', error);
      }
    } else {
      // Fallback: PDF wird heruntergeladen
      doc.save('arbeitszeiterfassung.pdf');
    }
  }
});

// Funktion: Neuen Arbeitstag erstellen
function addWorkday() {
  // Container für den Arbeitstag
  const workdayDiv = document.createElement('div');
  workdayDiv.classList.add('workday');

  // Datumseingabe für den Arbeitstag
  const dateLabel = document.createElement('label');
  dateLabel.textContent = 'Datum:';
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.classList.add('workday-date');
  dateLabel.appendChild(dateInput);
  workdayDiv.appendChild(dateLabel);

  // Pauseneingabe pro Arbeitstag
  const pausenLabel = document.createElement('label');
  pausenLabel.textContent = 'Pausen (Min):';
  const pausenInput = document.createElement('input');
  pausenInput.type = 'number';
  pausenInput.placeholder = 'Minuten';
  pausenInput.min = "0";
  pausenInput.classList.add('workday-pausen');
  pausenLabel.appendChild(pausenInput);
  workdayDiv.appendChild(pausenLabel);

  // Fahrtzeit pro Arbeitstag
  const fahrtzeitLabel = document.createElement('label');
  fahrtzeitLabel.textContent = 'Fahrtzeit (Min):';
  const fahrtzeitInput = document.createElement('input');
  fahrtzeitInput.type = 'number';
  fahrtzeitInput.placeholder = 'Minuten';
  fahrtzeitInput.min = "0";
  fahrtzeitInput.classList.add('workday-fahrtzeit');
  fahrtzeitLabel.appendChild(fahrtzeitInput)
  workdayDiv.appendChild(fahrtzeitLabel);

  // Löschen-Button für den Arbeitstag
  const deleteWorkdayBtn = document.createElement('button');
  deleteWorkdayBtn.textContent = 'Arbeitstag löschen';
  deleteWorkdayBtn.classList.add('delete-btn');
  deleteWorkdayBtn.addEventListener('click', function() {
    workdayDiv.remove();
  });
  workdayDiv.appendChild(deleteWorkdayBtn);

  // Button, um für diesen Tag eine neue Baustelle anzulegen
  const addBaustelleBtn = document.createElement('button');
  addBaustelleBtn.textContent = 'Baustelle hinzufügen';
  addBaustelleBtn.classList.add('action-btn-grey', 'add-baustelle-btn');
  workdayDiv.appendChild(addBaustelleBtn);

  // Container für die Baustellen dieses Arbeitstags
  const baustellenContainer = document.createElement('div');
  baustellenContainer.classList.add('baustellen-container');
  workdayDiv.appendChild(baustellenContainer);

  // Event: Beim Klick auf den Button wird eine neue Baustelle hinzugefügt
  addBaustelleBtn.addEventListener('click', function() {
    addBaustelle(baustellenContainer);
  });

  // Füge den neuen Arbeitstag dem Hauptcontainer hinzu
  workdaysContainer.appendChild(workdayDiv);
}

// Funktion: Neue Baustelle in den übergebenen Container hinzufügen
function addBaustelle(container) {
  const baustelleDiv = document.createElement('div');
  baustelleDiv.classList.add('baustelle');

  // Eingabefeld für den Baustellennamen
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Baustelle:';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Name der Baustelle';
  nameInput.classList.add('baustelle-name');
  nameLabel.appendChild(nameInput);
  baustelleDiv.appendChild(nameLabel);

  // Eingabefeld für die Arbeitszeit
  const arbeitszeitLabel = document.createElement('label');
  arbeitszeitLabel.textContent = 'Arbeitszeit (h):';
  const arbeitszeitInput = document.createElement('input');
  arbeitszeitInput.type = 'number';
  arbeitszeitInput.placeholder = 'Stunden';
  arbeitszeitInput.min = "0";
  arbeitszeitInput.step = "0.1";
  arbeitszeitInput.classList.add('baustelle-arbeitszeit');
  arbeitszeitLabel.appendChild(arbeitszeitInput);
  baustelleDiv.appendChild(arbeitszeitLabel);

  // Löschen-Button für die Baustelle
  const deleteBaustelleBtn = document.createElement('button');
  deleteBaustelleBtn.textContent = 'Baustelle löschen';
  deleteBaustelleBtn.classList.add('delete-btn');
  deleteBaustelleBtn.addEventListener('click', function() {
    baustelleDiv.remove();
  });
  baustelleDiv.appendChild(deleteBaustelleBtn);

  // Füge den Baustellen-Eintrag in den Container ein
  container.appendChild(baustelleDiv);
}

// Funktion, um den aktuellen Zustand zu speichern
function saveState() {
  const workdays = [];
  const workdayDivs = document.querySelectorAll('.workday');
  
  workdayDivs.forEach(workday => {
    const date = workday.querySelector('.workday-date').value;
    const pausen = workday.querySelector('.workday-pausen').value;
    const fahrtzeit = workday.querySelector('.workday-fahrtzeit').value;
    
    // Erfasse alle Baustellen des aktuellen Arbeitstages
    const baustellen = [];
    workday.querySelectorAll('.baustelle').forEach(baustelle => {
      const name = baustelle.querySelector('.baustelle-name').value;
      const arbeitszeit = baustelle.querySelector('.baustelle-arbeitszeit').value;
      baustellen.push({ name, arbeitszeit });
    });
    
    workdays.push({ date, pausen, fahrtzeit, baustellen });
  });
  
  // Den Namen zusätzlich speichern
  const userName = document.getElementById('user-name').value;
  const state = { userName, workdays };
  
  localStorage.setItem('arbeitszeitState', JSON.stringify(state));
  alert('Daten gespeichert.');
}

// Funktion, um den Zustand wiederherzustellen
// Funktion, um den Zustand wiederherzustellen
function loadState() {
  // Hole den Container für Arbeitstage
  const workdaysContainer = document.getElementById('workdays-container');
  
  const stateJSON = localStorage.getItem('arbeitszeitState');
  if (!stateJSON) return;
  
  const state = JSON.parse(stateJSON);
  
  // Setze den Nutzernamen
  document.getElementById('user-name').value = state.userName || '';
  
  // Leere zuerst den Container für Arbeitstage
  workdaysContainer.innerHTML = '';
  
  // Erstelle Arbeitstage neu
  state.workdays.forEach(day => {
    const workdayDiv = document.createElement('div');
    workdayDiv.classList.add('workday');
    
    // Datumseingabe
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Datum:';
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.classList.add('workday-date');
    dateInput.value = day.date;
    dateLabel.appendChild(dateInput);
    workdayDiv.appendChild(dateLabel);
    
    // Pauseneingabe
    const pausenLabel = document.createElement('label');
    pausenLabel.textContent = 'Pausen (Min):';
    const pausenInput = document.createElement('input');
    pausenInput.type = 'number';
    pausenInput.placeholder = 'Minuten';
    pausenInput.min = "0";
    pausenInput.classList.add('workday-pausen');
    pausenInput.value = day.pausen;
    pausenLabel.appendChild(pausenInput);
    workdayDiv.appendChild(pausenLabel);

    // Fahrtzeiteingabe
    const fahrtzeitLabel = document.createElement('label');
    fahrtzeitLabel.textContent = 'Fahrtzeit (Min):';
    const fahrtzeitInput = document.createElement('input');
    fahrtzeitInput.type = 'number';
    fahrtzeitInput.placeholder = 'Minuten';
    fahrtzeitInput.min = '0';
    fahrtzeitInput.classList.add('workday-fahrtzeit');
    fahrtzeitInput.value = day.fahrtzeit;
    fahrtzeitLabel.appendChild(fahrtzeitInput);
    workdayDiv.appendChild(fahrtzeitLabel);
    
    // Löschen-Button für den Arbeitstag
    const deleteWorkdayBtn = document.createElement('button');
    deleteWorkdayBtn.textContent = 'Arbeitstag löschen';
    deleteWorkdayBtn.classList.add('delete-btn');
    deleteWorkdayBtn.addEventListener('click', function() {
      workdayDiv.remove();
    });
    workdayDiv.appendChild(deleteWorkdayBtn);
    
    // Button zum Hinzufügen einer Baustelle
    const addBaustelleBtn = document.createElement('button');
    addBaustelleBtn.textContent = 'Baustelle hinzufügen';
    addBaustelleBtn.classList.add('action-btn-grey', 'add-baustelle-btn');
    workdayDiv.appendChild(addBaustelleBtn);
    
    // Container für Baustellen
    const baustellenContainer = document.createElement('div');
    baustellenContainer.classList.add('baustellen-container');
    workdayDiv.appendChild(baustellenContainer);
    
    // Event, um weitere Baustellen hinzuzufügen
    addBaustelleBtn.addEventListener('click', function() {
      addBaustelle(baustellenContainer);
    });
    
    // Erstelle vorhandene Baustellen
    day.baustellen.forEach(bs => {
      const baustelleDiv = document.createElement('div');
      baustelleDiv.classList.add('baustelle');
      
      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Baustelle:';
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = 'Name der Baustelle';
      nameInput.classList.add('baustelle-name');
      nameInput.value = bs.name;
      nameLabel.appendChild(nameInput);
      baustelleDiv.appendChild(nameLabel);
      
      const arbeitszeitLabel = document.createElement('label');
      arbeitszeitLabel.textContent = 'Arbeitszeit (h):';
      const arbeitszeitInput = document.createElement('input');
      arbeitszeitInput.type = 'number';
      arbeitszeitInput.placeholder = 'Stunden';
      arbeitszeitInput.min = "0";
      arbeitszeitInput.step = "0.1";
      arbeitszeitInput.classList.add('baustelle-arbeitszeit');
      arbeitszeitInput.value = bs.arbeitszeit;
      arbeitszeitLabel.appendChild(arbeitszeitInput);
      baustelleDiv.appendChild(arbeitszeitLabel);
      
      // Löschen-Button für die Baustelle
      const deleteBaustelleBtn = document.createElement('button');
      deleteBaustelleBtn.textContent = 'Baustelle löschen';
      deleteBaustelleBtn.classList.add('delete-btn');
      deleteBaustelleBtn.addEventListener('click', function() {
        baustelleDiv.remove();
      });
      baustelleDiv.appendChild(deleteBaustelleBtn);
      
      baustellenContainer.appendChild(baustelleDiv);
    });
    
    workdaysContainer.appendChild(workdayDiv);
  });
}


// Funktion, um den gespeicherten Zustand zu löschen
function clearState() {
  if (confirm("Möchtest du die Daten wirklich löschen?")) {
    localStorage.removeItem('arbeitszeitState');
    alert('Gespeicherte Daten wurden gelöscht.');
  } else {
      // User clicked "No" (Cancel)
      console.log("Daten wurden nicht gelöscht!");
  }
}

// Buttons zum Speichern und Löschen des Zustands hinzufügen
const saveStateBtn = document.createElement('button');
saveStateBtn.textContent = 'Daten speichern';
saveStateBtn.classList.add('action-btn');
saveStateBtn.addEventListener('click', saveState);
document.querySelector('saveload').appendChild(saveStateBtn);

const clearStateBtn = document.createElement('button');
clearStateBtn.textContent = 'Daten löschen';
clearStateBtn.classList.add('action-btn-red');
clearStateBtn.addEventListener('click', clearState);
document.querySelector('saveload').appendChild(clearStateBtn);

// Lade den Zustand beim Seitenstart
loadState();

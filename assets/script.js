document.addEventListener('DOMContentLoaded', function() {
  const workdaysContainer = document.getElementById('workdays-container');
  const addWorkdayBtn = document.getElementById('add-workday');
  const generatePdfBtn = document.getElementById('generate-pdf');

  // Beim Klick auf "Neuen Arbeitstag hinzufügen" (neu erstellte Tage sind standardmäßig ausgeklappt)
  addWorkdayBtn.addEventListener('click', function() {
    addWorkday(false); // false → nicht zusammengeklappt (ausgeklappt)
  });

  // Beim Klick auf "PDF erstellen & Teilen"
  generatePdfBtn.addEventListener('click', function() {
    generatePDF();
  });

  // Funktion: Erstelle ein PDF aus den eingetragenen Daten und teile es
  async function generatePDF() {
    const userName = document.getElementById('user-name').value || 'Unbekannt';
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;

    // Titel und Nutzername
    doc.setFontSize(16);
    doc.text('Arbeitszeiterfassung', 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Name: ${userName}`, 10, y);
    y += 10;

    // Alle Arbeitstage durchgehen
    const workdayDivs = document.querySelectorAll('.workday');

    if (workdayDivs.length === 0) {
      doc.text('Keine Daten vorhanden.', 10, y);
    }

    workdayDivs.forEach((workday) => {
      // Hole Datum und Pausen-/Fahrtzeiten aus dem Inhalt (workday-content)
      const dateVal = workday.querySelector('.workday-date').value || 'Kein Datum';
      const pausenVal = workday.querySelector('.workday-pausen').value || '0';
      const fahrtzeitVal = workday.querySelector('.workday-fahrtzeit').value || '0';

      let formattedDateVal = formatDate(dateVal);
      let weekdayDateVal = weekdayDate(dateVal);

      // Überschrift pro Arbeitstag
      doc.setFontSize(12);
      doc.text(`${weekdayDateVal} (${formattedDateVal}): Pausen: ${pausenVal} Min | Fahrtzeit: ${fahrtzeitVal} Min`, 10, y);
      y += 6;

      // Alle Baustellen dieses Tages
      const baustellen = workday.querySelectorAll('.baustelle');
      const tableRows = [];
      baustellen.forEach((baustelle) => {
        const baustelleName = baustelle.querySelector('.baustelle-name').value || 'Keine Angabe';
        const arbeitszeit = baustelle.querySelector('.baustelle-arbeitszeit').value || '0';
        tableRows.push([baustelleName, arbeitszeit + ' h']);
      });
      if (tableRows.length === 0) {
        tableRows.push(['Keine Baustelle', '']);
      }
      doc.autoTable({
        startY: y,
        head: [['Baustelle', 'Arbeitszeit']],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [39, 174, 96] }
      });
      y = doc.lastAutoTable.finalY + 10;
    });

    // PDF-Blob erstellen
    const pdfBlob = doc.output('blob');

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
      doc.save('arbeitszeiterfassung.pdf');
    }
  }
});

// Funktion: Neuen Arbeitstag erstellen
// Parameter "collapsed" gibt an, ob der Tag initial zusammengeklappt sein soll.
function addWorkday(collapsed = false) {
  const workdaysContainer = document.getElementById('workdays-container');

  const workdayDiv = document.createElement('div');
  workdayDiv.classList.add('workday');

  // Erstelle den Header, der den Toggle-Button und die Datum-Anzeige enthält
  const headerDiv = document.createElement('div');
  headerDiv.classList.add('workday-header');

  const toggleBtn = document.createElement('button');
  toggleBtn.classList.add('toggle-btn');
  // Bei neuen Arbeitstagen (collapsed = false) ist der Inhalt sichtbar → "▼"
  toggleBtn.textContent = collapsed ? '►' : '▼';
  headerDiv.appendChild(toggleBtn);

  const headerDateSpan = document.createElement('span');
  headerDateSpan.classList.add('header-date');
  headerDateSpan.textContent = 'Neuer Arbeitstag';
  headerDiv.appendChild(headerDateSpan);

  workdayDiv.appendChild(headerDiv);

  // Erstelle den Content-Bereich (alle Eingabefelder etc.)
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('workday-content');

  // Datumseingabe
  const dateLabel = document.createElement('label');
  dateLabel.textContent = 'Datum:';
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.classList.add('workday-date');
  dateLabel.appendChild(dateInput);
  contentDiv.appendChild(dateLabel);

  // Aktualisiere die Headeranzeige, wenn sich der Datumseintrag ändert
  dateInput.addEventListener('change', function() {
    headerDateSpan.textContent = formatDate(dateInput.value) || 'Neuer Arbeitstag';
  });

  // Pauseneingabe
  const pausenLabel = document.createElement('label');
  pausenLabel.textContent = 'Pausen (Min):';
  const pausenInput = document.createElement('input');
  pausenInput.type = 'number';
  pausenInput.placeholder = 'Minuten';
  pausenInput.min = "0";
  pausenInput.classList.add('workday-pausen');
  pausenLabel.appendChild(pausenInput);
  contentDiv.appendChild(pausenLabel);

  // Fahrtzeiteingabe
  const fahrtzeitLabel = document.createElement('label');
  fahrtzeitLabel.textContent = 'Fahrtzeit (Min):';
  const fahrtzeitInput = document.createElement('input');
  fahrtzeitInput.type = 'number';
  fahrtzeitInput.placeholder = 'Minuten';
  fahrtzeitInput.min = "0";
  fahrtzeitInput.classList.add('workday-fahrtzeit');
  fahrtzeitLabel.appendChild(fahrtzeitInput);
  contentDiv.appendChild(fahrtzeitLabel);

  // Löschen-Button für den Arbeitstag
  const deleteWorkdayBtn = document.createElement('button');
  deleteWorkdayBtn.textContent = 'Arbeitstag löschen';
  deleteWorkdayBtn.classList.add('delete-btn');
  deleteWorkdayBtn.addEventListener('click', function() {
    workdayDiv.remove();
  });
  contentDiv.appendChild(deleteWorkdayBtn);

  // Button zum Hinzufügen einer Baustelle
  const addBaustelleBtn = document.createElement('button');
  addBaustelleBtn.textContent = 'Baustelle hinzufügen';
  addBaustelleBtn.classList.add('action-btn-grey', 'add-baustelle-btn');
  contentDiv.appendChild(addBaustelleBtn);

  // Container für Baustellen
  const baustellenContainer = document.createElement('div');
  baustellenContainer.classList.add('baustellen-container');
  contentDiv.appendChild(baustellenContainer);

  addBaustelleBtn.addEventListener('click', function() {
    addBaustelle(baustellenContainer);
  });

  workdayDiv.appendChild(contentDiv);

  // Setze den anfänglichen Status (ausgeklappt oder zusammengeklappt)
  contentDiv.style.display = collapsed ? 'none' : '';
  
  // Toggle-Funktionalität: Beim Klick auf den Toggle-Button wird der Content ein- bzw. ausgeblendet.
  toggleBtn.addEventListener('click', function() {
    if(contentDiv.style.display === 'none'){
      contentDiv.style.display = '';
      toggleBtn.textContent = '▼';
    } else {
      contentDiv.style.display = 'none';
      toggleBtn.textContent = '►';
    }
  });

  workdaysContainer.appendChild(workdayDiv);
}

// Funktion: Neue Baustelle in den übergebenen Container hinzufügen
function addBaustelle(container) {
  const baustelleDiv = document.createElement('div');
  baustelleDiv.classList.add('baustelle');

  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Baustelle:';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Name der Baustelle';
  nameInput.classList.add('baustelle-name');
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
  arbeitszeitLabel.appendChild(arbeitszeitInput);
  baustelleDiv.appendChild(arbeitszeitLabel);

  const deleteBaustelleBtn = document.createElement('button');
  deleteBaustelleBtn.textContent = 'Baustelle löschen';
  deleteBaustelleBtn.classList.add('delete-btn');
  deleteBaustelleBtn.addEventListener('click', function() {
    baustelleDiv.remove();
  });
  baustelleDiv.appendChild(deleteBaustelleBtn);

  container.appendChild(baustelleDiv);
}

// Funktion, um den aktuellen Zustand zu speichern
// Funktion, um den aktuellen Zustand zu speichern
function saveState() {
  const workdays = [];
  const workdayDivs = document.querySelectorAll('.workday');
  
  workdayDivs.forEach(workday => {
    const date = workday.querySelector('.workday-date').value;
    const pausen = workday.querySelector('.workday-pausen').value;
    const fahrtzeit = workday.querySelector('.workday-fahrtzeit').value;
    
    const baustellen = [];
    workday.querySelectorAll('.baustelle').forEach(baustelle => {
      const name = baustelle.querySelector('.baustelle-name').value;
      const arbeitszeit = baustelle.querySelector('.baustelle-arbeitszeit').value;
      baustellen.push({ name, arbeitszeit });
    });
    
    workdays.push({ date, pausen, fahrtzeit, baustellen });
  });
  
  const userName = document.getElementById('user-name').value;
  const state = { userName, workdays };
  
  localStorage.setItem('arbeitszeitState', JSON.stringify(state));
  
  // Statt eines Alerts: Zeige eine kurze Animation (weißer Haken in grünem Kreis)
  showSaveNotification();
}

// Hilfsfunktion zur Anzeige der Bestätigung
function showSaveNotification() {
  // Erstelle das Notification-Element
  const notification = document.createElement('div');
  notification.classList.add('save-notification');
  // Verwende das Unicode-Zeichen für einen Haken (✓)
  notification.innerHTML = '&#10004;';
  
  // Füge das Element zum Body hinzu
  document.body.appendChild(notification);
  
  // Nutze requestAnimationFrame, um sicherzustellen, dass die CSS-Transition greift
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });
  
  // Nach 1 Sekunde die Animation umkehren und das Element entfernen
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300); // Wartezeit, bis die Transition abgeschlossen ist
  }, 1000);
}


// Funktion, um den Zustand wiederherzustellen (geladene Tage sind standardmäßig zusammengeklappt)
function loadState() {
  const workdaysContainer = document.getElementById('workdays-container');
  const stateJSON = localStorage.getItem('arbeitszeitState');
  if (!stateJSON) return;
  
  const state = JSON.parse(stateJSON);
  document.getElementById('user-name').value = state.userName || '';
  workdaysContainer.innerHTML = '';
  
  state.workdays.forEach(day => {
    const workdayDiv = document.createElement('div');
    workdayDiv.classList.add('workday');

    // Header mit Toggle-Button und Datum
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('workday-header');

    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add('toggle-btn');
    // Geladene Arbeitstage sollen zusammengeklappt sein → "►"
    toggleBtn.textContent = '►';
    headerDiv.appendChild(toggleBtn);

    const headerDateSpan = document.createElement('span');
    headerDateSpan.classList.add('header-date');
    headerDateSpan.textContent = formatDate(day.date) || 'Arbeitstag';
    headerDiv.appendChild(headerDateSpan);
    workdayDiv.appendChild(headerDiv);

    // Content-Bereich erstellen
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('workday-content');

    // Datumseingabe
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Datum:';
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.classList.add('workday-date');
    dateInput.value = day.date;
    dateLabel.appendChild(dateInput);
    contentDiv.appendChild(dateLabel);

    dateInput.addEventListener('change', function() {
      headerDateSpan.textContent = formatDate(dateInput.value) || 'Arbeitstag';
    });

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
    contentDiv.appendChild(pausenLabel);

    // Fahrtzeiteingabe
    const fahrtzeitLabel = document.createElement('label');
    fahrtzeitLabel.textContent = 'Fahrtzeit (Min):';
    const fahrtzeitInput = document.createElement('input');
    fahrtzeitInput.type = 'number';
    fahrtzeitInput.placeholder = 'Minuten';
    fahrtzeitInput.min = "0";
    fahrtzeitInput.classList.add('workday-fahrtzeit');
    fahrtzeitInput.value = day.fahrtzeit;
    fahrtzeitLabel.appendChild(fahrtzeitInput);
    contentDiv.appendChild(fahrtzeitLabel);

    // Löschen-Button für den Arbeitstag
    const deleteWorkdayBtn = document.createElement('button');
    deleteWorkdayBtn.textContent = 'Arbeitstag löschen';
    deleteWorkdayBtn.classList.add('delete-btn');
    deleteWorkdayBtn.addEventListener('click', function() {
      workdayDiv.remove();
    });
    contentDiv.appendChild(deleteWorkdayBtn);

    // Baustelle hinzufügen Button
    const addBaustelleBtn = document.createElement('button');
    addBaustelleBtn.textContent = 'Baustelle hinzufügen';
    addBaustelleBtn.classList.add('action-btn-grey', 'add-baustelle-btn');
    contentDiv.appendChild(addBaustelleBtn);

    // Baustellen-Container
    const baustellenContainer = document.createElement('div');
    baustellenContainer.classList.add('baustellen-container');
    contentDiv.appendChild(baustellenContainer);

    addBaustelleBtn.addEventListener('click', function() {
      addBaustelle(baustellenContainer);
    });

    // Bestehende Baustellen hinzufügen
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

      const deleteBaustelleBtn = document.createElement('button');
      deleteBaustelleBtn.textContent = 'Baustelle löschen';
      deleteBaustelleBtn.classList.add('delete-btn');
      deleteBaustelleBtn.addEventListener('click', function() {
        baustelleDiv.remove();
      });
      baustelleDiv.appendChild(deleteBaustelleBtn);

      baustellenContainer.appendChild(baustelleDiv);
    });

    workdayDiv.appendChild(contentDiv);
    // Geladene Arbeitstage standardmäßig zusammengeklappt
    contentDiv.style.display = 'none';

    toggleBtn.addEventListener('click', function() {
      if(contentDiv.style.display === 'none'){
        contentDiv.style.display = '';
        toggleBtn.textContent = '▼';
      } else {
        contentDiv.style.display = 'none';
        toggleBtn.textContent = '►';
      }
    });

    workdaysContainer.appendChild(workdayDiv);
  });
}

// Funktion, um den gespeicherten Zustand zu löschen
function clearState() {
  if (confirm("Möchtest du die Daten wirklich löschen?")) {
    localStorage.removeItem('arbeitszeitState');
    showClearNotification();
  } else {
    console.log("Daten wurden nicht gelöscht!");
  }
}

function formatDate(date) {
  // Datum formatieren
  const datum = new Date(date);

  let day = datum.getDate().toString().padStart(2, '0');
  let month = (datum.getMonth() + 1).toString().padStart(2, '0');
  let year = datum.getFullYear().toString().padStart(2, '0');

  let formattedDate = `${day}.${month}.${year}`;

  return formattedDate
}

function weekdayDate(date) {
  const weekdayList = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
  const datum = new Date(date);

  let weekdayVal = weekdayList[datum.getDay()];

  return weekdayVal
}

// Hilfsfunktion zur Anzeige der Löschbestätigung
function showClearNotification() {
  // Erstelle das Notification-Element
  const notification = document.createElement('div');
  notification.classList.add('clear-notification');
  // Unicode-Zeichen für ein Kreuz (✖)
  notification.innerHTML = '&#10006;';
  
  // Füge das Element zum Body hinzu
  document.body.appendChild(notification);
  
  // Stelle sicher, dass die CSS-Transition greift
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });
  
  // Nach 1 Sekunde wieder ausblenden und entfernen
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300); // Übergangszeit
  }, 1000);
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

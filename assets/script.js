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
    addBaustelleBtn.classList.add('action-btn', 'add-baustelle-btn');
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

    workdayDivs.forEach((workday, dayIndex) => {
      // Hole Datum und Pausenzeit
      const dateVal = workday.querySelector('.workday-date').value || 'Kein Datum';
      const pausenVal = workday.querySelector('.workday-pausen').value || '0';

      // Überschrift pro Arbeitstag
      doc.setFontSize(12);
      doc.text(`Arbeitstag ${dayIndex + 1}: Datum: ${dateVal} | Pausen: ${pausenVal} Min`, 10, y);
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

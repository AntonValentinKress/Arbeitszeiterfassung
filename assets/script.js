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
  
      // Eingabefeld für die Pausenzeit
      const pausenLabel = document.createElement('label');
      pausenLabel.textContent = 'Pausen (Min):';
      const pausenInput = document.createElement('input');
      pausenInput.type = 'number';
      pausenInput.placeholder = 'Minuten';
      pausenInput.min = "0";
      pausenInput.classList.add('baustelle-pausen');
      pausenLabel.appendChild(pausenInput);
      baustelleDiv.appendChild(pausenLabel);
  
      // Füge den Baustellen-Eintrag in den Container ein
      container.appendChild(baustelleDiv);
    }
  
    // Funktion: Erstelle ein PDF aus den eingetragenen Daten und teile es
    async function generatePDF() {
      // Sammle alle Arbeitstage
      const workdayDivs = document.querySelectorAll('.workday');
      let content = '';
  
      workdayDivs.forEach((workday, dayIndex) => {
        const dateInput = workday.querySelector('.workday-date');
        let dateVal = dateInput.value || 'Kein Datum angegeben';
        content += `Arbeitstag ${dayIndex + 1}: ${dateVal}\n`;
  
        // Sammle die Baustellen für den jeweiligen Tag
        const baustellen = workday.querySelectorAll('.baustelle');
        baustellen.forEach((baustelle, bIndex) => {
          const name = baustelle.querySelector('.baustelle-name').value || 'Keine Baustelle';
          const arbeitszeit = baustelle.querySelector('.baustelle-arbeitszeit').value || '0';
          const pausen = baustelle.querySelector('.baustelle-pausen').value || '0';
          content += `  Baustelle ${bIndex + 1}: ${name}\n`;
          content += `    Arbeitszeit: ${arbeitszeit} h\n`;
          content += `    Pausen: ${pausen} Min\n`;
        });
        content += `\n`;
      });
  
      // Erstelle ein PDF mit jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
  
      const lines = doc.splitTextToSize(content, 180);
      doc.text(lines, 10, 10);
  
      // Erstelle einen Blob aus dem PDF
      const pdfBlob = doc.output('blob');
  
      // Überprüfe, ob die Web Share API unterstützt wird und das Teilen von Dateien möglich ist
      if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], 'arbeitszeiterfassung.pdf', { type: 'application/pdf' })] })) {
        try {
          await navigator.share({
            files: [new File([pdfBlob], 'arbeitszeiterfassung.pdf', { type: 'application/pdf' })],
            title: 'Arbeitszeiterfassung',
            text: 'Hier ist meine Arbeitszeiterfassung als PDF.',
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
  
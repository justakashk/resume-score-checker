<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.min.js"></script>
<script>
  function showLoader() {
    document.getElementById("resume-checker-loading").style.display = "block";
  }

  function hideLoader() {
    document.getElementById("resume-checker-loading").style.display = "none";
  }

  function handleFileUpload() {
    const fileInput = document.getElementById("resume-checker-file-input");
    const file = fileInput.files[0];

    if (!file) {
      alert("Please upload a resume file.");
      return;
    }

    showLoader();

    const fileType = file.type;

    if (fileType === "application/pdf") {
      const reader = new FileReader();
      reader.onload = function () {
        const typedarray = new Uint8Array(reader.result);
        pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
          let allText = "";
          let loadPagePromises = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            loadPagePromises.push(
              pdf.getPage(i).then(function (page) {
                return page.getTextContent().then(function (textContent) {
                  const pageText = textContent.items.map(item => item.str).join(" ");
                  allText += pageText + " ";
                });
              })
            );
          }

          Promise.all(loadPagePromises).then(() => {
            setTimeout(() => {
              checkResumeScore(allText.toLowerCase());
              hideLoader();
            }, 10000);
          });
        });
      };
      reader.readAsArrayBuffer(file);

    } else if (fileType === "text/plain") {
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result.toLowerCase();
        setTimeout(() => {
          checkResumeScore(text);
          hideLoader();
        }, 10000);
      };
      reader.readAsText(file);
    } else {
      alert("Unsupported file type. Please upload a .txt or .pdf file.");
      hideLoader();
    }
  }

  function checkResumeScore(text) {
    let score = 0;
    let feedback = [];
    let missing = [];

    const criteria = [
      { keyword: "email", points: 10, message: "Includes contact info" },
      { keyword: "experience", points: 15, message: "Includes work experience" },
      { keyword: "skills", points: 15, message: "Includes skills section" },
      { keyword: "summary", points: 10, message: "Includes summary/about section" },
      { keyword: "project", points: 10, message: "Includes projects" },
      { keyword: "education", points: 10, message: "Includes education section" },
      { keyword: "-", points: 10, message: "Uses bullet points" },
    ];

    criteria.forEach(c => {
      if (text.includes(c.keyword)) {
        score += c.points;
        feedback.push(`<li class='positive-feedback'>${c.message}</li>`);
      } else {
        missing.push(`<li class='negative-feedback'>Missing: ${c.message}</li>`);
      }
    });

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount >= 200 && wordCount <= 600) {
      score += 10;
      feedback.push("<li class='positive-feedback'>Proper resume length</li>");
    } else {
      missing.push("<li class='negative-feedback'>Resume might be too short or too long</li>");
    }

    const fullFeedback = feedback.concat(missing);

    document.getElementById("resume-checker-result").innerHTML = 
      `<p>Your Resume Score: <strong>${score}/100</strong></p>
       <ul>${fullFeedback.join('')}</ul>`;
  }
</script>

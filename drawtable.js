function calculateFontSize(cellContent, cellSize, baseFontSize) {
    // Adjust the font size based on the length of the cell content
    const maxContentLength = 16; // Maximum number of characters before scaling down
    const contentLength = cellContent.length;
    if (contentLength <= maxContentLength) {
        return baseFontSize;
    }
    const scaleFactor = Math.sqrt(contentLength * 1.2 / maxContentLength);
    return Math.max(baseFontSize / scaleFactor, 10); // Ensure font size doesn't go below 10px
}

function generateTableHTML(tableSize) {
    // Get the dimensions of the viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate the cell size
    const maxDimension = Math.min(viewportWidth, viewportHeight);
    const cellSize = Math.floor(0.7 * maxDimension / tableSize);

    // Calculate table dimensions
    const tableWidth = cellSize * tableSize;
    const tableHeight = cellSize * tableSize;
    const baseFontSize = cellSize / 5; // Base font size in pixels

    // Get the table title
    const separateTableTitle = document.getElementById("tableTitle").value.split('\n');
    const tableTitleRowCount = separateTableTitle.length;
    const tableTitle = separateTableTitle.map(part => `<p>${part}</p>`).join("");

    let tableHTML = `
        <style>
            .output-table {
                border-collapse: collapse;
                width: ${tableWidth}px;
                height: ${tableHeight}px;
                margin-top: 10px;
            }
            .output-table td {
                border: 1px solid black;
                width: ${cellSize}px;
                height: ${cellSize}px;
                overflow: hidden;
                text-align: center;
                vertical-align: middle;
                word-break: break-word; /* Allow text to wrap */
                white-space: pre-wrap; /* Preserve whitespace and wrap text */
                box-sizing: border-box;
            }
            .output-table td div {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                box-sizing: border-box;
                text-align: center;
            }
            .table-title {
                font-size: ${Math.max(cellSize/3/(tableTitleRowCount**0.33),cellSize/15)}px;
                font-weight: bold;
                margin-bottom: 10px;
                text-align: center;
            }
            .table-title p {
                line-height:${Math.max(cellSize/4/(tableTitleRowCount**0.5),3)}px;
            }

        </style>
    `;

    // Add the table title
    tableHTML += `<div class="table-title">${tableTitle}</div>`;

    tableHTML += "<table class='output-table'>";
    for (let i = 0; i < tableSize; i++) {
        tableHTML += "<tr>";
        for (let j = 0; j < tableSize; j++) {
            let cellValue = document.getElementById(`cell-${i}-${j}`).value;
            // Calculate font size based on cell content
            const fontSize = calculateFontSize(cellValue, cellSize, baseFontSize);
            tableHTML += `<td style="font-size: ${fontSize}px;"><div>${cellValue}</div></td>`;
        }
        tableHTML += "</tr>";
    }
    tableHTML += "</table>";

    // Return the table HTML
    return tableHTML;
}



function generateImageFromTable(tableHTML) {

    // Create a visible div to render the table
    let visibleDiv = document.createElement("div");
    visibleDiv.style.position = 'absolute';
    visibleDiv.style.top = '-9999px';
    visibleDiv.innerHTML = tableHTML;
    document.body.appendChild(visibleDiv);

    // Calculate white border size
    const whiteBorderPercent = 0.15; // 15% white border
    const whiteBorderWidth = visibleDiv.scrollWidth * whiteBorderPercent;
    const whiteBorderHeight = visibleDiv.scrollHeight * whiteBorderPercent;

    // Generate high-resolution image with device DPI
    const dpi = devicePixelRatio > 1 ? devicePixelRatio : 1;
    const width = visibleDiv.offsetWidth;
    const height = visibleDiv.offsetHeight;

    const canvas = document.createElement('canvas');
    canvas.width = dpi * (width + 2 * whiteBorderWidth);
    canvas.height = dpi * (height + 2 * whiteBorderHeight);
    canvas.style.width = (width + 2 * whiteBorderWidth) + 'px';
    canvas.style.height = (height + 2 * whiteBorderHeight) + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpi, dpi);

    html2canvas(visibleDiv, {
        canvas: canvas,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 1
    }).then(canvas => {
        // Create a new canvas with white border
        let borderedCanvas = document.createElement('canvas');
        borderedCanvas.width = canvas.width;
        borderedCanvas.height = canvas.height;
        
        let ctx = borderedCanvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, borderedCanvas.width, borderedCanvas.height);
        ctx.drawImage(canvas, whiteBorderWidth * dpi, whiteBorderHeight * dpi);

        let img = borderedCanvas.toDataURL("image/png", 1.0);
        let resultDiv = document.getElementById("result");

        // Display image with scaling
        let displayImg = new Image();
        displayImg.src = img;
        displayImg.style.width = (borderedCanvas.width / dpi) + 'px'; // scale down by dpi
        displayImg.style.height = (borderedCanvas.height / dpi) + 'px'; // scale down by dpi
        resultDiv.innerHTML = '';
        resultDiv.appendChild(displayImg);

        // Clean up
        document.body.removeChild(visibleDiv);

        // Scroll to the result div
        resultDiv.scrollIntoView({ behavior: 'smooth' });

    }).catch(error => {
        console.error('Error generating image:', error);
    });
    
}

function generateTable() {
    const tableSize = parseInt(document.getElementById("tableSize").value);
    const tableHTML = generateTableHTML(tableSize);
    generateImageFromTable(tableHTML);
}

function generateForm() {
    const tableSize = parseInt(document.getElementById("tableSize").value);
    let formHTML = "<table>";
    for (let i = 0; i < tableSize; i++) {
        formHTML += "<tr>";
        for (let j = 0; j < tableSize; j++) {
            formHTML += `<td><textarea id="cell-${i}-${j}" rows="3" cols="10"></textarea></td>`;
        }
        formHTML += "</tr>";
    }
    formHTML += "</table>";

    document.getElementById("formArea").innerHTML = formHTML;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

function generateRandomTable() {
    const tableSize = parseInt(document.getElementById("tableSize").value);
    const cells = [];
    // Collect all cell values
    for (let i = 0; i < tableSize; i++) {
        for (let j = 0; j < tableSize; j++) {
            const cellId = `cell-${i}-${j}`;
            const cellValue = document.getElementById(cellId).value.trim();
            cells.push(cellValue || ' '); // Replace empty values with a space
        }
    }

        // Generate the table HTML using the shuffled cells
    const tableHTML = generateTableHTML(tableSize, cells);

    shuffleArray(cells); // Shuffle the cell contents

    // Create a visible div offscreen to render the table for image generation
    let visibleDiv = document.createElement("div");
    visibleDiv.style.position = 'absolute';
    visibleDiv.style.left = '-9999px'; // Place it offscreen
    visibleDiv.innerHTML = tableHTML;

    const cellElements = visibleDiv.querySelectorAll('.output-table td div');
    cellElements.forEach((div, index) => {
        div.innerHTML = cells[index]; // Populate the table with shuffled contents
    });

    // Generate image from the offscreen div
    generateImageFromTable(visibleDiv.innerHTML);
    document.body.append(visibleDiv);
    document.body.removeChild(visibleDiv);

}

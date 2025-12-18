document.addEventListener('DOMContentLoaded', () => {
    const depthmapUpload = document.getElementById('depthmap-upload');
    const patternUpload = document.getElementById('pattern-upload');
    const generateBtn = document.getElementById('generate-btn');
    const canvas = document.getElementById('stereogram-canvas');
    const ctx = canvas.getContext('2d');
    const errorMessage = document.getElementById('error-message');

    let depthmapImage = null;
    let patternImage = null;

    depthmapUpload.addEventListener('change', (e) => loadImage(e.target.files[0], (img) => depthmapImage = img));
    patternUpload.addEventListener('change', (e) => loadImage(e.target.files[0], (img) => patternImage = img));
    generateBtn.addEventListener('click', generateStereogram);

    function loadImage(file, callback) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => callback(img);
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    function generateStereogram() {
        if (!depthmapImage) {
            errorMessage.textContent = 'Пожалуйста, загрузите карту глубины.';
            return;
        }
        errorMessage.textContent = '';

        const width = depthmapImage.width;
        const height = depthmapImage.height;
        canvas.width = width;
        canvas.height = height;

        // Get depth map data
        ctx.drawImage(depthmapImage, 0, 0);
        const depthmapData = ctx.getImageData(0, 0, width, height).data;

        // Create pattern data if no pattern is uploaded
        let patternData;
        const patternWidth = patternImage ? patternImage.width : 120;
        const patternHeight = patternImage ? patternImage.height : height;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = patternWidth;
        tempCanvas.height = patternHeight;

        if (patternImage) {
            tempCtx.drawImage(patternImage, 0, 0);
        } else {
            // Generate random dot pattern
            for (let y = 0; y < patternHeight; y++) {
                for (let x = 0; x < patternWidth; x++) {
                    const color = Math.random() > 0.5 ? 255 : 0;
                    tempCtx.fillStyle = `rgb(${color}, ${color}, ${color})`;
                    tempCtx.fillRect(x, y, 1, 1);
                }
            }
        }
        patternData = tempCtx.getImageData(0, 0, patternWidth, patternHeight).data;

        const outputImageData = ctx.createImageData(width, height);
        const outputData = outputImageData.data;

        const MAX_SHIFT = Math.floor(patternWidth / 8);

        for (let y = 0; y < height; y++) {
            const rowColors = []; // Store calculated colors for the current row

            for (let x = 0; x < width; x++) {
                // Get depth value (0-255) from the red channel of the depth map
                const depth = depthmapData[(y * width + x) * 4];

                // Normalize depth and calculate shift
                const shift = Math.floor((depth / 255) * MAX_SHIFT);

                const separation = patternWidth - shift;

                const srcX = x - separation;

                let r, g, b;

                if (srcX >= 0) {
                    // Use the color from the already calculated part of the same row
                    const srcColor = rowColors[srcX];
                    r = srcColor.r;
                    g = srcColor.g;
                    b = srcColor.b;
                } else {
                    // Get a new color from the pattern
                    const patternX = x % patternWidth;
                    const patternY = y % patternHeight;
                    const patternIndex = (patternY * patternWidth + patternX) * 4;
                    r = patternData[patternIndex];
                    g = patternData[patternIndex + 1];
                    b = patternData[patternIndex + 2];
                }

                // Store the color for the current pixel
                rowColors[x] = { r, g, b };

                // Set the output pixel data
                const outputIndex = (y * width + x) * 4;
                outputData[outputIndex] = r;
                outputData[outputIndex + 1] = g;
                outputData[outputIndex + 2] = b;
                outputData[outputIndex + 3] = 255; // Alpha
            }
        }

        ctx.putImageData(outputImageData, 0, 0);
    }
});

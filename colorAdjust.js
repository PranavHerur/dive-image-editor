const imageInput = document.getElementById('imageInput');
const colorAdjustSlider = document.getElementById('colorAdjustSlider');
const canvas = document.getElementById('photoCanvas');
const ctx = canvas.getContext('2d');

let img = new Image();

// Convert RGB to HSV
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h, s, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, v];
}

// Convert HSV to RGB
function hsvToRgb(h, s, v) {
    let r, g, b;

    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            (r = v), (g = t), (b = p);
            break;
        case 1:
            (r = q), (g = v), (b = p);
            break;
        case 2:
            (r = p), (g = v), (b = t);
            break;
        case 3:
            (r = p), (g = q), (b = v);
            break;
        case 4:
            (r = t), (g = p), (b = v);
            break;
        case 5:
            (r = v), (g = p), (b = q);
            break;
    }

    return [r * 255, g * 255, b * 255];
}

// Adjust colors based on slider value
function adjustColors(imageData, sliderValue) {
    const data = imageData.data;
    // Map slider value (0-100) to adjustment range (1.0-1.5)
    const adjustment = 1 + (sliderValue / 100 * 0.5);

    for (let i = 0; i < data.length; i += 4) {
        // Extract RGB values
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Adjust RGB values
        r = Math.min(255, r * adjustment);
        g = Math.min(255, g * adjustment);
        b = Math.min(255, b * adjustment);

        // Convert adjusted RGB to HSV
        let [h, s, v] = rgbToHsv(r, g, b);

        // Adjust only saturation and value
        s = Math.min(1, s * adjustment);
        v = Math.min(1, v * adjustment);

        // Convert adjusted HSV back to RGB
        [r, g, b] = hsvToRgb(h, s, v);

        // Set adjusted values back to image data
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }

    return imageData;
}


// Draw image on canvas
function drawImage() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

// Handle image upload
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Once image loads, draw it
img.onload = drawImage;

// Handle slider adjustment
colorAdjustSlider.addEventListener('input', () => {
    if (img.src) {
        drawImage();
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        imageData = adjustColors(imageData, colorAdjustSlider.value);
        ctx.putImageData(imageData, 0, 0);
    }
});

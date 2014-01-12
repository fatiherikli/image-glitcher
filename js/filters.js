ImageGlitcher.BaseFilter = $.Class.extend({

    identifier: null,
    label: null,

    apply: function (canvas, context) {
        var pixels = this.getPixels(canvas, context),
            processed = this.manipulatePixels(pixels);
        context.putImageData(processed, 0, 0);
    },

    run: function (canvas) {
        var context = canvas.getContext('2d');
        return this.apply(canvas, context)
    },

    getPixels: function (canvas, context) {
        return context.getImageData(0, 0, canvas.width, canvas.height)
    },

    manipulatePixels: function (pixels) {
        // should be overridden
    }
});

ImageGlitcher.GrayscaleFilter = ImageGlitcher.BaseFilter.extend({

    identifier: "grayscale",
    label: "Grayscale",

    manipulatePixels: function (pixels) {
        var data = pixels.data;

        for (var i=0; i<data.length; i+=4) {
            var r = data[i];
            var g = data[i+1];
            var b = data[i+2];

            // CIE luminance for the RGB
            // http://en.wikipedia.org/wiki/Luminance_(relative)

            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            data[i] = data[i+1] = data[i+2] = v
        }

        return pixels;
    }
});
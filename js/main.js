String.prototype.replaceAt = function(index, character) {
  return this.substr(0, index) + character + this.substr(index+character.length);
};

var Base64ImageGlitcher = $.Class.extend({
    glitch: function (imageData, glitchLevel) {
        var indicator = 'base64,',
            parts = imageData.split(indicator),
            data = atob(parts[1]),
            prefix = parts[0] + indicator;
        for (var i=0; i < data.length; i++) {
            var randomNumber = parseInt(Math.random() * (data.length / glitchLevel));
            if (i % randomNumber == 0 && i > (data.length / 20)) {
                data = data.replaceAt(i, data.charAt(i+1));
            }
        }
        return prefix + btoa(data);
    }
});

var BaseFilter = $.Class.extend({

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

var GrayscaleFilter = BaseFilter.extend({

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

var ImageGlitcherApp = $.Class.extend({

    glitchButtonSelector: null,
    workspaceSelector: null,

    acceptedTypes: ["image/jpg", "image/jpeg", "image/png", "image/gif"],
    glitcher: new Base64ImageGlitcher(),
    filters: [
        new GrayscaleFilter(),
    ],

    init: function (options) {
        $.extend(this, options);
    },

    initializeCanvas: function (imageElement) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');
        canvas.width = imageElement.width();
        canvas.height = imageElement.width();
        context.drawImage(imageElement.get(0), 0, 0);
        return canvas;
    },

    preProcess: function (imageData, glitchLevel) {
        return this.glitcher.glitch(imageData, glitchLevel);
    },

    postProcess: function (canvas, filters) {
        filters.forEach(function (filter) {
            filter.run(canvas);
        });
    },

    glitch: function (glitchLevel, filters) {

        var image = $("<img>"),
            workspace = $(this.workspaceSelector);

        // glitch selected image
        var glitchedImageData = this.preProcess(
            this.selectedImageData,
            glitchLevel
        );

        image.attr("src", glitchedImageData);

        // attach the element to calculate with and height
        // of selected image. this is the easiest way.
        workspace.append(image);

        // create a canvas to apply selected filters
        var canvas = this.initializeCanvas(image);

        // apply filters
        this.postProcess(canvas, filters);

        // done!
        workspace.html(canvas);

    },

    render: function () {
        var canvas = $(this.workspaceSelector);

        canvas.on('dragenter', function (event) {
            event.stopPropagation();
            event.preventDefault();
            canvas.addClass('dragged');
        });

        canvas.on('dragover', function (event) {
             event.stopPropagation();
             event.preventDefault();
        });

        canvas.on('drop', function (event) {
            canvas.addClass('dropped');
            event.preventDefault();
            var files = event.originalEvent.dataTransfer.files,
                file = files[0];
            if (this.acceptedTypes.indexOf(file.type) == -1) {
                window.alert("Please drop a valid image.");
            } else {
                this.readDroppedImage(file);
            }
        }.bind(this));

        var optionsDialog = this.renderOptionsDialog();

        $(this.glitchButtonSelector).on('click', function () {

            var glitchLevel = optionsDialog.find("#glitch-level").val(),
                filters = this.getSelectedFilters();
            this.glitch(
                glitchLevel,
                filters
            );

        }.bind(this)).click();

        $(this.optionsButtonSelector).click(function () {
            $(this.optionsDialogSelector).toggle();
        }.bind(this));

    },

    renderOptionsDialog: function () {
        var optionsDialog = $(this.optionsDialogSelector);

        this.filters.forEach(function (filter) {

            var filterLabel = $("<label>").html(filter.label);

            $("<input type='checkbox'>")
                .val(filter.identifier)
                .prependTo(filterLabel);

            optionsDialog
                .find("#filters")
                .append(filterLabel);

        });

        return optionsDialog;
    },

    getSelectedFilters: function () {
        var filters = $(this.optionsDialogSelector)
            .find("#filters input:checked");

        return _.map(filters, function (filterLabel) {
            for (var filterIndex in this.filters) {
                var filter = this.filters[filterIndex];
                if (filter.identifier == $(filterLabel).val()) {
                    return filter;
                }
            }
        }.bind(this));
    },

    readDroppedImage: function (file) {

        var canvas = $(this.workspaceSelector),
            reader = new FileReader();

        reader.onloadend = function () {
            this.selectedImageData = reader.result;

            var previewImage = $("<img>", {
                src: this.selectedImageData
            });

            canvas.html(previewImage);

        }.bind(this);

        reader.readAsDataURL(file);
    }

});

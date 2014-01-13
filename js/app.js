window.ImageGlitcher = window.ImageGlitcher || {};

ImageGlitcher.Application = $.Class.extend({

    glitchButtonSelector: null,
    workspaceSelector: null,

    acceptedTypes: ["image/jpg", "image/jpeg", "image/png", "image/gif"],
    glitcher: null,
    filters: [],

    init: function (options) {
        $.extend(this, options);
    },

    initializeCanvas: function (imageElement) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');
        canvas.width = imageElement.width();
        canvas.height = imageElement.height();
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
            if (!this.selectedImageData) {
                window.alert('Please select a file');
            } else {
                var glitchLevel = optionsDialog.find("#glitch-level").val(),
                    filters = this.getSelectedFilters();
                this.glitch(glitchLevel, filters);
            }
        }.bind(this));

        $(this.optionsButtonSelector).click(function () {
            $(this.optionsDialogSelector).toggle();
        }.bind(this));

    },

    renderOptionsDialog: function () {
        var optionsDialog = $(this.optionsDialogSelector);

        this.filters.forEach(function (filter) {

            var filterLabel = $("<label>").html(filter.label),
                filterInput = $("<input type='checkbox'>")
                    .val(filter.identifier)
                    .prependTo(filterLabel);

            if (filter.isSelected) {
                filterInput.attr("checked", "checked")
            }

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

            $(this.previewBackgroundSelector)
                .css("background-image", "url(" + this.selectedImageData +")") // :(
                .height($("body").height());

        }.bind(this);

        reader.readAsDataURL(file);
    }

});

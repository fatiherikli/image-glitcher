var ImageGlitcher = $.Class.extend({

    glitchButtonSelector: null,
    workspaceSelector: null,

    acceptedTypes: ["image/jpg", "image/jpeg", "image/png", "image/gif"],

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

    preProcess: function (imageData, randomNumber) {
        return [
            imageData.substr(0, imageData.length / 2),
            imageData.substr((imageData.length / 2) - randomNumber, imageData.length / 2),
            imageData.substr(imageData.length / 2, imageData.length / 2)
        ].join("");
    },

    postProcess: function () {

    },

    glitch: function () {

        var image = $("<img>"),
            workspace = $(this.workspaceSelector);

        // glitch selected image
        var glitchedImageData = this.preProcess(
            this.selectedImageData,
            parseInt(Math.random() * (this.selectedImageData.length / 3)));

        image.attr("src", glitchedImageData);

        // attach the element to calculate with and height
        // of selected image. this is the easiest way.
        workspace.append(image);

        // create a canvas to apply selected filters
        var canvas = this.initializeCanvas(image);

        // apply filters
        this.postProcess(canvas);

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

        $(this.glitchButtonSelector).on('click', function () {
            this.glitch();
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

ImageGlitcher.Base64ImageGlitcher = $.Class.extend({
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
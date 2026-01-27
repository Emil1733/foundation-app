(function () {
    // Configuration
    var WIDGET_URL = "https://foundation-app-self.vercel.app/widget"; // Change to localhost:3000 for testing if needed
    var IFRAME_HEIGHT = "450px";
    var IFRAME_WIDTH = "100%";

    function init() {
        var containers = document.querySelectorAll('.foundation-risk-embed');

        containers.forEach(function (container) {
            // Prevent duplicate initialization
            if (container.getAttribute('data-loaded') === 'true') return;

            var iframe = document.createElement('iframe');
            iframe.src = WIDGET_URL;
            iframe.style.width = IFRAME_WIDTH;
            iframe.style.height = IFRAME_HEIGHT;
            iframe.style.border = "none";
            iframe.style.overflow = "hidden";
            iframe.title = "Foundation Risk Registry Soil Check";

            container.appendChild(iframe);
            container.setAttribute('data-loaded', 'true');
        });
    }

    // Auto-init if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // transform a specific query param text if needed later
})();

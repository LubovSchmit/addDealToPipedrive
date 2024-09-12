console.log('iframe.js loaded');

document.getElementById('dealForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    console.log('Form data:', data); // Проверьте данные формы перед отправкой

    window.parent.postMessage(data, '*');

    console.log('Sending message from iframe:', data);
});

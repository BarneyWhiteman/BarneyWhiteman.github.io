function send_email() {
	var subject = document.getElementById('subject').value;
	var body = document.getElementById('body').value;

	document.getElementById('subject').value = '';
	document.getElementById('body').value = '';

	window.open("mailto:barney@barneyw.net?subject=" + subject + "&body=" + body);
	window.location = "./thanks.html"
}
function send_email() {
	var subject = document.getElementById('subject').value;
	var body = document.getElementById('body').value;
	window.open("mailto:barney@barneyw.net?subject=" + subject + "&body=" + body);
}
$(function () {
	if (document.getElementById("error_message")) {
		var error_message = document.getElementById("error_message").textContent;
		swal({
			title: "ERROR",
			text: error_message,
			icon: "error",
		});
	}
});
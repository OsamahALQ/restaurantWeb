$(function () {
	if (document.getElementById("error_message")) {
		var error_message = document.getElementById("error_message").textContent;
		swal({
			title: "ERROR",
			text: error_message,
			icon: "error",
		}).then(function() {
      window.location = "/";
    });
	}

  if (document.getElementById("success_message")) {
		var success_message = document.getElementById("success_message").textContent;
		swal({
			title: "Success",
			text: success_message,
			icon: "success",
		}).then(function() {
      window.location = "/profile";
    });
	}
});
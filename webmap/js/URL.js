// Credit to M. Leahy/M. Luubert
define({
	// Converts relative paths to full URLs, including protocol-relative paths (e.g., "//services.arcgisonline.com/arcgis/rest/services/...")
	toFullURL: function(path) {
		aPath = path.split("//");
		if (aPath.length==1 || aPath[0].length===0) {
			// This is a relative path...since no "http://" or "https: was found.
			if (aPath.length==2 && aPath[0].length===0) {
				// This is a protocol-relative path...
				return document.location.protocol+"//"+aPath[1];
			}
			if (path.substr(0,1)=="/") {
				// This is a path that starts from the root of the current server - formulate a URL that includes the correct protocol, hostname, port, then the input path:
				return document.location.protocol+"//"+document.location.hostname+(document.location.port?":"+document.location.port:"")+path;
			} else {
				// This is a path that is relative to the current directory...convert it to a full path based on the current document location:
				aPathName = document.location.pathname.split("/");
				aPathName[aPathName.length-1]="";
				pathName = "/"+aPathName.join("/");
				return document.location.protocol+"//"+document.location.hostname+(document.location.port?":"+document.location.port:"")+pathName+path;
			}
		} else {
			// Return an absolute path:
			return aPath.join("//");
		}
	}
});
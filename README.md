eits
====

Eye in the Sky - A Mozilla Firefox browser extension for Cybernations that sends page source to a url for [redacted].


Usage
====
The default options do not include any data collection. Make sure you add a target url before turning on.

Options
====
Main
Enable debug logging: Check this to enable additional logging. It will fill the console a bit so only check if you need the extra information.
Disable SE Collection: Checking this will block sending anything for the SE domain
Disable TE Collection: Checking this will block sending anything for the TE domain
Exclusion Regex: This is fed to a new Regex object in javascript as a case sensitive regex of pathnames to ignore (so it does not include any query parameters etc). The default includes login.asp, so if you are not logged in, it will not send that.
SE Source URL: Only this domain will be sent for SE data collection. Default should work for normal use cases but can be changed for proxies.
SE Target URL: The endpoint to send the post request too.
TE Source URL: Only this domain will be sent for TE data collection. Default should work for normal use cases but can be changed for proxies.
TE Target URL: The endpoint to send the post request too.

Auth
Include Domain Cookie: Check this to send the domain cookie of the domain with the post request. For instance if you run authentication based on a forum login, you can include that cookie for that and have it authenticate.
Cookie URL: The url of the cookie to send. All contents are sent.
Include Basic Auth: Check this to include http basic auth header with the request. It will send the username and password below.
Username: Username to send with the basic auth request. Do not base64 encode.
Password: Password to send with the basic auth request. Do not base64 encode.

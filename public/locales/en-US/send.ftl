title = Send
importingFile = Importing…
encryptingFile = Encrypting…
decryptingFile = Decrypting…
downloadCount = { $num ->
        [one] 1 download
       *[other] { $num } downloads
    }
timespanHours = { $num ->
        [one] 1 hour
       *[other] { $num } hours
    }
copiedUrl = Copied!
unlockInputPlaceholder = Password
unlockButtonLabel = Unlock
downloadButtonLabel = Download
downloadFinish = Download complete
fileSizeProgress = ({ $partialSize } of { $totalSize })
sendYourFilesLink = Try Send
errorPageHeader = Something went wrong!
fileTooBig = That file is too big to upload. It should be less than { $size }
linkExpiredAlt = Link expired
notSupportedHeader = Your browser is not supported.
notSupportedLink = Why is my browser not supported?
deletePopupCancel = Cancel
deleteButtonHover = Delete
footerText = Not affiliated with Mozilla or Firefox.
footerLinkDonate = Donate
footerLinkCli = CLI
footerLinkDmca = DMCA
footerLinkSource = Source
passwordTryAgain = Incorrect password. Try again.
javascriptRequired = Send requires JavaScript
whyJavascript = Why does Send require JavaScript?
enableJavascript = Please enable JavaScript and try again.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }h { $minutes }m
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }m
# A short status message shown when the user enters a long password
maxPasswordLength = Maximum password length: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla

introTitle = Simple, private file sharing
introDescription = { -send-brand } lets you share files with end-to-end encryption and a link that automatically expires. So you can keep what you share private and make sure your stuff doesn’t stay online forever.
notifyUploadEncryptDone = Your file is encrypted and ready to send
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Expires after { $downloadCount } or { $timespan }
timespanMinutes = { $num ->
        [one] 1 minute
       *[other] { $num } minutes
    }
timespanDays = { $num ->
        [one] 1 day
       *[other] { $num } days
    }
fileCount = { $num ->
    [one] 1 file
   *[other] { $num } files
}
# byte abbreviation
bytes = B
# kibibyte abbreviation
kb = KB
# mebibyte abbreviation
mb = MB
# gibibyte abbreviation
gb = GB
# localized number and byte abbreviation. example "2.5MB"
fileSize = { $num }{ $units }
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
totalSize = Total size: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Copy the link to share your file:
copyLinkButton = Copy link
downloadTitle = Download files
downloadDescription = This file was shared via { -send-brand } with end-to-end encryption and a link that automatically expires.
trySendDescription = Try { -send-brand } for simple, safe file sharing.
# count will always be > 10
tooManyFiles = { $count ->
     [one] Only 1 file can be uploaded at a time.
    *[other] Only { $count } files can be uploaded at a time.
}
# count will always be > 10
tooManyArchives = { $count ->
     [one] Only 1 archive is allowed.
    *[other] Only { $count } archives are allowed.
}
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }d { $hours }h { $minutes }m
addFilesButton = Select files to upload
uploadButton = Upload
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Drag and drop files
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = or click to send up to { $size }
addPassword = Protect with password
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = OK
downloadingTitle = Downloading
noStreamsWarning = This browser might not be able to decrypt a file this big.
noStreamsOptionCopy = Copy the link to open in another browser
noStreamsOptionDownload = Continue with this browser
# the next line after the colon contains a file name
shareLinkDescription = Share the link to your file:
shareLinkButton = Share link
# $name is the name of the file
shareMessage = Download “{ $name }” with { -send-brand }: simple, safe file sharing


# Shown when the upload connection could not be opened at all, which usually
# means something between the user and the server is blocking it.
connectFailed = Could not open a connection to upload. Your network may be blocking it. Check your connection and try again.

# Shown when the server refuses a request because this connection has made too
# many in a short time.
rateLimited = Too many requests from your connection. Wait a moment, then try again.
# $seconds is how long the server asked us to wait
rateLimitedRetry = Too many requests from your connection. Try again in { $seconds } seconds.

# Shown when a share link no longer resolves. Replaces expiredTitle, which
# asserted a cause the server cannot know: the record is deleted the moment a
# file expires OR reaches its download limit, so by the time anyone asks, the
# two are the same absence.
linkUnavailableTitle = This link is no longer available. It may have expired, or reached its download limit.

# Replaces notSupportedDescription and notSupportedOutdatedDetail, which both
# named Firefox. This project is not affiliated with Mozilla, and pointing a
# Tor Browser user at another browser is bad advice.
notSupportedDetail = This browser does not support the web technology { -send-brand } needs to encrypt files in your browser. A current version of a major browser will work.
notSupportedUpdateDetail = This version of your browser does not support the web technology { -send-brand } needs. Updating it usually fixes this.
# Shown when the site itself is not served over a secure origin, so the browser
# withholds the encryption APIs. The cause is the site, not the browser.
insecureContextHeader = This site is not served securely.
insecureContextDetail = Browsers only allow the encryption { -send-brand } needs on a secure connection. This site is being served over plain HTTP, so it cannot encrypt anything. That is the site's configuration, not a problem with your browser.
# Shown above the choices offered when a file is too large for this browser to
# decrypt in memory.
noStreamsChooseDescription = Choose how you would like to continue.

# Accessible names for the two dropdowns in the "Expires after N downloads or T"
# sentence, which have no visible label of their own.
downloadCountSelectLabel = Number of downloads before the file expires
expiryTimeSelectLabel = Time before the file expires

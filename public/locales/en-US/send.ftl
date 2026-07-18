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
notSupportedOutdatedDetail = Unfortunately this version of Firefox does not support the web technology that powers Send. You’ll need to update your browser.
updateFirefox = Update Firefox
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
# A short status message shown when there was an error setting the password

## Send version 2 strings

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
expiredTitle = This link has expired.
notSupportedDescription = { -send-brand } will not work with this browser. { -send-short-brand } works best with the latest version of { -firefox }, and will work with the current version of most browsers.
downloadFirefox = Download { -firefox }
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
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
}
okButton = OK
downloadingTitle = Downloading
noStreamsWarning = This browser might not be able to decrypt a file this big.
noStreamsOptionCopy = Copy the link to open in another browser
noStreamsOptionFirefox = Try our favorite browser
noStreamsOptionDownload = Continue with this browser
# the next line after the colon contains a file name
shareLinkDescription = Share the link to your file:
shareLinkButton = Share link
# $name is the name of the file
shareMessage = Download “{ $name }” with { -send-brand }: simple, safe file sharing

sponsoredByThunderbird = Sponsored by Thunderbird

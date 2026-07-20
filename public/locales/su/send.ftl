title = Send
importingFile = Ngimpor...
encryptingFile = Ngénkripsi...
decryptingFile = Ngadékripsi...
downloadCount =
    { $num ->
       *[other] { $num } undeuran
    }
timespanHours =
    { $num ->
       *[other] { $num } jam
    }
copiedUrl = Ditiron!
unlockInputPlaceholder = Kecap sandi
unlockButtonLabel = Laan konci
downloadButtonLabel = Undeur
downloadFinish = Undeuran anggeus
fileSizeProgress = ({ $partialSize } ti { $totalSize })
sendYourFilesLink = Pecakan Send
errorPageHeader = Aya nu salah!
fileTooBig = Koropak unjalkeuneun badag teuing. Kudu kurang ti { $size }.
linkExpiredAlt = Tutumbu kadaluwarsa
notSupportedHeader = Panyungsi anjeun teu dirojong
notSupportedLink = Naha panyungsi kuring teu dirojong?
deletePopupCancel = Bolay
deleteButtonHover = Pupus
passwordTryAgain = Kecap sandi salah. Pecakan deui.
javascriptRequired = Send merlukeun JavaScript
whyJavascript = Naha Send merlukeun JavaScript?
enableJavascript = Prak hurungkeun JavaScript sarta pecakan deui.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }j { $minutes }m
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }m
# A short status message shown when the user enters a long password
maxPasswordLength = Panjang sandi maksimal: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Simpel, babagi koropak privat
introDescription = { -send-brand } migampang anjeun babagi koropak kalawan énkripsi tungtung-ka-tungtung sarta tutumbu nu otomatis kadaluwarsa. Sahingga anjeun bisa ngaraksa naon nu ku anjeun bagi sacara privat jeung mastikeun banda anjeun teu salawasna daring.
notifyUploadEncryptDone = Koropak anjeun kaénkripsi sarta siap dikirim.
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Kadaluwarsa sanggeu { $downloadCount } atawa { $timespan }
timespanMinutes =
    { $num ->
        [one] samenit
       *[other] { $num } menit
    }
timespanDays =
    { $num ->
        [one] sapoé
       *[other] { $num } poé
    }
fileCount =
    { $num ->
        [one] sakoropak
       *[other] { $num } koropak
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
totalSize = Ukuran total: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Tiron tutumbu pikeun babagi koropak anjeun:
copyLinkButton = Tiron tutumbu
downloadTitle = Undeur koropak
downloadDescription = Ieu koropak geus dibagikeun liwat { -send-brand } kalawan énkripsi tungtung-ka-tungtung sarta tutumbuna otomatis kadaluwarsa.
trySendDescription = Pecakan { -send-brand } pikeun simpelna, babagi koropak aman.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Ayeuna kur sakoropak nu bisa diunjal.
       *[other] Ngan { $count } koropak nu bisa diunjal sakaligus.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Ngan saarsip nu diidinan.
       *[other] Ngan { $count } arsip nu diidinan.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }p { $hours }j { $minutes }m
addFilesButton = Pilih koropak unjalkeuneun
uploadButton = Unjal
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Ésérkeun sarta ésotkeun koropak
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = atawa klik pikeun ngirim nika { $size }
addPassword = Piningan ku kecap sandi
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = OKÉH
downloadingTitle = Ngundeur
noStreamsWarning = Ieu panyungsi kawasna mah teu bisa ngadékrip koropak badag kieu.
noStreamsOptionCopy = Tiron tutumbu jang bukaeun di panyungsi séjén
noStreamsOptionDownload = Tuluykeun ku ieu panyungsi
# the next line after the colon contains a file name
shareLinkDescription = Bagikeun tutumbu ka koropak anjeun:
shareLinkButton = Bagikeun tutumbu
# $name is the name of the file
shareMessage = Undeur "{ $name }" ku { -send-brand }: simpel, babagi koropak aman
trailheadPromo = Aya cara pikeun ngamankeun privasi anjeun.  Jabung jeung Firefox.

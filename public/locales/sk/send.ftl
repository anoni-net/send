title = Send
importingFile = Importuje sa…
encryptingFile = Šifruje sa…
decryptingFile = Dešifruje sa…
downloadCount =
    { $num ->
        [one] 1 prevzatí
        [few] { $num } prevzatiach
       *[other] { $num } prevzatiach
    }
timespanHours =
    { $num ->
        [one] 1 hodine
        [few] { $num } hodinách
       *[other] { $num } hodinách
    }
copiedUrl = Skopírované!
unlockInputPlaceholder = Heslo
unlockButtonLabel = Odomknúť
downloadButtonLabel = Prevziať
downloadFinish = Preberanie bolo dokončené
fileSizeProgress = ({ $partialSize } z { $totalSize })
sendYourFilesLink = Vyskúšajte Send
errorPageHeader = Vyskytol sa problém.
fileTooBig = Súbor je príliš veľký. Mal by byť menší než { $size }.
linkExpiredAlt = Platnosť odkazu vypršala
notSupportedHeader = Váš prehliadač nie je podporovaný.
notSupportedLink = Prečo nie je môj prehliadač podporovaný?
deletePopupCancel = Zrušiť
deleteButtonHover = Odstrániť
passwordTryAgain = Nesprávne heslo. Skúste to znova.
javascriptRequired = Send vyžaduje JavaScript
whyJavascript = Prečo Send vyžaduje JavaScript?
enableJavascript = Prosím, povoľte JavaScript a skúste to znova.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours } hod. { $minutes } min.
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes } min.
# A short status message shown when the user enters a long password
maxPasswordLength = Maximálna dĺžka hesla: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Jednoduché a súkromné zdieľanie súborov
introDescription = S { -send-brand(case: "ins") } sú zdieľané súbory šifrované end-to-end, takže ani my nevieme, čo zdieľate. Platnosť odkazu je navyše obmedzená. Súbory tak môžete zdieľať súkromne a s istotou, že neostanú na internete naveky.
notifyUploadEncryptDone = Váš súbor je zašifrovaný a pripravený na odoslanie
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Platnosť odkazu vyprší po { $downloadCount } alebo po { $timespan }
timespanMinutes =
    { $num ->
        [one] 1 minúte
        [few] { $num } minútach
       *[other] { $num } minútach
    }
timespanDays =
    { $num ->
        [one] 1 dni
        [few] { $num } dňoch
       *[other] { $num } dňoch
    }
fileCount =
    { $num ->
        [one] 1 súbor
        [few] { $num } súbory
       *[other] { $num } súborov
    }
# byte abbreviation
bytes = B
# kibibyte abbreviation
kb = kB
# mebibyte abbreviation
mb = MB
# gibibyte abbreviation
gb = GB
# localized number and byte abbreviation. example "2.5MB"
fileSize = { $num } { $units }
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
totalSize = Celková veľkosť: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Súbor môžete zdieľať pomocou tohto odkazu:
copyLinkButton = Kopírovať odkaz
downloadTitle = Prevziať súbory
downloadDescription = Tento súbor bol zdieľaný prostredníctvom služby { -send-brand }, ktorá poskytuje end-to-end šifrovanie a odkazy s obmedzenou platnosťou.
trySendDescription = Vyskúšajte jednoduché a bezpečné zdieľanie súborov so službou { -send-brand }
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Naraz možno nahrávať len 1 súbor.
        [few] Naraz možno nahrávať len { $count } súbory.
       *[other] Naraz možno nahrávať len { $count } súborov.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Povolený je najviac 1 archív.
        [few] Povolené sú najviac { $count } archívy.
       *[other] Povolených je najviac { $count } archívov.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days } d { $hours } h { $minutes } min
addFilesButton = Vyberte súbory pre nahratie
uploadButton = Nahrať
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Pretiahnutím súboru alebo kliknutím sem
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = môžete poslať až { $size }
addPassword = Chrániť heslom
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = OK
downloadingTitle = Preberá sa
noStreamsWarning = Tento prehliadač nemusí byť schopný dešifrovať takto veľký súbor.
noStreamsOptionCopy = Skopírovať odkaz pre otvorenie v inom prehliadači
noStreamsOptionDownload = Pokračovať v tomto prehliadači
# the next line after the colon contains a file name
shareLinkDescription = Zdieľajte odkaz na súbor:
shareLinkButton = Zdieľať odkaz
# $name is the name of the file
shareMessage = Prevezmite si súbor „{ $name }“ so službou { -send-brand } - jednoduché a bezpečné zdieľanie súborov
trailheadPromo = Existuje spôsob, ako chrániť vaše súkromie. Prihláste sa do Firefoxu.

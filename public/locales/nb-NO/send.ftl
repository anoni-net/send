title = Send
importingFile = Importerer…
encryptingFile = Krypterer...
decryptingFile = Dekrypterer...
downloadCount =
    { $num ->
        [one] 1 nedlasting
       *[other] { $num } nedlastinger
    }
timespanHours =
    { $num ->
        [one] 1 time
       *[other] { $num } timer
    }
copiedUrl = Kopiert!
unlockInputPlaceholder = Passord
unlockButtonLabel = Lås opp
downloadButtonLabel = Last ned
downloadFinish = Nedlastingen er fullført.
fileSizeProgress = ({ $partialSize } av { $totalSize })
sendYourFilesLink = Prøv Send
errorPageHeader = Det oppstod en feil.
fileTooBig = Filen er for stor til å laste opp. Det må være mindre enn { $size }.
linkExpiredAlt = Lenke utløpt
notSupportedHeader = Din nettleser er ikke støttet.
notSupportedLink = Hvorfor er ikke nettleseren min støttet?
deletePopupCancel = Avbryt
deleteButtonHover = Slett
passwordTryAgain = Feil passord. Prøv igjen.
javascriptRequired = Send krever JavaScript.
whyJavascript = Hvorfor krever Send JavaScript?
enableJavascript = Slå på JavaScript og prøv igjen.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }t { $minutes }m
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }m
# A short status message shown when the user enters a long password
maxPasswordLength = Maksimum passordlengde: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Enkel, privat fildeling
introDescription = { -send-brand } lar deg dele filer via en tidsbegrenset lenke med ende-til-ende-kryptering. På den måten kan du dele filer privat og samtidig være trygg på at filene dine ikke blir liggende på nettet for alltid.
notifyUploadEncryptDone = Filen din er kryptert og klar til å sende
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Utløper etter { $downloadCount } eller { $timespan }
timespanMinutes =
    { $num ->
        [one] 1 minutt
       *[other] { $num } minutter
    }
timespanDays =
    { $num ->
        [one] 1 dag
       *[other] { $num } dager
    }
fileCount =
    { $num ->
        [one] 1 fil
       *[other] { $num } filer
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
totalSize = Total størrelse: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Kopier lenken for å dele filen din:
copyLinkButton = Kopier lenke
downloadTitle = Last ned filer
downloadDescription = Denne filen ble delt via { -send-brand } med ende-til-ende-kryptering og en lenke som automatisk utløper.
trySendDescription = Prøv { -send-brand } for enkel, sikker fildeling.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Kun 1 fil kan lastes opp om gangen.
       *[other] Kun { $count } filer kan lastes opp om gangen.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Kun 1 arkiv er tillatt.
       *[other] Kun { $count } arkiver er tillatt.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }d { $hours }t { $minutes }m
addFilesButton = Velg filer du vil laste opp
uploadButton = Last opp
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Dra og slipp filer
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = eller klikk for å sende filer på opptil { $size }
addPassword = Beskytt med passord
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = OK
downloadingTitle = Laster ned
noStreamsWarning = Denne nettleseren kan kanskje ikke dekryptere en så stor fil.
noStreamsOptionCopy = Kopier lenken for å åpne den i en annen nettleser
noStreamsOptionDownload = Fortsett med denne nettleseren
# the next line after the colon contains a file name
shareLinkDescription = Del lenken til filen din:
shareLinkButton = Del lenke
# $name is the name of the file
shareMessage = Last ned ‹{ $name }› med { -send-brand }: enkel, trygg fildeling
trailheadPromo = Det finnes en måte å ta vare på personvernet ditt. Bruk Firefox.

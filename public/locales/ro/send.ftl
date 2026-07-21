title = Send
importingFile = Se importă…
encryptingFile = Se criptează…
decryptingFile = Se decriptează…
downloadCount =
    { $num ->
        [one] 1 descărcare
        [few] { $num } descărcări
       *[other] { $num } de descărcări
    }
timespanHours =
    { $num ->
        [one] 1 oră
        [few] { $num } ore
       *[other] { $num } de ore
    }
copiedUrl = Copiat!
unlockInputPlaceholder = Parolă
unlockButtonLabel = Deblochează
downloadButtonLabel = Descarcă
downloadFinish = Descărcare încheiată
fileSizeProgress = ({ $partialSize } din { $totalSize })
sendYourFilesLink = Încearcă Send
errorPageHeader = Ceva nu a funcționat!
fileTooBig = Acest fișier este prea mare. Ar trebuie să fie sub { $size }.
linkExpiredAlt = Link expirat
notSupportedHeader = Browserul tău nu este suportat.
notSupportedLink = De ce browserul meu nu este suportat?
deletePopupCancel = Renunță
deleteButtonHover = Șterge
passwordTryAgain = Parolă incorectă. Încearcă din nou.
javascriptRequired = Send necesită JavaScript
whyJavascript = De ce Send necesită JavaScript?
enableJavascript = Te rugăm să reactivezi JavaScript și să încerci din nou.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }h { $minutes }m
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }m
# A short status message shown when the user enters a long password
maxPasswordLength = Lungime minimă a parolei: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Partajare de fișiere simplă și privată
introDescription = { -send-brand } îți permite să partajezi fișiere cu criptare capăt-la-capăt și un link care expiră automat. Deci, poți păstra confidențial ceea ce partajezi și te poți asigura că ce ai partajat nu rămâne online pentru totdeauna.
notifyUploadEncryptDone = Fișierul tău este criptat și gata de trimitere
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Expiră după { $downloadCount } sau { $timespan }
timespanMinutes =
    { $num ->
        [one] 1 minut
        [few] { $num } minute
       *[other] { $num } de minute
    }
timespanDays =
    { $num ->
        [one] 1 zi
        [few] { $num } zile
       *[other] { $num } de zile
    }
fileCount =
    { $num ->
        [one] 1 fișier
        [few] { $num } fișiere
       *[other] { $num } de fișiere
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
totalSize = Mărime totală: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Copiază linkul pentru partajarea fișierului:
copyLinkButton = Copiază linkul
downloadTitle = Descarcă fișierele
downloadDescription = Acest fișier a fost partajat prin { -send-brand }, cu criptare capăt-la-capăt și un link care expiră automat.
trySendDescription = Încearcă { -send-brand } pentru o partajare simplă și sigură a fișierelor.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Numai 1 fișier poate fi încărcat simultan.
        [few] Numai { $count } fișiere pot fi încărcate simultan.
       *[other] Numai { $count } de fișiere pot fi încărcate simultan.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Numai 1 arhivă este permisă.
        [few] Numai { $count } arhive sunt permise.
       *[other] Numai { $count } de arhive sunt permise.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }z { $hours }h { $minutes }m
addFilesButton = Selectează fișierele pentru încărcare
uploadButton = Încarcă
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Trage și plasează fișierele
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = sau dă clic pentru a trimite până la { $size }
addPassword = Protejează cu parolă
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = Ok
downloadingTitle = Se descarcă
noStreamsWarning = Este posibil ca acest browser să nu poată decripta un fișier atât de mare.
noStreamsOptionCopy = Copiază linkul pentru a-l deschide într-un alt browser
noStreamsOptionDownload = Continuă cu acest browser
# the next line after the colon contains a file name
shareLinkDescription = Partajează linkul către fișier:
shareLinkButton = Partajează linkul
# $name is the name of the file
shareMessage = Descarcă „{ $name }” cu { -send-brand }: partajare simplă și sigură a fișierelor
trailheadPromo = Există o modalitate de a-ți proteja viața privată. Folosește Firefox.
footerText = Neafiliat cu Mozilla sau Firefox.
footerLinkDonate = Donează
footerLinkCli = CLI
footerLinkDmca = DMCA
footerLinkSource = Cod sursă

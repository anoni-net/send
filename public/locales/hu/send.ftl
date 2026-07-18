title = Send
importingFile = Importálás…
encryptingFile = Titkosítás…
decryptingFile = Visszafejtés…
downloadCount =
    { $num ->
        [one] 1 letöltés
       *[other] { $num } letöltés
    }
timespanHours =
    { $num ->
        [one] 1 óra
       *[other] { $num }  óra
    }
copiedUrl = Másolva!
unlockInputPlaceholder = Jelszó
unlockButtonLabel = Feloldás
downloadButtonLabel = Letöltés
downloadFinish = A letöltés befejeződött
fileSizeProgress = ({ $partialSize } / { $totalSize })
sendYourFilesLink = Próbálja ki a Sendet
errorPageHeader = Hiba történt!
fileTooBig = Ez a fájl túl nagy a feltöltéshez. Kevesebb mint { $size } kell legyen.
linkExpiredAlt = A hivatkozás lejárt
notSupportedHeader = A böngésző nem támogatott.
notSupportedLink = Miért nem támogatott a böngészőm?
notSupportedOutdatedDetail = Sajnos a Firefox ezen verziója nem támogatja a Send alapját képező technológiát. Frissítenie kell a böngészőjét.
updateFirefox = Firefox frissítése
deletePopupCancel = Mégse
deleteButtonHover = Törlés
passwordTryAgain = Helytelen jelszó. Próbálja meg újra.
javascriptRequired = A Sendhez JavaScript szükséges
whyJavascript = Miért van szükség JavaScriptre a Sendhez?
enableJavascript = Kérjük engedélyezze a JavaScriptet, majd próbálkozzon újra.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }ó { $minutes }p
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }p
# A short status message shown when the user enters a long password
maxPasswordLength = Maximális jelszóhossz: { $length }
# A short status message shown when there was an error setting the password

## Send version 2 strings

-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Egyszerű, privát fájlmegosztás
introDescription = A { -send-brand }del végpontok közötti titkosítással oszthat meg fájlokat, a hivatkozások pedig automatikusan lejárnak. Így bizalmasan tarthatja azt, amit megoszt, és biztosíthatja, hogy a dolgok nem maradnak örökre online.
notifyUploadEncryptDone = A fájl titkosítva és készen áll a küldésre
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = { $downloadCount } vagy { $timespan } után elévül
timespanMinutes =
    { $num ->
        [one] 1 perc
       *[other] { $num } perc
    }
timespanDays =
    { $num ->
        [one] 1 nap
       *[other] { $num } nap
    }
fileCount =
    { $num ->
        [one] 1 fájl
       *[other] { $num } fájl
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
fileSize = { $num } { $units }
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
totalSize = Teljes méret: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Másolja a hivatkozást a fájl megosztásához:
copyLinkButton = Hivatkozás másolása
downloadTitle = Fájlok letöltése
downloadDescription = Ez a fájl a { -send-brand } szolgáltatással lett megosztva, végpontok közötti titkosítással, és a hivatkozás automatikusan elévül.
trySendDescription = Próbálja ki a { -send-brand }et az egyszerű, biztonságos fájlmegosztásért.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Egyszerre csak 1 fájl tölthető fel.
       *[other] Egyszerre csak { $count } fájl tölthető fel.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Csak 1 archívum engedélyezett.
       *[other] Csak { $count } archívum engedélyezett.
    }
expiredTitle = Ez a hivatkozás elévült.
notSupportedDescription = A { -send-brand } nem működik ebben a böngészőben. A { -send-short-brand } a { -firefox } legfrissebb verziójával működik a legjobban, de működik a legtöbb böngésző aktuális verziójával is.
downloadFirefox = A { -firefox } letöltése
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }n { $hours }ó { $minutes }p
addFilesButton = Válassza ki a feltöltendő fájlokat
uploadButton = Feltöltés
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Húzza ide a fájlokat
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = vagy jelentkezzen be, és küldjön legfeljebb { $size }-ot
addPassword = Jelszavas védelem
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = OK
downloadingTitle = Letöltés
noStreamsWarning = Előfordulhat, hogy a böngésző nem fog tudni visszafejteni egy ekkora fájlt.
noStreamsOptionCopy = Másolja a hivatkozást, és nyissa meg egy másik böngészőben
noStreamsOptionFirefox = Próbálja ki a kedvenc böngészőnket
noStreamsOptionDownload = Folytatás ezzel a böngészővel
# the next line after the colon contains a file name
shareLinkDescription = Ossza meg a fájlja hivatkozását:
shareLinkButton = Hivatkozás megosztása
# $name is the name of the file
shareMessage = „{ $name }” letöltése a { -send-brand } segítségével: egyszerű, biztonságos fájlmegosztás
trailheadPromo = Védje meg a magánszféráját. Csatlakozzon a Firefoxhoz.

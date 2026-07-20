title = Send
importingFile = Importerar…
encryptingFile = Krypterar…
decryptingFile = Avkodar…
downloadCount =
    { $num ->
        [one] 1 nedladdning
       *[other] { $num } nedladdningar
    }
timespanHours =
    { $num ->
        [one] 1 timme
       *[other] { $num } timmar
    }
copiedUrl = Kopierad!
unlockInputPlaceholder = Lösenord
unlockButtonLabel = Lås upp
downloadButtonLabel = Ladda ner
downloadFinish = Nedladdning klar
fileSizeProgress = ({ $partialSize } av { $totalSize })
sendYourFilesLink = Testa Send
errorPageHeader = Något gick fel!
fileTooBig = Den filen är för stor för att ladda upp. Det ska vara mindre än { $size }.
linkExpiredAlt = Länk upphörd
notSupportedHeader = Din webbläsare stöds inte.
notSupportedLink = Varför stöds inte min webbläsare?
deletePopupCancel = Avbryt
deleteButtonHover = Ta bort
passwordTryAgain = Felaktigt lösenord. Försök igen.
javascriptRequired = Send kräver JavaScript
whyJavascript = Varför kräver Send JavaScript?
enableJavascript = Aktivera JavaScript och försök igen.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }t { $minutes }m
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }m
# A short status message shown when the user enters a long password
maxPasswordLength = Maximal lösenordslängd: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Enkel, privat fildelning
introDescription = { -send-brand } låter dig dela filer med end-to-end-kryptering och en länk som automatiskt upphör. Så att du kan behålla det du delar privat och se till att dina saker inte stannar online för alltid.
notifyUploadEncryptDone = Din fil är krypterad och redo att skickas
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Förfaller efter { $downloadCount } eller { $timespan }
timespanMinutes =
    { $num ->
        [one] 1 minut
       *[other] { $num } minuter
    }
timespanDays =
    { $num ->
        [one] 1 dag
       *[other] { $num } dagar
    }
fileCount =
    { $num ->
        [one] 1 fil
       *[other] { $num } filer
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
fileSize = { $num }{ $units }
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
totalSize = Total storlek: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Kopiera länken för att dela din fil:
copyLinkButton = Kopiera länk
downloadTitle = Ladda ner filer
downloadDescription = Den här filen delades via { -send-brand } med end-to-end-kryptering och en länk som automatiskt upphör.
trySendDescription = Prova { -send-brand } för enkel, säker fildelning.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Endast 1 fil  kan laddas upp i taget.
       *[other] Endast { $count } filer kan laddas upp i taget.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Endast 1 arkiv är tillåten.
       *[other] Endast { $count } arkiv är tillåtna.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }d { $hours }t { $minutes }m
addFilesButton = Välj filer som ska laddas upp
uploadButton = Ladda upp
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Dra och släpp filer
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = eller klicka för att skicka upp till { $size }
addPassword = Skydda med lösenord
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = OK
downloadingTitle = Laddar ner
noStreamsWarning = Den här webbläsaren kanske inte kan dekryptera en så stor fil.
noStreamsOptionCopy = Kopiera länken för att öppna i en annan webbläsare
noStreamsOptionDownload = Fortsätt med den här webbläsaren
# the next line after the colon contains a file name
shareLinkDescription = Dela länken till din fil:
shareLinkButton = Dela länk
# $name is the name of the file
shareMessage = Ladda ner "{ $name }" med { -send-brand }: enkel, säker fildelning
trailheadPromo = Det finns ett sätt att skydda din integritet. Gå med i Firefox.

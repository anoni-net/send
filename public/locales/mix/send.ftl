title = Send
importingFile = Ndakiin…
encryptingFile = Ndasami tu'un…
decryptingFile = Nchiko tu'un…
downloadCount =
    { $num ->
        [one] 1 snuú
       *[other] { $num } snuú
    }
timespanHours =
    { $num ->
        [one] 1 hora
       *[other] { $num } horas
    }
copiedUrl = ¡Tsa ndatavi ña!
unlockInputPlaceholder = Tu'un seè
unlockButtonLabel = Kuna
downloadButtonLabel = Snuù
downloadFinish = Ntsinu snui
fileSizeProgress = ({ $partialSize } ña { $totalSize })
sendYourFilesLink = Kuachu'un Send
errorPageHeader = ¡Yee ña va'a!
fileTooBig = Kanu tutu yo. Tsini ñu'u koi tana { $size }.
linkExpiredAlt = Ntoo enlace
notSupportedHeader = Kue ku kuni página.
notSupportedLink = ¿Chanu kue ku kuncheuña?
deletePopupCancel = Kunchatu
deleteButtonHover = Stoò
passwordTryAgain = Kue vaa ni chau sivi siki. Chai tuku.
javascriptRequired = Send tsiniñui JavaScript
whyJavascript = ¿Chanu Send tsiniñui JavaScript?
enableJavascript = Saá ña mani katsi JavaScript chá kitsa tuku.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }h { $minutes }m
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }m
# A short status message shown when the user enters a long password
maxPasswordLength = Kua tu'un see: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Stucha kue tutu ku
introDescription = { -send-brand } ku stuchaku tutu seé tsi inkana tsi iin enlace ña ntóo mituin. Sa'an ku kunka va'a ña stuchaku cha ma ku kunchee na kue tutu ku.
notifyUploadEncryptDone = Tsa inka va'a tutu ku tsa ku stuchaku ña
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Ku kunkai mancha { $downloadCount } a { $timespan }
timespanMinutes =
    { $num ->
        [one] 1 minuto
       *[other] { $num } minutos
    }
timespanDays =
    { $num ->
        [one] 1 kii
       *[other] { $num } kii
    }
fileCount =
    { $num ->
        [one] 1 tutu
       *[other] { $num } tutu
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
totalSize = Kua: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Ndatava enlace takua stuchaku tutú.
copyLinkButton = Ndatava enlace
downloadTitle = Snuú tutu
downloadDescription = Tutu yo stuchaku ña tsi { -send-brand } inka si'i chá ku nto'o mituin.
trySendDescription = Kuachu'un { -send-brand } takua stuchaku nchi tutu niku
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Ku skau 1 tutu ni.
       *[other] Mitu'un { $count }tutu ku skau.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] 1 tutu ni ku.
       *[other] Mitu'un { $count } tutu ni ku.
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }d { $hours }h { $minutes }m
addFilesButton = Katsi tutu ku skau
uploadButton = Skaa
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Xita cha sia kue tutu
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = katavi takua stuchaku ña mancha { $size }
addPassword = Inka vai tsi tu'un seé
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = Vaá
downloadingTitle = Snuì
noStreamsWarning = Ku ña navegador yo ma ku mini iin tutú kanu.
noStreamsOptionCopy = Ndatava enlace takua kunu tsí inka navegador
noStreamsOptionDownload = Kunka tsi navegador yo
# the next line after the colon contains a file name
shareLinkDescription = Stucha enlace tutu ku:
shareLinkButton = Stucha Enlace
# $name is the name of the file
shareMessage = Snuu «{ $name }» tsi { -send-brand }: kue nchichi
trailheadPromo = Ku china vau ña chau. Kita'an tsi Firefox.

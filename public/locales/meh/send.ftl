title = Send
importingFile = Nasia´a…
encryptingFile = Encriptando...
decryptingFile = Desencriptando…
downloadCount =
    { $num ->
       *[other] { $num } nxinuun
    }
timespanHours =
    { $num ->
        [one] 1 hora
       *[other] { $num } horas
    }
copiedUrl = Ntɨɨn
unlockInputPlaceholder = Contraseña
unlockButtonLabel = Nkasɨ
downloadButtonLabel = Xinuu
downloadFinish = Nnɨ´ɨ xinuu
fileSizeProgress = ({ $partialSize } de { $totalSize })
sendYourFilesLink = Ni´i Send
errorPageHeader = ¡Iyo iin ntu nkene va´a!
fileTooBig = Archivo ya´a ka´nu. Nejia chunku´va { $size }
linkExpiredAlt = Nnɨ´ɨ enlace
notSupportedHeader = Ntu íyo tiñu nuu ka̱a̱ nánuku ya´a.
notSupportedLink = ¿Navi ntu satiñu nuu ka̱a̱ nánuku ya´a?
deletePopupCancel = Nkuvi-ka
deleteButtonHover = Xita
passwordTryAgain = Contraseña ntu vatu. Nachu´un tuku.
javascriptRequired = Send ni´i JavaScript
whyJavascript = ¿Navi Send ni´i JavaScript?
enableJavascript = Kua´a jia´a JavaScript jee nachu´un tuku.
# A short representation of a countdown timer containing the number of hours and minutes remaining as digits, example "13h 47m"
expiresHoursMinutes = { $hours }h { $minutes }m
# A short representation of a countdown timer containing the number of minutes remaining as digits, example "56m"
expiresMinutes = { $minutes }m
# A short status message shown when the user enters a long password
maxPasswordLength = Naja ka´nu koo contraseña: { $length }


-send-brand = Send
-send-short-brand = Send
-firefox = Firefox
-mozilla = Mozilla
introTitle = Kua´a daa archivo ñama jee yu´u
introDescription = { -send-brand } taji jia´anu archivos jii cifrado uvi nuu jee iin enlace nɨ´ɨ. Sukuan kuvi kumi yu´unu daa archivo jia´anu jee kuninu nkino daa ya´a kue´e kuiya íchi nuu.
notifyUploadEncryptDone = Archivo noo´o íyo cifrado jee kuvi chu´un íchi
# downloadCount is from the downloadCount string and timespan is a timespanMinutes string. ex. 'Expires after 2 downloads or 25 minutes'
archiveExpiryInfo = Nɨ'ɨ dee nña´a { $downloadCount } a xiin { $timespan }
timespanMinutes =
    { $num ->
        [one] 1 minuto
       *[other] { $num } minutos
    }
timespanDays =
    { $num ->
        [one] 1 día
       *[other] { $num } días
    }
fileCount =
    { $num ->
        [one] 1 archivo
       *[other] { $num } archivos
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
totalSize = Ka´nu: { $size }
# the next line after the colon contains a file name
copyLinkDescription = Tɨɨn enlace jee kua´a archivo:
copyLinkButton = Tɨɨn enlacae
downloadTitle = Xinuu archivo
downloadDescription = Archivo ya´a nsajia { -send-brand } jíí cifrado punto a punto jee iin enlace naa.
trySendDescription = Nasá´á jii { -send-brand } kua´a ñama jee vatu.
# count will always be > 10
tooManyFiles =
    { $count ->
        [one] Ntuxini 1 archivo kuvi ska.
       *[other] Ntuxini { $count } archivos kuvi ska.
    }
# count will always be > 10
tooManyArchives =
    { $count ->
        [one] Ntu xini 1 archivo íyo
       *[other] Ntu xini { $count } archivos íyo
    }
# A short representation of a countdown timer containing the number of days, hours, and minutes remaining as digits, example "2d 11h 56m"
expiresDaysHoursMinutes = { $days }d { $hours }h { $minutes }m
addFilesButton = Kaji archivos ska
uploadButton = Ska
# the first part of the string 'Drag and drop files or click to send up to 1GB'
dragAndDropFiles = Staka jee sía  daa archivo
# the second part of the string 'Drag and drop files or click to send up to 1GB'
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
orClickWithSize = a xiin kuaxin saa chu´un íchi nee { $size }
addPassword = Iyo yu´u jii contraseña
# $size is the size of the file, displayed using the fileSize message as format (e.g. "2.5MB")
okButton = Kuvi
downloadingTitle = Xinuu
noStreamsWarning = Kuvi ka̱a̱ nánaku ya´a nxituvi a vaji nuu iin archivo ka´nu.
noStreamsOptionCopy = Tɨɨn enlace jee síne nuu inka ka̱a̱ nánuku
noStreamsOptionDownload = Kaka jii ka̱a̱ nánuku ya´a
# the next line after the colon contains a file name
shareLinkDescription = Kua´a enlace archivo noo´o
shareLinkButton = Kua´a link
# $name is the name of the file
shareMessage = Xinuu “{ $name }” jii { -send-brand }: ntu viji
trailheadPromo = Iyo iin kuvi kumi privacidad noo´o. Nayonika Firefox.
